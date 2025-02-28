from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    BorrowBookView,
    ReserveBookView,
    BookListView,
    BookDetailView,
    UserReservationsView,
    BookSearchView,
    DashboardView,
    register_user,
)

urlpatterns = [
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('books/<int:book_id>/borrow/', BorrowBookView.as_view(), name='borrow_book'),
    path('books/<int:book_id>/reserve/', ReserveBookView.as_view(), name='reserve_book'),
    path('reservations/', UserReservationsView.as_view(), name='user_reservations'),
    path('search/', BookSearchView.as_view(), name='book_search'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('auth/register/', register_user, name='register_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
