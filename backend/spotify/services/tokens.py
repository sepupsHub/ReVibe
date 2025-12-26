from django.conf import settings
from .oauth import refresh_access_token
import time

def save_tokens(session, token_data):
    session["spotify"] = {
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
        "expires_at": int(time.time()) + token_data["expires_in"],
    }
    session.modified = True


def get_tokens(session):
    return session.get("spotify")


def is_expired(tokens):
    if not tokens or "expires_at" not in tokens:
        return True
    return tokens["expires_at"] -60 <= int(time.time())


def refresh_tokens(session, tokens):
    refreshed = refresh_access_token(
        refresh_token=tokens["refresh_token"],
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
    )

    tokens["access_token"] = refreshed["access_token"]
    tokens["expires_at"] = int(time.time()) + refreshed["expires_in"]

    session["spotify"] = tokens
    session.modified = True

    return tokens


def get_valid_access_token(session):
    tokens = get_tokens(session)

    if not tokens:
        return None

    if is_expired(tokens):
        tokens = refresh_tokens(session, tokens)

    return tokens["access_token"]