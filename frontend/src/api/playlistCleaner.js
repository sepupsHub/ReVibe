import api from "@/api/client"

export async function getUnaddedSongs() {
  const response = await api.get("/playlist_cleaner/unadded_songs")
  return response.data
}
