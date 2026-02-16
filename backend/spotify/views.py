from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .services.oauth import build_login_url, exchange_code_for_token
from .services.tokens import save_tokens
from .services.auth import (
    SpotifyAPIError,
    SpotifyAuthError,
    require_access_token,
    spotify_get_or_raise,
)


class SpotifyAuthAPIView(APIView):
    def get_access_token(self, request):
        try:
            return require_access_token(request.session), None
        except SpotifyAuthError as exc:
            return None, Response(
                {"detail": str(exc)},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    def spotify_get(self, access_token, path):
        try:
            return spotify_get_or_raise(access_token, path), None
        except SpotifyAPIError as exc:
            return None, Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )


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
            return redirect("http://127.0.0.1:5173/login?error=spotify")

        token_data = exchange_code_for_token(
            code,
            settings.SPOTIFY_CLIENT_ID,
            settings.SPOTIFY_CLIENT_SECRET,
            settings.SPOTIFY_REDIRECT_URI,
        )

        save_tokens(request.session, token_data)
        return redirect("http://127.0.0.1:5173/app")
    

class SpotifyMeView(SpotifyAuthAPIView):
    def get(self, request):
        access_token, error_response = self.get_access_token(request)
        if error_response:
            return error_response

        profile, error_response = self.spotify_get(access_token, "/me")
        if error_response:
            return error_response

        return Response(profile, status=status.HTTP_200_OK)