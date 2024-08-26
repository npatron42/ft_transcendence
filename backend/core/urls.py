from django.contrib import admin
from django.urls import path, include
from authentication import urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')),
]
