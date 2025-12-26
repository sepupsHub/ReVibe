import requests
from urllib.parse import urlencode

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


def build_login_url(client_id, redirect_uri, scopes):
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": " ".join(scopes),
    }
    return f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"


def exchange_code_for_token(code, client_id, client_secret, redirect_uri):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
    }

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        data=data,
        auth=(client_id, client_secret),
    )
    response.raise_for_status()
    return response.json()


def refresh_access_token(refresh_token, client_id, client_secret):
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        data=data,
        auth=(client_id, client_secret),
    )
    response.raise_for_status()
    return response.json()