import { useState } from "react"

import api from "@/api/client"

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)

    try {
      await api.get("/spotify/logout/")
    } catch {
      // Continue with the client-side redirect even if the request fails.
    } finally {
      window.location.assign("/")
    }
  }

  return (
    <button onClick={handleLogout} disabled={loggingOut}>
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  )
}