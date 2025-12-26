from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services.oauth import build_login_url, exchange_code_for_token
from .services.tokens import save_tokens, get_valid_access_token
from .services.client import spotify_get


class SpotifyLoginView(APIView):
    def get(self, request):
        url = build_login_url(
            settings.SPOTIFY_CLIENT_ID,
            settings.SPOTIFY_REDIRECT_URI,
            settings.SPOTIFY_SCOPES,
        )
        return redirect(url)


class SpotifyCallbackView(APIView):
    def get(self, request):
        code = request.GET.get("code")
        
        if not code:
            return redirect("http://localhost:5173/login?error=spotify")

        token_data = exchange_code_for_token(
            code,
            settings.SPOTIFY_CLIENT_ID,
            settings.SPOTIFY_CLIENT_SECRET,
            settings.SPOTIFY_REDIRECT_URI,
        )

        save_tokens(request.session, token_data)
        return redirect("http://localhost:5173/app")
    

class SpotifyMeView(APIView):
    def get(self, request):
        access_token = get_valid_access_token(request.session)

        if not access_token:
            return Response(
                {"detail": "Not authenticated with Spotify"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            profile = spotify_get(access_token, "/me")
        except Exception:
            return Response(
                {"detail": "Failed to fetch Spotify profile"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(profile, status=status.HTTP_200_OK)