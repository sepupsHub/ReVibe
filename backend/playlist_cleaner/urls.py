from django.urls import path
from .views import FetchPlaylistsView, AllSongsView, PlaylistDuplicatesView, SavedSongsView, UnaddedSongsView

urlpatterns = [
    path("cleaned_playlists/", FetchPlaylistsView.as_view()),
    path("playlist_songs/", AllSongsView.as_view()),
    path("duplicates/", PlaylistDuplicatesView.as_view()),
    path("saved_songs/", SavedSongsView.as_view()),
    path("unadded_songs/", UnaddedSongsView.as_view()),
]