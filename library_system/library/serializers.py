from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, BorrowedBook, Reservation

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class BookSerializer(serializers.ModelSerializer):
    available_copies = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'is_borrowed', 'borrowed_by', 'due_date', 'quantity', 'available_copies']

    def get_available_copies(self, obj):
        # Return the property computed in the model
        return obj.available_copies

class BorrowedBookSerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source="book.title")
    user_name = serializers.ReadOnlyField(source="user.username")
    
    class Meta:
        model = BorrowedBook
        fields = ['id', 'user', 'user_name', 'book', 'book_title', 'borrowed_at', 'due_date', 'returned_at', 'fine_amount']

class ReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source="book.title")
    user_name = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'user_name', 'book', 'book_title', 'reserved_at', 'status']
