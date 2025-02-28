from django.db import models
from django.utils.timezone import now, timedelta
from django.contrib.auth.models import AbstractUser

def now_plus_14_days():
    return now() + timedelta(days=14)

default_due_date = now_plus_14_days

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('librarian', 'Librarian'),
        ('member', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')

    def __str__(self):
        return f"{self.username} ({self.role})"

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    is_borrowed = models.BooleanField(default=False)
    borrowed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return self.title

    @property
    def available_copies(self):
        # Calculate available copies as total quantity minus currently borrowed copies
        from .models import BorrowedBook  # local import to avoid circular import issues
        return self.quantity - BorrowedBook.objects.filter(book=self, returned_at__isnull=True).count()

    @property
    def total_copies(self):
        return self.quantity

class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrowed_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(default=now_plus_14_days)
    returned_at = models.DateTimeField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if not self.pk:
            if self.book.available_copies > 0:
                self.book.quantity -= 1
                self.book.save()
            else:
                raise ValueError("No copies available for borrowing.")
        super().save(*args, **kwargs)

    def return_book(self):
        self.returned_at = now()
        overdue_days = max(0, (self.returned_at - self.due_date).days)
        self.fine_amount = overdue_days * 5
        self.book.quantity += 1
        self.book.save()
        super().save(update_fields=['returned_at', 'fine_amount'])

    def __str__(self):
        return f"{self.user} borrowed {self.book} (Due: {self.due_date}, Returned: {self.returned_at or 'Not Returned'})"

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    book = models.ForeignKey(Book, related_name="reservations", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reserved_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reservation for {self.book.title} by {self.user.username}"
