from spotify.services.auth import spotify_delete_or_raise

from .add_songs import add_songs_to_playlist
from .fetch_playlists import fetch_all_songs, fetch_liked_songs, fetch_writable_playlists


def fetch_saved_songs_with_playlists(access_token):
    saved_songs = fetch_liked_songs(access_token)
    playlist_songs = fetch_all_songs(access_token)
    writable_playlists = fetch_writable_playlists(access_token)

    writable_by_id = {
        playlist["id"]: playlist
        for playlist in writable_playlists["playlists"]
        if playlist.get("id")
    }

    song_to_playlists = {}
    for song in playlist_songs["songs"]:
        song_id = song.get("id")
        if not song_id:
            continue

        playlists = []
        for playlist in song.get("playlists", []):
            playlist_id = playlist.get("id")
            if playlist_id in writable_by_id:
                playlists.append(writable_by_id[playlist_id])

        song_to_playlists[song_id] = playlists

    enriched_songs = []
    for song in saved_songs["songs"]:
        song_id = song.get("id")
        playlist_memberships = song_to_playlists.get(song_id, [])
        enriched_song = {
            **song,
            "playlists": playlist_memberships,
        }
        enriched_songs.append(enriched_song)

    return {
        "songs": enriched_songs,
        "total_songs": len(enriched_songs),
    }


def _remove_song_from_playlist(access_token, playlist_id, song_id):
    spotify_delete_or_raise(
        access_token,
        f"/playlists/{playlist_id}/tracks",
        payload={
            "tracks": [
                {"uri": f"spotify:track:{song_id}"},
            ]
        },
    )


def update_saved_song_playlists(access_token, song_id, target_playlist_ids, current_playlist_ids):
    target_set = {
        playlist_id
        for playlist_id in target_playlist_ids
        if isinstance(playlist_id, str) and playlist_id
    }
    current_set = {
        playlist_id
        for playlist_id in current_playlist_ids
        if isinstance(playlist_id, str) and playlist_id
    }

    writable_playlists = fetch_writable_playlists(access_token)
    writable_ids = {
        playlist["id"]
        for playlist in writable_playlists["playlists"]
        if playlist.get("id")
    }

    target_set = target_set.intersection(writable_ids)
    current_set = current_set.intersection(writable_ids)

    to_remove = sorted(current_set - target_set)
    to_add = sorted(target_set - current_set)

    for playlist_id in to_remove:
        _remove_song_from_playlist(access_token, playlist_id, song_id)

    add_results = {}
    for playlist_id in to_add:
        add_results[playlist_id] = add_songs_to_playlist(access_token, playlist_id, [song_id])

    added_count = sum(result.get("added_count", 0) for result in add_results.values())

    return {
        "song_id": song_id,
        "added_to": to_add,
        "removed_from": to_remove,
        "added_count": added_count,
    }
