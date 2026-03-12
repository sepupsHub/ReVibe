import { useEffect, useState } from "react"
import { getMe } from "@/api/spotify"

function useMe() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadMe() {
      try {
        const data = await getMe()
        if (isMounted) {
          setUser(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMe()

    return () => {
      isMounted = false
    }
  }, [])

  return { user, loading, error }
}

export default useMe
