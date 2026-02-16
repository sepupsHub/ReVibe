from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from spotify.services.tokens import get_valid_access_token
from spotify.services.client import spotify_get
from .services.fetch_playlists import fetch_all_playlists

class FetchPlaylistsView(APIView):
    def get(self, request):
        access_token = get_valid_access_token(request.session)
        
        if not access_token:
            return Response(
                {"detail": "Not authenticated with Spotify"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            
        try:
            playlists = spotify_get(access_token, "/me/playlists")
            clean_playlists = []
            for item in playlists["items"]:
                clean_playlists.append({
                    "id": item["id"],
                    "name": item["name"]
                })
        except Exception:
            return Response(
                {"detail": "Failed to fetch Spotify profile"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(clean_playlists, status=status.HTTP_200_OK)