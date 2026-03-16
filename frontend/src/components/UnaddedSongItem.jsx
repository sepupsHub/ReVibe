function SongItem({ song }) {
    const title = song?.name ?? song?.title ?? "Unknown song"
    const artists = Array.isArray(song?.artists)
        ? song.artists.map((artist) => artist?.name ?? artist).join(", ")
        : song?.artist ?? "Unknown artist"
    const imageSource = song.album.images[2].url

    return (
        <div>
            <img src={imageSource} alt="" />
            <p>{title}</p>
            <small>{artists}</small>
        </div>
    )
}

export default SongItem