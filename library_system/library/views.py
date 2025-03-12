from datetime import timedelta, datetime
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Book, Reservation, BorrowedBook
from .serializers import (
    BookSerializer, ReservationSerializer, UserSerializer,
    MyTokenObtainPairSerializer, BorrowedBookSerializer
)
from library_system.tasks import send_borrow_email

User = get_user_model()

# Custom Token View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- Borrow/Reserve/Return Books ---

class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        user_role = request.user.role.lower()

        # If librarian, allow issuing to any user
        if user_role == "librarian":
            user_id = request.data.get("user_id")
            if not user_id:
                return Response({"error": "User ID is required for librarians."}, status=400)
            target_user = get_object_or_404(User, id=user_id)
        else:
            target_user = request.user

        if book.available_copies <= 0:
            return Response({'message': f"No available copies of '{book.title}'."}, status=400)

        due_date_str = request.data.get("due_date")
        try:
            if due_date_str:
                due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
            else:
                due_date = now() + timedelta(days=14)
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        borrowed_book = BorrowedBook.objects.create(
            user=target_user,
            book=book,
            borrowed_at=now(),
            due_date=due_date
        )

        send_borrow_email.apply_async(
            args=[target_user.email, book.title, borrowed_book.due_date.strftime("%Y-%m-%d")]
        )

        return Response({
            'message': f"Book '{book.title}' issued to {target_user.username} successfully!",
            'due_date': borrowed_book.due_date.strftime('%Y-%m-%d')
        }, status=201)

class ReserveBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        if book.available_copies > 0:
            return Response({'message': f"Book '{book.title}' is available for borrowing. Please borrow it instead."}, status=400)
        reservation = Reservation.objects.create(
            book=book,
            user=request.user,
            status='pending',
            reserved_at=now()
        )
        return Response({
            'message': f"Book '{book.title}' reserved successfully! Your reservation ID: {reservation.id}"
        })

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, borrowed_book_id):
        # Only librarians or admins can return books
        user_role = request.user.role.lower()
        if user_role not in ["librarian", "admin"]:
            return Response(
                {"detail": "Only librarians or admins can return books."},
                status=status.HTTP_403_FORBIDDEN
            )

        # If user is librarian/admin, fetch the BorrowedBook record
        borrowed_book = get_object_or_404(BorrowedBook, id=borrowed_book_id)

        if borrowed_book.returned_at is not None:
            return Response({"message": "Book already returned."}, status=status.HTTP_400_BAD_REQUEST)

        borrowed_book.return_book()
        return Response({
            "message": f"Book '{borrowed_book.book.title}' returned successfully! Fine: {borrowed_book.fine_amount}"
        })

class BorrowedBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role.lower() == "librarian":
            borrowed_books = BorrowedBook.objects.filter(returned_at__isnull=True)
        else:
            borrowed_books = BorrowedBook.objects.filter(user=request.user, returned_at__isnull=True)
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response({'borrowed_books': serializer.data})

# --- Books, Dashboard, Reservations, etc. ---

class BookListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        books = Book.objects.filter(quantity__gt=0)
        serializer = BookSerializer(books, many=True)
        return Response({'available_books': serializer.data})

class BookDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        serializer = BookSerializer(book)
        return Response({'book': serializer.data})

class UserReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservations = Reservation.objects.filter(user=request.user)
        serializer = ReservationSerializer(reservations, many=True)
        return Response({'reservations': serializer.data})

class BookSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        title = request.GET.get('title', '')
        author = request.GET.get('author', '')
        isbn = request.GET.get('isbn', '')
        books = Book.objects.filter(
            title__icontains=title,
            author__icontains=author,
            isbn__icontains=isbn
        )
        serializer = BookSerializer(books, many=True)
        return Response({'books': serializer.data})

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_books = Book.objects.count()
        borrowed_books = BorrowedBook.objects.filter(returned_at__isnull=True).count()
        overdue_books = BorrowedBook.objects.filter(returned_at__isnull=True, due_date__lt=now()).count()
        most_borrowed_books = Book.objects.order_by('-quantity')[:5]
        serialized_books = BookSerializer(most_borrowed_books, many=True).data
        return Response({
            'total_books': total_books,
            'borrowed_books': borrowed_books,
            'overdue_books': overdue_books,
            'most_borrowed_books': serialized_books,
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({"error": "All fields are required."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data, status=201)

# --- User List View for Admins/Librarians ---
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Optionally, restrict to librarians/admins:
        if request.user.role.lower() not in ["librarian", "admin"]:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response({'users': serializer.data})
