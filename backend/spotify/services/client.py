import requests

SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"


def spotify_get(access_token, endpoint, params=None):
    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.get(
        f"{SPOTIFY_API_BASE_URL}{endpoint}",
        headers=headers,
        params=params,
    )

    response.raise_for_status()
    return response.json()


def spotify_post(access_token, endpoint, payload=None):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        f"{SPOTIFY_API_BASE_URL}{endpoint}",
        headers=headers,
        json=payload,
    )

    response.raise_for_status()
    if response.content:
        return response.json()
    return {}