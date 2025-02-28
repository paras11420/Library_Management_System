from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .models import Book, Reservation, BorrowedBook
from .serializers import BookSerializer, ReservationSerializer, UserSerializer
from library_system.tasks import send_borrow_email

User = get_user_model()

class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)
        if book.available_copies <= 0:
            return Response({'message': f"No available copies of '{book.title}'."}, status=400)
        borrowed_book = BorrowedBook.objects.create(
            user=request.user,
            book=book,
            borrowed_at=now(),
            due_date=now() + timedelta(days=14)
        )
        send_borrow_email.apply_async(
            args=[request.user.email, book.title, borrowed_book.due_date.strftime("%Y-%m-%d")]
        )
        return Response({
            'message': f"Book '{book.title}' borrowed successfully! Due date: {borrowed_book.due_date.strftime('%Y-%m-%d')}"
        })

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

class BookListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        books = Book.objects.filter(quantity__gt=0)
        serializer = BookSerializer(books, many=True)
        return Response({'available_books': serializer.data})

class BookDetailView(APIView):
    permission_classes = [IsAuthenticated]

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
        return Response({
            'total_books': total_books,
            'borrowed_books': borrowed_books,
            'overdue_books': overdue_books,
            'most_borrowed_books': most_borrowed_books,
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    if request.method == 'POST':
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not username or not email or not password:
            return Response({"error": "All fields are required."}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data, status=201)
