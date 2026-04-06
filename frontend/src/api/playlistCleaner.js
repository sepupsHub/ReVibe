import api from "@/api/client"

export async function getUnaddedSongs() {
  const response = await api.get("/playlist_cleaner/unadded_songs")
  return response.data
}

export async function getCleanedPlaylists() {
  const response = await api.get("/playlist_cleaner/cleaned_playlists")
  return response.data
}

export async function addUnaddedSongsToPlaylist(playlistId, songs) {
  const response = await api.post("/playlist_cleaner/add_unadded_to_playlist/", {
    playlist_id: playlistId,
    songs,
  })
  return response.data
}

export async function addSelectedSongsToPlaylists(assignments) {
  const response = await api.post("/playlist_cleaner/add_selected_to_playlists/", {
    assignments,
  })
  return response.data
}

export async function getLibraryManagerSongs() {
  const response = await api.get("/playlist_cleaner/library_manager_songs/")
  return response.data
}

export async function updateLibraryManagerSong(songId, targetPlaylistIds, currentPlaylistIds) {
  const response = await api.post("/playlist_cleaner/library_manager_update_song/", {
    song_id: songId,
    target_playlist_ids: targetPlaylistIds,
    current_playlist_ids: currentPlaylistIds,
  })
  return response.data
}
