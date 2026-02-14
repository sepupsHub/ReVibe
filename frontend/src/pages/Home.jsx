import { useState, useEffect } from "react";

function Home() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetch("http://127.0.0.1:8000/api/spotify/me/", {
        credentials: "include",
    })
        .then(async (res) => {
            console.log("STATUS:", res.status);
            const text = await res.text();
            console.log("BODY:", text);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            return JSON.parse(text);
        })
        .then((data) => {
            setUser(data);
        })
        .catch((err) => {
            console.error("FETCH ERROR:", err);
            // window.location.href = "/";
        })
        .finally(() => {
            setLoading(false);
        });
}, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Hello {user.display_name}</h1>
        </div>
    );
};

export default Home;