import React, { useState } from "react";

const TEAMS = [
    "ARI", "ATL", "BAL", "BOS", "CHC", "CWS", "CIN", "CLE", "COL", "DET",
    "HOU", "KC", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK",
    "PHI", "PIT", "SD", "SEA", "SF", "STL", "TB", "TEX", "TOR", "WSH"
];

const TeamSelect: React.FC<{
    onSelect: (home: string, away: string) => void;
}> = ({ onSelect }) => {
    const [home, setHome] = useState("");
    const [away, setAway] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const homeKey = home.toUpperCase();
        const awayKey = away.toUpperCase();
        if (!TEAMS.includes(homeKey) || !TEAMS.includes(awayKey)) {
            setError("Both teams must be valid MLB team keys (e.g., NYY, BOS, LAD).");
            return;
        }
        if (homeKey === awayKey) {
            setError("Home and away teams must be different.");
            return;
        }
        try {
            const res = await fetch("http://127.0.0.1:8000/select-teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ home: homeKey, away: awayKey }),
            });
            if (!res.ok) {
                setError("Failed to send teams to server.");
                return;
            }
            onSelect(homeKey, awayKey);
        } catch {
            setError("Network error sending teams to server.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "auto" }}>
            <h2>Select Teams</h2>
            <label>
                Home Team Key:
                <input
                    type="text"
                    value={home}
                    onChange={e => setHome(e.target.value.toUpperCase())}
                    placeholder="e.g. NYY"
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />
            </label>
            <br />
            <label>
                Away Team Key:
                <input
                    type="text"
                    value={away}
                    onChange={e => setAway(e.target.value.toUpperCase())}
                    placeholder="e.g. BOS"
                    required
                    style={{ width: "100%", marginBottom: 10 }}
                />
            </label>
            <br />
            <button type="submit" style={{ width: "100%", marginTop: 10 }}>Continue</button>
            {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        </form>
    );
};

export default TeamSelect;