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
