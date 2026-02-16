import requests

from .client import spotify_get
from .tokens import get_valid_access_token


class SpotifyAuthError(Exception):
    pass


class SpotifyAPIError(Exception):
    pass


def require_access_token(session):
    access_token = get_valid_access_token(session)
    if not access_token:
        raise SpotifyAuthError("Not authenticated with Spotify")
    return access_token


def spotify_get_or_raise(access_token, path, params=None):
    try:
        return spotify_get(access_token, path, params=params)
    except requests.RequestException as exc:
        raise SpotifyAPIError("Failed to fetch Spotify data") from exc
