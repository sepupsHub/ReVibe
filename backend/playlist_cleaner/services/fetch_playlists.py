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

def fetch_all_songs(access_token):
    playlists = fetch_all_playlists(access_token)
    params = {
        "fields": "items(track(name,id))",
    }
    songs = []
    song_storage_dict = dict()
    total_songs = 0
    
    for playlist in playlists:
        new_songs = spotify_get_or_raise(
            access_token,
            f"/playlists/{playlist["id"]}/items",
            params
        )
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
            
    songs.append(total_songs)
    return songs

    