from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    BorrowBookView,
    ReserveBookView,
    ReturnBookView,
    BorrowedBooksView,
    BookListView,
    BookDetailView,
    UserReservationsView,
    BookSearchView,
    DashboardView,
    register_user,
    MyTokenObtainPairView,
    UserListView,
    BorrowRequestView,  # New endpoint for borrow requests
)

urlpatterns = [
    # Book-related endpoints
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('books/<int:book_id>/borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('books/<int:book_id>/reserve/', ReserveBookView.as_view(), name='reserve_book'),
    path('books/<int:borrowed_book_id>/return/', ReturnBookView.as_view(), name='return_book'),
    path('books/borrowed/', BorrowedBooksView.as_view(), name='borrowed_books'),
    path('search/', BookSearchView.as_view(), name='book_search'),

    # Reservations & Dashboard
    path('reservations/', UserReservationsView.as_view(), name='user_reservations'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Borrow Request endpoints
    path('books/<int:book_id>/borrow-request/', BorrowRequestView.as_view(), name='borrow_request'),
    path('borrow-request/<int:request_id>/', BorrowRequestView.as_view(), name='process_borrow_request'),

    # User management & Authentication
    path('users/', UserListView.as_view(), name='user_list'),
    path('auth/register/', register_user, name='register_user'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
