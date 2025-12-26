from django.urls import path
from .views import SpotifyLoginView, SpotifyCallbackView

urlpatterns = [
    path("login/", SpotifyLoginView.as_view()),
    path("callback/", SpotifyCallbackView.as_view()),
]