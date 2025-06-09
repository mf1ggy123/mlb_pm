import React, { useState } from "react";

const Login: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if (res.ok) {
                onLogin(username);
            } else {
                const data = await res.json();
                setError(data.detail || "Login failed");
            }
        } catch {
            setError("Network error");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "auto" }}>
            <h2>Login</h2>
            <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                style={{ width: "100%", marginBottom: 10 }}
            />
            <button type="submit" style={{ width: "100%" }}>Login</button>
            {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        </form>
    );
};

export default Login;