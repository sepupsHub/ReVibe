from .fetch_playlists import fetch_all_songs

def detect_duplicates(access_token):
    duplicates = []
    songs = fetch_all_songs(access_token)
    
    for song in songs:
        playlists = song["playlists"]
        if len(playlists) < 2:
            continue
        
        duplicates.append(song)
        
    return duplicates