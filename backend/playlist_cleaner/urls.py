from django.urls import path
from .views import FetchPlaylistsView, AllSongsView, PlaylistDuplicatesView

urlpatterns = [
    path("cleaned_playlists/", FetchPlaylistsView.as_view()),
    path("playlist_songs/", AllSongsView.as_view()),
    path("duplicates/", PlaylistDuplicatesView.as_view()),
]