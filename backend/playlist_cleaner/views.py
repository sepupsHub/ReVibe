from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services.fetch_playlists import (
    fetch_all_playlists,
    fetch_all_songs,
    fetch_liked_songs,
    fetch_writable_playlists,
)
from .services.detect_duplicates import detect_duplicates, detect_unadded_songs
from .services.add_songs import add_songs_to_playlist, add_song_assignments
from .services.library_manager import (
    fetch_saved_songs_with_playlists,
    update_saved_song_playlists,
)
from spotify.views import SpotifyAuthAPIView
from spotify.services.auth import SpotifyAPIError

class FetchPlaylistsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            clean_playlists = fetch_writable_playlists(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(clean_playlists, status=status.HTTP_200_OK)
    
class AllSongsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            songs = fetch_all_songs(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(songs, status=status.HTTP_200_OK)
    
class PlaylistDuplicatesView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            duplicates = detect_duplicates(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(duplicates, status=status.HTTP_200_OK)
    
class SavedSongsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            saved_songs = fetch_liked_songs(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(saved_songs, status=status.HTTP_200_OK)
    
class UnaddedSongsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            unadded_songs = detect_unadded_songs(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(unadded_songs, status=status.HTTP_200_OK)


class AddUnaddedSongsToPlaylistView(SpotifyAuthAPIView):
    def post(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        playlist_id = request.data.get("playlist_id")
        songs = request.data.get("songs")

        if not playlist_id:
            return Response(
                {"detail": "playlist_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(songs, list):
            return Response(
                {"detail": "songs must be an array"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        song_ids = [song.get("id") for song in songs if isinstance(song, dict)]

        try:
            result = add_songs_to_playlist(access_token, playlist_id, song_ids)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)


class AddSelectedSongsToPlaylistsView(SpotifyAuthAPIView):
    def post(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        assignments = request.data.get("assignments")

        if not isinstance(assignments, list):
            return Response(
                {"detail": "assignments must be an array"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = add_song_assignments(access_token, assignments)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)


class LibraryManagerSongsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            saved_songs = fetch_saved_songs_with_playlists(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(saved_songs, status=status.HTTP_200_OK)


class UpdateSavedSongPlaylistsView(SpotifyAuthAPIView):
    def post(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        song_id = request.data.get("song_id")
        target_playlist_ids = request.data.get("target_playlist_ids")
        current_playlist_ids = request.data.get("current_playlist_ids")

        if not song_id:
            return Response(
                {"detail": "song_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(target_playlist_ids, list):
            return Response(
                {"detail": "target_playlist_ids must be an array"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(current_playlist_ids, list):
            return Response(
                {"detail": "current_playlist_ids must be an array"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = update_saved_song_playlists(
                access_token,
                song_id,
                target_playlist_ids,
                current_playlist_ids,
            )
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result, status=status.HTTP_200_OK)