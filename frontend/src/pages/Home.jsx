import SongItem from "@/components/UnaddedSongItem"
import SongFilter from "@/components/SongFilter"
import LogoutButton from "@/components/LogoutButton"
import useHomePage from "@/hooks/useHomePage"

function Home() {
  const {
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
  } = useHomePage()

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