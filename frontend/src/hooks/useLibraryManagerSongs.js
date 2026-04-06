import { useState } from "react"
import { getLibraryManagerSongs } from "@/api/playlistCleaner"

function useLibraryManagerSongs() {
  const [librarySongs, setLibrarySongs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchLibrarySongs() {
    setLoading(true)
    setError(null)

    try {
      const data = await getLibraryManagerSongs()
      setLibrarySongs(data)
      return data
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { librarySongs, loading, error, fetchLibrarySongs, setLibrarySongs }
}

export default useLibraryManagerSongs
