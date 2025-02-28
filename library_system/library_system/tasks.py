from celery import shared_task  
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.utils.timezone import now
from library.models import BorrowedBook  
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_borrow_email(user_email, book_title, due_date):
    subject = 'Book Borrowed Confirmation'
    message = f'You have borrowed "{book_title}". The due date for return is {due_date}.'
    from_email = settings.DEFAULT_FROM_EMAIL
    try:
        send_mail(subject, message, from_email, [user_email], fail_silently=False)
        return f'Borrow confirmation email sent to {user_email}'
    except BadHeaderError:
        logger.error("Invalid header detected for %s", user_email)
        return 'Invalid email header detected'
    except Exception as e:
        logger.error("Error sending email to %s: %s", user_email, str(e))
        return f'Error sending email: {str(e)}'

@shared_task
def send_overdue_notifications():
    overdue_books = BorrowedBook.objects.filter(
        due_date__lt=now(), returned=False
    ).select_related("user", "book")
    count = 0
    for record in overdue_books:
        if record.user and record.user.email:
            subject = 'Overdue Book Reminder'
            message = f'The book "{record.book.title}" is overdue. Please return it as soon as possible.'
            from_email = settings.DEFAULT_FROM_EMAIL
            try:
                send_mail(subject, message, from_email, [record.user.email], fail_silently=False)
                count += 1
            except BadHeaderError:
                logger.warning("Invalid header for email %s", record.user.email)
                continue
            except Exception as e:
                logger.error("Error sending overdue email to %s: %s", record.user.email, str(e))
                continue
    return f'Sent {count} overdue reminders'
