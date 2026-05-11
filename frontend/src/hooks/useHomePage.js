import { useCallback, useEffect, useMemo, useState } from "react"

import useMe from "@/hooks/useMe"
import useUnaddedSongs from "@/hooks/useUnaddedSongs"
import useLibraryManagerSongs from "@/hooks/useLibraryManagerSongs"
import {
  getCleanedPlaylists,
  addSelectedSongsToPlaylists,
  updateLibraryManagerSong,
} from "@/api/playlistCleaner"

const DEFAULT_VISIBLE_COUNT = 25

function getSongText(song) {
  return (song?.name ?? song?.title ?? "").toLowerCase()
}

function getArtistText(song) {
  if (Array.isArray(song?.artists)) {
    return song.artists
      .map((artist) => (typeof artist === "string" ? artist : artist?.name ?? ""))
      .join(" ")
      .toLowerCase()
  }

  return (song?.artist ?? "").toLowerCase()
}

function getSongErrorMessage(error) {
  return error?.response?.data?.detail ?? error?.message ?? "Something went wrong."
}

function useHomePage() {
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
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT)

  const activeSongs = activeView === "library" ? managerSongs : unaddedSongs
  const normalizedSearchText = searchText.trim().toLowerCase()

  const filteredSongs = useMemo(() => {
    if (!normalizedSearchText) {
      return activeSongs
    }

    return activeSongs.filter((song) => {
      const title = getSongText(song)
      const artists = getArtistText(song)

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
    setVisibleCount(DEFAULT_VISIBLE_COUNT)
    setSongSubmitState({})
  }, [activeView, activeSongs, normalizedSearchText])

  const setSongState = useCallback((songId, nextState) => {
    setSongSubmitState((previous) => ({
      ...previous,
      [songId]: nextState,
    }))
  }, [])

  const handleApplySong = useCallback(async (songId, selectedPlaylistIds) => {
    if (!songId) {
      return
    }

    const cleanSelectedPlaylistIds = Array.isArray(selectedPlaylistIds)
      ? selectedPlaylistIds
      : []

    if (cleanSelectedPlaylistIds.length === 0) {
      setSongState(songId, {
        loading: false,
        error: null,
        success: "No playlists selected for this song.",
      })
      return
    }

    setSongState(songId, { loading: true, error: null, success: null })

    try {
      const result = await addSelectedSongsToPlaylists([
        {
          song_id: songId,
          playlist_ids: cleanSelectedPlaylistIds,
        },
      ])

      const playlistResults = Object.values(result?.results ?? {})
      const addedCount = playlistResults.reduce(
        (total, item) => total + (item?.added_count ?? 0),
        0,
      )
      const skippedCount = playlistResults.reduce(
        (total, item) => total + (item?.skipped_existing_count ?? 0),
        0,
      )

      setSongState(songId, {
        loading: false,
        error: null,
        success: `Added to ${addedCount} playlist entries, skipped ${skippedCount} duplicates.`,
      })
    } catch (error) {
      setSongState(songId, {
        loading: false,
        error: getSongErrorMessage(error),
        success: null,
      })
    }
  }, [setSongState])

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

    setSongState(songId, { loading: true, error: null, success: null })

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

      setSongState(songId, {
        loading: false,
        error: null,
        success: `Updated song: +${addedCount} playlists, -${removedCount} playlists.`,
      })
    } catch (error) {
      setSongState(songId, {
        loading: false,
        error: getSongErrorMessage(error),
        success: null,
      })
    }
  }, [managerSongs, playlists, setLibrarySongs, setSongState])

  return {
    user,
    loading,
    error,
    playlists,
    unaddedSongs,
    managerSongs,
    unadded,
    unaddedLoading,
    unaddedError,
    librarySongs,
    libraryLoading,
    libraryError,
    activeView,
    setActiveView,
    searchText,
    setSearchText,
    activeSongs,
    filteredSongs,
    visibleSongs,
    visibleCount,
    setVisibleCount,
    songSubmitState,
    handleFetchUnadded,
    handleOpenLibraryManager,
    handleApplySong,
    handleApplyLibrarySong,
  }
}

export default useHomePage