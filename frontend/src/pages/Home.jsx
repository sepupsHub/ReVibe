import useMe from "@/hooks/useMe"
import useUnaddedSongs from "@/hooks/useUnaddedSongs"
import SongItem from "@/components/UnaddedSongItem"

function Home() {
  const { user, loading, error } = useMe()
  const {
    unadded,
    loading: unaddedLoading,
    error: unaddedError,
    fetchUnadded,
  } = useUnaddedSongs()
  const songs = Array.isArray(unadded?.songs) ? unadded.songs : []

  if (loading) return <p>Loading...</p>

  if (error) {
    return <p>Could not load your Spotify profile.</p>
  }

  return (
    <div>
      <h1>Hello {user?.display_name ?? "there"}</h1>

      <button onClick={fetchUnadded} disabled={unaddedLoading}>
        {unaddedLoading ? "Loading..." : "Unadded endpoint"}
      </button>

      {unaddedError ? (
        <p>
          Failed to load unadded songs:
          {" "}
          {unaddedError?.response?.data?.detail ?? unaddedError.message}
        </p>
      ) : null}
      {songs.map((song) => (
        <SongItem key={song.id ?? song.uri ?? song.name} song={song} />
      ))}
      {unadded && !unaddedLoading && songs.length === 0 ? (
        <p>No unadded songs found.</p>
      ) : null}
    </div>
  )
}

export default Home