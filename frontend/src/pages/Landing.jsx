import LoginButton from "@/components/LoginButton";

function Landing() {
    return (
        <main>
            <h1>ReVibe</h1>
            <p>
                A simple way to clean up your Spotify playlists and keep track of songs that still need to be added.
            </p>

            <ul>
                <li>Review unadded songs.</li>
                <li>Manage saved library tracks.</li>
                <li>Apply songs to playlists with a few clicks.</li>
            </ul>

            <LoginButton />
        </main>
    )
}

export default Landing;