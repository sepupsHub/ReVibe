import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "@/routes/ProtectedRoute"

import Home from "@/pages/Home"
import Landing from "@/pages/Landing"

function App() {
    const isAuthenticated = false

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
