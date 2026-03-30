import useMe from "@/hooks/useMe"
import useUnaddedSongs from "@/hooks/useUnaddedSongs"
import SongItem from "@/components/UnaddedSongItem"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  getCleanedPlaylists,
  addSelectedSongsToPlaylists,
} from "@/api/playlistCleaner"

function Home() {
  const { user, loading, error } = useMe()
  const {
    unadded,
    loading: unaddedLoading,
    error: unaddedError,
    fetchUnadded,
  } = useUnaddedSongs()
  const songs = useMemo(
    () => (Array.isArray(unadded?.songs) ? unadded.songs : []),
    [unadded],
  )
  const [playlists, setPlaylists] = useState([])
  const [songSubmitState, setSongSubmitState] = useState({})
  const [visibleCount, setVisibleCount] = useState(25)
  const visibleSongs = useMemo(() => songs.slice(0, visibleCount), [songs, visibleCount])

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const data = await getCleanedPlaylists()
        const loadedPlaylists = Array.isArray(data?.playlists) ? data.playlists : []
        setPlaylists(loadedPlaylists)
      } catch {
        setPlaylists([])
      }
    }

    loadPlaylists()
  }, [])

  useEffect(() => {
    setVisibleCount(25)
  }, [songs])

  const handleApplySong = useCallback(async (songId, selectedPlaylistIds) => {
    if (!songId) {
      return
    }

    const cleanSelectedPlaylistIds = Array.isArray(selectedPlaylistIds)
      ? selectedPlaylistIds
      : []

    if (cleanSelectedPlaylistIds.length === 0) {
      setSongSubmitState((previous) => ({
        ...previous,
        [songId]: {
          loading: false,
          error: null,
          success: "No playlists selected for this song.",
        },
      }))
      return
    }

    const assignments = [
      {
        song_id: songId,
        playlist_ids: cleanSelectedPlaylistIds,
      },
    ]

    setSongSubmitState((previous) => ({
      ...previous,
      [songId]: {
        loading: true,
        error: null,
        success: null,
      },
    }))

    try {
      const result = await addSelectedSongsToPlaylists(assignments)
      const playlistResults = Object.values(result?.results ?? {})
      const addedCount = playlistResults.reduce(
        (total, item) => total + (item?.added_count ?? 0),
        0,
      )
      const skippedCount = playlistResults.reduce(
        (total, item) => total + (item?.skipped_existing_count ?? 0),
        0,
      )

      setSongSubmitState((previous) => ({
        ...previous,
        [songId]: {
          loading: false,
          error: null,
          success: `Added to ${addedCount} playlist entries, skipped ${skippedCount} duplicates.`,
        },
      }))
    } catch (err) {
      setSongSubmitState((previous) => ({
        ...previous,
        [songId]: {
          loading: false,
          error: err?.response?.data?.detail ?? err.message,
          success: null,
        },
      }))
    }
  }, [])

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
      {visibleSongs.map((song) => (
        <SongItem
          key={song.id ?? song.uri ?? song.name}
          song={song}
          playlists={playlists}
          onApplySong={handleApplySong}
          applying={Boolean(songSubmitState[song.id]?.loading)}
          applyError={songSubmitState[song.id]?.error ?? null}
          applySuccess={songSubmitState[song.id]?.success ?? null}
        />
      ))}

      {songs.length > visibleCount ? (
        <button onClick={() => setVisibleCount((previous) => previous + 25)}>
          Load 25 more songs
        </button>
      ) : null}

      {unadded && !unaddedLoading && songs.length === 0 ? (
        <p>No unadded songs found.</p>
      ) : null}
    </div>
  )
}

export default Home