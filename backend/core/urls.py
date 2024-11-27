from django.contrib import admin
from django.urls import path, include
from authentication import urls
from oauth import urls
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path


urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/', include('api.urls')),
	path('api/oauth2/', include('oauth.urls')),
    path('api/rooms/', include('pongMulti.urls')),
    path('api/auth/', include('authentication.urls')),
    
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
