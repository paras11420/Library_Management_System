from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Library Management System!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('library.urls')),  # All API URLs start with /api/
    path('', home),  # Optional: A simple home page
]
