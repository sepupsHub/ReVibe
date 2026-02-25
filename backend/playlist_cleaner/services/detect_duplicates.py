from .fetch_playlists import fetch_all_songs, fetch_liked_songs

def detect_duplicates(access_token):
    duplicates = []
    data = dict()
    songs = fetch_all_songs(access_token)
    
    for song in songs["songs"]:
        playlists = song["playlists"]
        if len(playlists) < 2:
            continue
        
        duplicates.append(song)
        
    data["duplicates"] = duplicates
    data["total_duplicates"] = len(duplicates)
    return data

def detect_unadded_songs(access_token):
    data = dict()
    saved_songs = fetch_liked_songs(access_token)
    playlist_songs = fetch_all_songs(access_token)
    
    playlist_song_ids = {song["id"] for song in playlist_songs["songs"]}
    unadded_songs = [
        song for song in saved_songs["songs"]
        if song["id"] not in playlist_song_ids
    ]
    
    data["songs"] = unadded_songs
    data["total_songs"] = len(unadded_songs)
    return data