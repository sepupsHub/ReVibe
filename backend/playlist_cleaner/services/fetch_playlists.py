from spotify.services.auth import spotify_get_or_raise
URL_OFFSET = 26

def fetch_all_playlists(access_token):
    playlists = spotify_get_or_raise(access_token, "/me/playlists")
    clean_playlists = []
    data = dict()
    for item in playlists["items"]:
        clean_playlists.append({
            "id": item["id"],
            "name": item["name"]
        })
        
    data["playlists"] = clean_playlists
    data["total_playlists"] = len(playlists)
    return data

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
        path = f"/playlists/{playlist["id"]}/items"
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
            path = new_songs["next"][URL_OFFSET:]
            new_songs = spotify_get_or_raise(access_token, path, params)
            
    data["songs"] = songs
    data["total_songs"] = total_songs
    return data

def fetch_liked_songs(access_token):
    songs = []
    path = "/me/tracks"
    data = dict()
    params = {
        "fields": "items(track(name,id)),next",
        "limit": "50",
    }
    
    new_songs = spotify_get_or_raise(access_token, path, params)
    
    while new_songs:
            
        for song in new_songs["items"]:
            song_info = song["track"]
            if not song_info: continue
                
            songs.append(song_info)
                
        if not new_songs["next"]: break
        path = new_songs["next"][URL_OFFSET:]
        new_songs = spotify_get_or_raise(access_token, path, params)
    
    data["songs"] = songs
    data["total_songs"] = len(songs)
    
    return data