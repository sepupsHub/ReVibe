from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services.fetch_playlists import fetch_all_playlists
from spotify.views import SpotifyAuthAPIView
from spotify.services.auth import SpotifyAPIError

class FetchPlaylistsView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        try:
            clean_playlists = fetch_all_playlists(access_token)
        except SpotifyAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(clean_playlists, status=status.HTTP_200_OK)