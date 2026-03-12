import api from "@/api/client"

export async function getMe() {
    const response = await api.get("/spotify/me/")
    return response.data
}