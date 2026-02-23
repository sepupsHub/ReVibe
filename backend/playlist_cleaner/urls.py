from django.urls import path
from .views import FetchPlaylistsView, AllSongsView

urlpatterns = [
    path("cleaned_playlists/", FetchPlaylistsView.as_view()),
    path("songs/", AllSongsView.as_view())
]