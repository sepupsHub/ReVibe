export default function LoginButton() {
    const handleLogin = () => {
        window.location.href = "http://127.0.0.1:8000/api/spotify/login/"
    };

    return <button onClick={handleLogin}>
        Login with Spotify
    </button>
}