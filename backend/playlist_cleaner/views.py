from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..spotify.services.tokens import get_valid_access_token
from .services.fetch_playlists import fetch_all_playlists

class FetchPlaylists(APIView):
    def get(self, request):
        access_token = get_valid_access_token(request.session)
        
        if not access_token:
            return Response(
                {"detail": "Not authenticated with Spotify"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            
        try:
            playlists = fetch_all_playlists(access_token)
        except Exception:
            return Response(
                {"detail": "Failed to fetch Spotify profile"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(playlists, status=status.HTTP_200_OK)