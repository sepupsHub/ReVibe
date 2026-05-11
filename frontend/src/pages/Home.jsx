import useMe from "@/hooks/useMe"
import useUnaddedSongs from "@/hooks/useUnaddedSongs"
import useLibraryManagerSongs from "@/hooks/useLibraryManagerSongs"
import SongItem from "@/components/UnaddedSongItem"
import SongFilter from "@/components/SongFilter"
import LogoutButton from "@/components/LogoutButton"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getCleanedPlaylists,
  addSelectedSongsToPlaylists,
  updateLibraryManagerSong,
} from "@/api/playlistCleaner"

function Home() {
  const { user, loading, error } = useMe()
  const {
    unadded,
    loading: unaddedLoading,
    error: unaddedError,
    fetchUnadded,
  } = useUnaddedSongs()
  const {
    librarySongs,
    loading: libraryLoading,
    error: libraryError,
    fetchLibrarySongs,
    setLibrarySongs,
  } = useLibraryManagerSongs()

  const unaddedSongs = useMemo(
    () => (Array.isArray(unadded?.songs) ? unadded.songs : []),
    [unadded],
  )
  const managerSongs = useMemo(
    () => (Array.isArray(librarySongs?.songs) ? librarySongs.songs : []),
    [librarySongs],
  )

  const [playlists, setPlaylists] = useState([])
  const [songSubmitState, setSongSubmitState] = useState({})
  const [activeView, setActiveView] = useState("unadded")
  const [searchText, setSearchText] = useState("")
  const [visibleCount, setVisibleCount] = useState(25)
  const activeSongs = activeView === "library" ? managerSongs : unaddedSongs
  const normalizedSearchText = searchText.trim().toLowerCase()

  const filteredSongs = useMemo(() => {
    if (!normalizedSearchText) {
      return activeSongs
    }

    return activeSongs.filter((song) => {
      const title = (song?.name ?? song?.title ?? "").toLowerCase()
      const artists = Array.isArray(song?.artists)
        ? song.artists
          .map((artist) => (typeof artist === "string" ? artist : artist?.name ?? ""))
          .join(" ")
          .toLowerCase()
        : (song?.artist ?? "").toLowerCase()

      return title.includes(normalizedSearchText) || artists.includes(normalizedSearchText)
    })
  }, [activeSongs, normalizedSearchText])

  const visibleSongs = useMemo(
    () => filteredSongs.slice(0, visibleCount),
    [filteredSongs, visibleCount],
  )

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
    setSongSubmitState({})
  }, [activeView, activeSongs, normalizedSearchText])

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

  const handleOpenLibraryManager = useCallback(async () => {
    setActiveView("library")
    if (!librarySongs) {
      await fetchLibrarySongs()
    }
  }, [fetchLibrarySongs, librarySongs])

  const handleFetchUnadded = useCallback(async () => {
    if (activeView !== "unadded") {
      setActiveView("unadded")
      if (!unadded) {
        await fetchUnadded()
      }
      return
    }

    setActiveView("unadded")
    await fetchUnadded()
  }, [activeView, fetchUnadded, unadded])

  const handleApplyLibrarySong = useCallback(async (songId, selectedPlaylistIds) => {
    if (!songId) {
      return
    }

    const selected = Array.isArray(selectedPlaylistIds) ? selectedPlaylistIds : []
    const targetSong = managerSongs.find((song) => song.id === songId)
    const currentPlaylistIds = Array.isArray(targetSong?.playlists)
      ? targetSong.playlists.map((playlist) => playlist.id)
      : []

    setSongSubmitState((previous) => ({
      ...previous,
      [songId]: {
        loading: true,
        error: null,
        success: null,
      },
    }))

    try {
      const result = await updateLibraryManagerSong(songId, selected, currentPlaylistIds)
      const addedCount = Array.isArray(result?.added_to) ? result.added_to.length : 0
      const removedCount = Array.isArray(result?.removed_from) ? result.removed_from.length : 0

      setLibrarySongs((previous) => {
        if (!previous || !Array.isArray(previous.songs)) {
          return previous
        }

        const selectedPlaylistSet = new Set(selected)
        const nextSongs = previous.songs.map((song) => {
          if (song.id !== songId) {
            return song
          }

          const nextPlaylists = playlists.filter((playlist) => selectedPlaylistSet.has(playlist.id))
          return {
            ...song,
            playlists: nextPlaylists,
          }
        })

        return {
          ...previous,
          songs: nextSongs,
        }
      })

      setSongSubmitState((previous) => ({
        ...previous,
        [songId]: {
          loading: false,
          error: null,
          success: `Updated song: +${addedCount} playlists, -${removedCount} playlists.`,
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
  }, [managerSongs, playlists, setLibrarySongs])

  if (loading) return <p>Loading...</p>

  if (error) {
    return <p>Could not load your Spotify profile.</p>
  }

  return (
    <div className="page-shell">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1>Hello {user?.display_name ?? "there"}</h1>
        <LogoutButton />
      </div>

      <button onClick={handleFetchUnadded} disabled={unaddedLoading}>
        {unaddedLoading
          ? "Loading..."
          : activeView === "unadded"
            ? "Refresh unadded songs"
            : "Open unadded songs"}
      </button>

      <button onClick={handleOpenLibraryManager} disabled={libraryLoading}>
        {libraryLoading ? "Loading..." : "Open library manager"}
      </button>

      {activeSongs.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SongFilter
            value={searchText}
            onChange={setSearchText}
          />
          <small>
            {visibleSongs.length}/{filteredSongs.length}
          </small>
        </div>
      ) : null}

      {activeView === "unadded" && unaddedError ? (
        <p>
          Failed to load unadded songs:
          {" "}
          {unaddedError?.response?.data?.detail ?? unaddedError.message}
        </p>
      ) : null}
      {activeView === "library" && libraryError ? (
        <p>
          Failed to load library manager songs:
          {" "}
          {libraryError?.response?.data?.detail ?? libraryError.message}
        </p>
      ) : null}

      {visibleSongs.map((song) => (
        <SongItem
          key={song.id ?? song.uri ?? song.name}
          song={song}
          playlists={playlists}
          onApplySong={activeView === "library" ? handleApplyLibrarySong : handleApplySong}
          applying={Boolean(songSubmitState[song.id]?.loading)}
          applyError={songSubmitState[song.id]?.error ?? null}
          applySuccess={songSubmitState[song.id]?.success ?? null}
          defaultSelectedPlaylistIds={
            activeView === "library"
              ? (Array.isArray(song?.playlists) ? song.playlists.map((playlist) => playlist.id) : [])
              : []
          }
          pickerLabel={
            activeView === "library"
              ? "Manage playlists for this saved song"
              : "Assign playlists (0, 1, or many)"
          }
          applyButtonLabel={
            activeView === "library" ? "Save playlist changes" : "Apply this song"
          }
        />
      ))}

      {filteredSongs.length > visibleCount ? (
        <button onClick={() => setVisibleCount((previous) => previous + 25)}>
          Load 25 more songs
        </button>
      ) : null}

      {activeView === "unadded" && unadded && !unaddedLoading && unaddedSongs.length === 0 ? (
        <p>No unadded songs found.</p>
      ) : null}

      {activeView === "unadded" && unaddedSongs.length > 0 && filteredSongs.length === 0 ? (
        <p>No songs match your filter.</p>
      ) : null}

      {activeView === "library" && librarySongs && !libraryLoading && managerSongs.length === 0 ? (
        <p>No saved songs found.</p>
      ) : null}

      {activeView === "library" && managerSongs.length > 0 && filteredSongs.length === 0 ? (
        <p>No songs match your filter.</p>
      ) : null}
    </div>
  )
}

export default Home