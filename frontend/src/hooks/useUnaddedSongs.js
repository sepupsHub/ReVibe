import { useState } from "react"
import { getUnaddedSongs } from "@/api/playlistCleaner"

function useUnaddedSongs() {
  const [unadded, setUnadded] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchUnadded() {
    setLoading(true)
    setError(null)

    try {
      const data = await getUnaddedSongs()
      setUnadded(data)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { unadded, loading, error, fetchUnadded }
}

export default useUnaddedSongs
