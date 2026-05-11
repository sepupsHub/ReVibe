from django.urls import path
from .views import SpotifyLoginView, SpotifyCallbackView, SpotifyMeView, SpotifyLogoutView

urlpatterns = [
    path("login/", SpotifyLoginView.as_view()),
    path("callback/", SpotifyCallbackView.as_view()),
    path("me/", SpotifyMeView.as_view()),
    path("logout/", SpotifyLogoutView.as_view()),
]