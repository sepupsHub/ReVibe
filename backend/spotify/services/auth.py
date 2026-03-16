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
    except requests.HTTPError as exc:
        response = exc.response
        if response is None:
            raise SpotifyAPIError("Spotify request failed") from exc

        message = f"Spotify API error {response.status_code}"
        try:
            payload = response.json()
            spotify_error = payload.get("error", {})
            if isinstance(spotify_error, dict):
                detail = spotify_error.get("message") or spotify_error.get("reason")
                if detail:
                    message = f"{message}: {detail}"
            elif spotify_error:
                message = f"{message}: {spotify_error}"
        except ValueError:
            text = response.text.strip()
            if text:
                message = f"{message}: {text}"

        raise SpotifyAPIError(message) from exc
    except requests.RequestException as exc:
        raise SpotifyAPIError("Failed to fetch Spotify data") from exc
