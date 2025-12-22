import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}