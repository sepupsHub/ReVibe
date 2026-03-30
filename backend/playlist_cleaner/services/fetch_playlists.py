from urllib.parse import urlparse

from spotify.services.auth import spotify_get_or_raise


def _spotify_next_to_endpoint(next_url):
    parsed = urlparse(next_url)
    endpoint = parsed.path
    if endpoint.startswith("/v1"):
        endpoint = endpoint[3:]
    if parsed.query:
        endpoint = f"{endpoint}?{parsed.query}"
    return endpoint


def _fetch_user_playlists(access_token, writable_only=False):
    me = spotify_get_or_raise(access_token, "/me")
    current_user_id = me.get("id")

    path = "/me/playlists"
    params = {
        "fields": "items(id,name,owner(id),collaborative),next",
        "limit": "50",
    }

    clean_playlists = []
    new_playlists = spotify_get_or_raise(access_token, path, params)

    while new_playlists:
        for item in new_playlists.get("items", []):
            owner_id = (item.get("owner") or {}).get("id")
            collaborative = bool(item.get("collaborative"))

            if writable_only and not (owner_id == current_user_id or collaborative):
                continue

            clean_playlists.append({
                "id": item.get("id"),
                "name": item.get("name"),
            })

        if not new_playlists.get("next"):
            break

        path = _spotify_next_to_endpoint(new_playlists["next"])
        new_playlists = spotify_get_or_raise(access_token, path)

    return {
        "playlists": clean_playlists,
        "total_playlists": len(clean_playlists),
    }


def fetch_writable_playlists(access_token):
    return _fetch_user_playlists(access_token, writable_only=True)

def fetch_all_playlists(access_token):
    return _fetch_user_playlists(access_token, writable_only=False)

def fetch_all_songs(access_token):
    playlists = fetch_all_playlists(access_token)
    params = {
        "fields": "items(track(name,id)),next",
    }
    songs = []
    data = dict()
    song_storage_dict = dict()
    total_songs = 0
    
    for playlist in playlists["playlists"]:
        path = f"/playlists/{playlist['id']}/items"
        new_songs = spotify_get_or_raise(access_token, path, params)
        while new_songs:
            
            for song in new_songs["items"]:
                song_info = song["track"]
                if not song_info: continue
                if song_info["id"] in song_storage_dict:
                    position = song_storage_dict[song_info["id"]]
                    song_info = songs[position]
                    song_info["playlists"].append(playlist)
                    continue
                
                song_info["playlists"] = [playlist]
                songs.append(song_info)
                song_storage_dict[song_info["id"]] = total_songs
                total_songs += 1
                
            if not new_songs["next"]: break
            path = _spotify_next_to_endpoint(new_songs["next"])
            new_songs = spotify_get_or_raise(access_token, path, params)
            
    data["songs"] = songs
    data["total_songs"] = total_songs
    return data

def fetch_liked_songs(access_token):
    songs = []
    path = "/me/tracks"
    data = dict()
    params = {
        "fields": "items(track(name,id, artists(id, name), album(images))),next",
        "limit": "50",
    }
    
    new_songs = spotify_get_or_raise(access_token, path, params)
    
    while new_songs:
            
        for song in new_songs["items"]:
            song_info = song["track"]
            if not song_info: continue
                
            songs.append(song_info)
                
        if not new_songs["next"]: break
        path = _spotify_next_to_endpoint(new_songs["next"])
        new_songs = spotify_get_or_raise(access_token, path, params)
    
    data["songs"] = songs
    data["total_songs"] = len(songs)
    
    return data