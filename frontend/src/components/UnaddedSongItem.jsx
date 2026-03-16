function SongItem({ song }) {
    const title = song?.name ?? song?.title ?? "Unknown song"
    const artists = Array.isArray(song?.artists)
        ? song.artists.map((artist) => artist?.name ?? artist).join(", ")
        : song?.artist ?? "Unknown artist"

    return (
        <div>
            <p>{title}</p>
            <small>{artists}</small>
        </div>
    )
}

export default SongItem