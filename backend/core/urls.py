from django.contrib import admin
from django.urls import path, include
from authentication import urls
from oauth import urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
	path('oauth2/', include('oauth.urls'))
]
