import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import ProtectedRoute from "@/routes/ProtectedRoute"

import Home from "@/pages/Home"
import Landing from "@/pages/Landing"

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is authenticated by calling the /me/ endpoint
        fetch("http://127.0.0.1:8000/api/spotify/me/", {
            credentials: "include",
        })
            .then((res) => {
                if (res.ok) {
                    setIsAuthenticated(true)
                } else {
                    setIsAuthenticated(false)
                }
            })
            .catch(() => {
                setIsAuthenticated(false)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/app" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
