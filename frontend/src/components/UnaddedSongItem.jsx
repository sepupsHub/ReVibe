import styles from "./UnaddedSongItem.module.css"
import { memo, useCallback, useEffect, useMemo, useState } from "react"

function SongItem({
    song,
    playlists,
    onApplySong,
    applying,
    applyError,
    applySuccess,
    defaultSelectedPlaylistIds = [],
    pickerLabel = "Assign playlists",
    applyButtonLabel = "Apply this song",
}) {
    const title = song?.name ?? song?.title ?? "Unknown song"
    const artists = Array.isArray(song?.artists)
        ? song.artists.map((artist) => artist?.name ?? artist).join(", ")
        : song?.artist ?? "Unknown artist"
    const imageSource = song?.album?.images?.[1]?.url
    const normalizedDefaultSelectedPlaylistIds = useMemo(
        () => (Array.isArray(defaultSelectedPlaylistIds) ? defaultSelectedPlaylistIds : []),
        [defaultSelectedPlaylistIds],
    )
    const defaultSelectionKey = useMemo(
        () => [...normalizedDefaultSelectedPlaylistIds].sort().join("|"),
        [normalizedDefaultSelectedPlaylistIds],
    )

    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState(normalizedDefaultSelectedPlaylistIds)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const selectedPlaylistSet = useMemo(
        () => new Set(Array.isArray(selectedPlaylistIds) ? selectedPlaylistIds : []),
        [selectedPlaylistIds],
    )

    const handlePlaylistToggle = useCallback((playlistId, checked) => {
        const current = Array.isArray(selectedPlaylistIds) ? selectedPlaylistIds : []
        const nextPlaylistIds = checked
            ? Array.from(new Set([...current, playlistId]))
            : current.filter((id) => id !== playlistId)

        setSelectedPlaylistIds(nextPlaylistIds)
    }, [selectedPlaylistIds])

    useEffect(() => {
        setSelectedPlaylistIds(normalizedDefaultSelectedPlaylistIds)
    }, [song?.id, defaultSelectionKey])

    return (
        <div className={styles.songContainer}>
            <img className={styles.songImage} src={imageSource} alt={title} />
            <div className={styles.songInfo}>
                <p className={styles.songTitle}>{title}</p>
                <small className={styles.songArtists}>{artists}</small>

                <label className={styles.playlistLabel}>
                    {pickerLabel}
                </label>

                <button
                    className={styles.pickerToggle}
                    onClick={() => setIsPickerOpen((previous) => !previous)}
                >
                    {isPickerOpen ? "Hide playlist picker" : `Choose playlists (${selectedPlaylistIds.length} selected)`}
                </button>

                {isPickerOpen ? (
                    <div className={styles.playlistList}>
                        {playlists.map((playlist) => (
                            <label key={playlist.id} className={styles.playlistOption}>
                                <input
                                    type="checkbox"
                                    checked={selectedPlaylistSet.has(playlist.id)}
                                    onChange={(event) => handlePlaylistToggle(playlist.id, event.target.checked)}
                                />
                                <span>{playlist.name}</span>
                            </label>
                        ))}
                    </div>
                ) : null}

                <button
                    className={styles.applyButton}
                    onClick={() => onApplySong?.(song?.id, selectedPlaylistIds)}
                    disabled={applying}
                >
                    {applying ? "Applying..." : applyButtonLabel}
                </button>

                {applyError ? <small className={styles.errorText}>{applyError}</small> : null}
                {applySuccess ? <small className={styles.successText}>{applySuccess}</small> : null}
            </div>
        </div>
    )
}

export default memo(SongItem)