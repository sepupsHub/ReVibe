import requests

SPOTIFY_PLAYLISTS_URL = "https://api.spotify.com/v1/me/playlists/"

def fetch_all_playlists(access_token):
    headers = {
        "Authorization: Bearer " + access_token
    }
    
    response = requests.get(
        SPOTIFY_PLAYLISTS_URL,
        headers=headers
    )
    response.raise_for_status()
    return response.json()