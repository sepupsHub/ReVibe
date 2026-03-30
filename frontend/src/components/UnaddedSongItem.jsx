import styles from "./UnaddedSongItem.module.css"
import { memo, useCallback, useMemo, useState } from "react"

function SongItem({
    song,
    playlists,
    onApplySong,
    applying,
    applyError,
    applySuccess,
}) {
    const title = song?.name ?? song?.title ?? "Unknown song"
    const artists = Array.isArray(song?.artists)
        ? song.artists.map((artist) => artist?.name ?? artist).join(", ")
        : song?.artist ?? "Unknown artist"
    const imageSource = song?.album?.images?.[1]?.url
    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState([])
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

    return (
        <div className={styles.songContainer}>
            <img className={styles.songImage} src={imageSource} alt={title} />
            <div className={styles.songInfo}>
                <p className={styles.songTitle}>{title}</p>
                <small className={styles.songArtists}>{artists}</small>

                <label className={styles.playlistLabel}>
                    Assign playlists (0, 1, or many)
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
                    {applying ? "Applying..." : "Apply this song"}
                </button>

                {applyError ? <small className={styles.errorText}>{applyError}</small> : null}
                {applySuccess ? <small className={styles.successText}>{applySuccess}</small> : null}
            </div>
        </div>
    )
}

export default memo(SongItem)