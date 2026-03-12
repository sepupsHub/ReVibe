import useMe from "@/hooks/useMe"
import useUnaddedSongs from "@/hooks/useUnaddedSongs"

function Home() {
  const { user, loading, error } = useMe()
  const {
    unadded,
    loading: unaddedLoading,
    error: unaddedError,
    fetchUnadded,
  } = useUnaddedSongs()

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

      {unaddedError ? <p>Failed to load unadded songs.</p> : null}
      {unadded ? <pre>{JSON.stringify(unadded, null, 2)}</pre> : null}
    </div>
  )
}

export default Home