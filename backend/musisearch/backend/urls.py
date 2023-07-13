from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from knox import views as knox_views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'chats', views.ChatViewSet, basename="chat")
router.register(r'messages', views.MessageViewSet, basename="message")
router.register(r'profiles', views.ProfileViewSet, basename="profile")
router.register(r'users', views.UserViewSet, basename="user")
router.register(r'block', views.ProfileBlockedMapViewSet, basename="block")
router.register(r'pictures', views.PictureViewSet, basename="picture")
router.register(r'tracks', views.TrackViewSet, basename="track")

urlpatterns = [
    path('', include(router.urls)),
    path(r'auth/login/', views.LoginView.as_view(), name='knox_login'),
    path(r'auth/logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'auth/logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]
