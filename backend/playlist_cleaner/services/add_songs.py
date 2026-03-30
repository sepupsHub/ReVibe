from urllib.parse import urlparse

from spotify.services.auth import spotify_get_or_raise, spotify_post_or_raise


def _spotify_next_to_endpoint(next_url):
    parsed = urlparse(next_url)
    endpoint = parsed.path
    if endpoint.startswith("/v1"):
        endpoint = endpoint[3:]
    if parsed.query:
        endpoint = f"{endpoint}?{parsed.query}"
    return endpoint


def fetch_playlist_track_ids(access_token, playlist_id):
    track_ids = set()
    endpoint = f"/playlists/{playlist_id}/tracks?fields=items(track(id)),next&limit=100"

    while endpoint:
        payload = spotify_get_or_raise(access_token, endpoint)

        for item in payload.get("items", []):
            track = item.get("track") if isinstance(item, dict) else None
            track_id = track.get("id") if isinstance(track, dict) else None
            if track_id:
                track_ids.add(track_id)

        next_url = payload.get("next")
        endpoint = _spotify_next_to_endpoint(next_url) if next_url else None

    return track_ids


def add_songs_to_playlist(access_token, playlist_id, track_ids):
    clean_track_ids = []
    seen_track_ids = set()
    for track_id in track_ids:
        if not track_id or track_id in seen_track_ids:
            continue
        clean_track_ids.append(track_id)
        seen_track_ids.add(track_id)

    existing_track_ids = fetch_playlist_track_ids(access_token, playlist_id)
    to_add_track_ids = [track_id for track_id in clean_track_ids if track_id not in existing_track_ids]
    skipped_existing_track_ids = [
        track_id for track_id in clean_track_ids if track_id in existing_track_ids
    ]

    uris = [f"spotify:track:{track_id}" for track_id in to_add_track_ids]

    if not uris:
        return {
            "playlist_id": playlist_id,
            "snapshot_ids": [],
            "added_count": 0,
            "skipped_existing_count": len(skipped_existing_track_ids),
            "requested_count": len(clean_track_ids),
        }

    snapshot_ids = []

    # Spotify recommends sending max 100 items per request
    for index in range(0, len(uris), 100):
        chunk = uris[index:index + 100]
        response = spotify_post_or_raise(
            access_token,
            f"/playlists/{playlist_id}/tracks",
            payload={"uris": chunk},
        )
        snapshot_id = response.get("snapshot_id")
        if snapshot_id:
            snapshot_ids.append(snapshot_id)

    return {
        "playlist_id": playlist_id,
        "snapshot_ids": snapshot_ids,
        "added_count": len(uris),
        "skipped_existing_count": len(skipped_existing_track_ids),
        "requested_count": len(clean_track_ids),
    }


def add_song_assignments(access_token, assignments):
    playlist_to_track_ids = {}
    selected_song_count = 0

    for assignment in assignments:
        if not isinstance(assignment, dict):
            continue

        song_id = assignment.get("song_id")
        playlist_ids = assignment.get("playlist_ids", [])

        if not song_id or not isinstance(playlist_ids, list):
            continue

        clean_playlist_ids = []
        for playlist_id in playlist_ids:
            if isinstance(playlist_id, str) and playlist_id:
                clean_playlist_ids.append(playlist_id)

        if clean_playlist_ids:
            selected_song_count += 1

        for playlist_id in set(clean_playlist_ids):
            if playlist_id not in playlist_to_track_ids:
                playlist_to_track_ids[playlist_id] = []
            playlist_to_track_ids[playlist_id].append(song_id)

    results = {}
    total_add_operations = 0
    total_skipped_existing = 0

    for playlist_id, song_ids in playlist_to_track_ids.items():
        result = add_songs_to_playlist(access_token, playlist_id, song_ids)
        results[playlist_id] = result
        total_add_operations += result["added_count"]
        total_skipped_existing += result["skipped_existing_count"]

    return {
        "playlists_updated": len([item for item in results.values() if item["added_count"] > 0]),
        "playlists_targeted": len(results),
        "songs_selected": selected_song_count,
        "total_add_operations": total_add_operations,
        "total_skipped_existing": total_skipped_existing,
        "results": results,
    }
