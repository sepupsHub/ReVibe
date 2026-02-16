from spotify.services.auth import spotify_get_or_raise

def fetch_all_playlists(access_token):
    playlists = spotify_get_or_raise(access_token, "/me/playlists")
    
    clean_playlists = []
    for item in playlists["items"]:
        clean_playlists.append({
            "id": item["id"],
            "name": item["name"]
        })
        
    return clean_playlists