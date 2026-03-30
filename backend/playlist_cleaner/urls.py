from django.urls import path
from .views import (
    FetchPlaylistsView,
    AllSongsView,
    PlaylistDuplicatesView,
    SavedSongsView,
    UnaddedSongsView,
    AddUnaddedSongsToPlaylistView,
    AddSelectedSongsToPlaylistsView,
)

urlpatterns = [
    path("cleaned_playlists/", FetchPlaylistsView.as_view()),
    path("playlist_songs/", AllSongsView.as_view()),
    path("duplicates/", PlaylistDuplicatesView.as_view()),
    path("saved_songs/", SavedSongsView.as_view()),
    path("unadded_songs/", UnaddedSongsView.as_view()),
    path("add_unadded_to_playlist/", AddUnaddedSongsToPlaylistView.as_view()),
    path("add_selected_to_playlists/", AddSelectedSongsToPlaylistsView.as_view()),
]