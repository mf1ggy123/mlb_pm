import React, { useState, useEffect, useRef } from 'react';
import Scoreboard from './components/Scoreboard';
import Login from "./components/Login";
import TeamSelect from "./components/TeamSelect";


const App: React.FC = () => {
    const [inning, setInning] = useState(1);
    const [homeScores, setHomeScores] = useState(0);
    const [awayScores, setAwayScores] = useState(0);
    const [outs, setOuts] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [balls, setBalls] = useState(0);
    const [isTop, setIsTop] = useState(true);
    const [bases, setBases] = useState([0,0,0,0]);
    const [sendUpdates, setSendUpdates] = useState(true);

    const socketRef = useRef<WebSocket | null>(null);
    const gameStateSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        socketRef.current = new WebSocket("ws://127.0.0.1:8000/ws");

        gameStateSocketRef.current = new WebSocket("ws://127.0.0.1:8000/game-state");

        socketRef.current.onopen = () => {
            console.log("✅ WebSocket connected to backend!");
            socketRef.current?.send("Hello from React!");
        };

        gameStateSocketRef.current.onmessage = (event) => {
            console.log("📨 Received from server:", event.data);
        };

        socketRef.current.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        socketRef.current.onclose = () => {
            console.log("🔌 WebSocket closed.");
        };

        return () => {
            socketRef.current?.close();
        };
    }, []);

    // Helper to send the latest scoreboard state
    const sendScoreboard = (customState?: any) => {
        if (!sendUpdates) return;
        const scoreboardData = customState || {
            inning,
            isTop,
            homeScores,
            awayScores,
            outs,
            strikes,
            balls,
            bases,
        };
        gameStateSocketRef.current?.send(JSON.stringify(scoreboardData));
    };

    // Handler functions to update state and send to backend
    const handleUpdate = (updates: Partial<{
        inning: number;
        isTop: boolean;
        homeScores: number;
        awayScores: number;
        outs: number;
        strikes: number;
        balls: number;
        bases: number[];
    }>) => {
        console.log("Updating scoreboard with:", updates);
        if (updates.inning !== undefined) setInning(updates.inning);
        if (updates.isTop !== undefined) setIsTop(updates.isTop);
        if (updates.homeScores !== undefined) setHomeScores(updates.homeScores);
        if (updates.awayScores !== undefined) setAwayScores(updates.awayScores);
        if (updates.outs !== undefined) setOuts(updates.outs);
        if (updates.strikes !== undefined) setStrikes(updates.strikes);
        if (updates.balls !== undefined) setBalls(updates.balls);
        if (updates.bases !== undefined) setBases(updates.bases);

        // Send the updated state (merge with current state)
        sendScoreboard({
            inning: updates.inning ?? inning,
            isTop: updates.isTop ?? isTop,
            homeScores: updates.homeScores ?? homeScores,
            awayScores: updates.awayScores ?? awayScores,
            outs: updates.outs ?? outs,
            strikes: updates.strikes ?? strikes,
            balls: updates.balls ?? balls,
            bases: updates.bases ?? bases,
        });
    };
    const [username, setUsername] = useState<string | null>(null);
    const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);

    if (!username) {
        return <Login onLogin={setUsername} />;
    }

    if (!teams) {
        return <TeamSelect onSelect={(home, away) => setTeams({ home, away })} />;
    }

    return (
        <div>
            <label style={{ display: "block", margin: "1em 0" }}>
                <input
                    type="checkbox"
                    checked={sendUpdates}
                    onChange={() => setSendUpdates(!sendUpdates)}
                    style={{ marginRight: 8 }}
                />
                Send data through WebSocket
            </label>
            <Scoreboard
                inning={inning}
                isTop={isTop}
                homeScores={homeScores}
                awayScores={awayScores}
                outs={outs}
                strikes={strikes}
                balls={balls}
                bases={bases}
                onUpdate={handleUpdate}
                teams={teams}
            />
        </div>
    );
};

export default App;