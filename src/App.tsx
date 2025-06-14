import React, { useState, useRef, useEffect } from 'react';
import Login from "./components/Login";
import TeamSelect from "./components/TeamSelect";

const WEBSOCKET_URL = "wss://684e-18-119-11-201.ngrok-free.app/ws";
const url = "wss://mlbstattakermab.com";
const localUrl = "ws://localhost:8000"; // Use this for local development

const App: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [teams, setTeams] = useState<{ home: string; away: string } | null>(null);
    const [marketData, setMarketData] = useState<{ home: any; away: any } | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const socketRefAction = useRef<WebSocket | null>(null);
    const [inputCount, setInputCount] = useState<number>(1);
    const [wsConnected, setWsConnected] = useState<boolean>(false);

    // Auto-reconnect logic and session restore
    useEffect(() => {
        // Restore session if available
        const savedUsername = localStorage.getItem("username");
        const savedTeams = localStorage.getItem("teams");
        if (savedUsername) setUsername(savedUsername);
        if (savedTeams) setTeams(JSON.parse(savedTeams));

        let ws: WebSocket | null = null;
        let wsAction: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        function connect() {
            ws = new WebSocket(`${url}/ws`);
            wsAction = new WebSocket(`${url}/action`);
            socketRef.current = ws;
            socketRefAction.current = wsAction;

            ws.onopen = () => {
                setWsConnected(true);
                console.log("✅ WebSocket connected!");
            };
            ws.onclose = () => {
                setWsConnected(false);
                console.log("🔌 WebSocket closed. Attempting reconnect...");
                reconnectTimeout = setTimeout(connect, 1500);
            };
            ws.onerror = (err) => {
                setWsConnected(false);
                console.error("❌ WebSocket error:", err);
                ws?.close();
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.home && data.away) {
                        setMarketData({
                            home: data.home,
                            away: data.away
                        });
                    }
                } catch (e) {
                    console.error("Error parsing market data:", e);
                }
            };

            wsAction.onopen = () => {};
            wsAction.onclose = () => {};
            wsAction.onerror = () => {};
            wsAction.onmessage = (event) => {
                console.log("📨 Received from server:", event.data);
            };
        }

        connect();

        return () => {
            ws?.close();
            wsAction?.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, []);

    // Persist username and teams to localStorage
    useEffect(() => {
        if (username) localStorage.setItem("username", username);
    }, [username]);
    useEffect(() => {
        if (teams) localStorage.setItem("teams", JSON.stringify(teams));
    }, [teams]);

    const sendButtonData = (buttonId: number) => {
        if (socketRefAction.current && socketRefAction.current.readyState === WebSocket.OPEN) {
            const payload = {
                button: buttonId,
                count: inputCount
            };
            socketRefAction.current.send(JSON.stringify(payload));
        } else {
            alert("WebSocket is not connected.");
        }
    };

    if (!username) {
        return <Login onLogin={setUsername} />;
    }

    if (!teams) {
        return <TeamSelect onSelect={(home, away) => setTeams({ home, away })} />;
    }

    return (
        <div style={{ textAlign: "center", marginTop: "2em" }}>
            <h2>Simple WebSocket Button App</h2>
            <div style={{ marginBottom: "1em" }}>
                <span
                    style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: wsConnected ? "#4caf50" : "#f44336",
                        marginRight: 8,
                        verticalAlign: "middle",
                        border: "1px solid #888"
                    }}
                />
                <span style={{ verticalAlign: "middle" }}>
                    {wsConnected ? "Connected" : "Disconnected"}
                </span>
            </div>
            <div style={{ marginBottom: "2em" }}>
                <div>
                    <strong>Home Market</strong><br />
                    Yes Ask: {marketData?.home?.yes_ask ?? "--"}<br />
                    Yes Bid: {marketData?.home?.yes_bid ?? "--"}
                </div>
                <div style={{ marginTop: "1em" }}>
                    <strong>Away Market</strong><br />
                    Yes Ask: {marketData?.away?.yes_ask ?? "--"}<br />
                    Yes Bid: {marketData?.away?.yes_bid ?? "--"}
                </div>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: "0.7em",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "260px",
                    margin: "2em auto"
                }}
            >
                <button style={{ fontSize: "1.2em", padding: "1em" }} onClick={() => sendButtonData(1)}>Buy Home</button>
                <button style={{ fontSize: "1.2em", padding: "1em" }} onClick={() => sendButtonData(2)}>Sell Home</button>
                <button style={{ fontSize: "1.2em", padding: "1em" }} onClick={() => sendButtonData(3)}>Buy Away</button>
                <button style={{ fontSize: "1.2em", padding: "1em" }} onClick={() => sendButtonData(4)}>Sell Away</button>
            </div>
            <div style={{ marginTop: "1.5em" }}>
                <label>
                    Contracts:&nbsp;
                    <input
                        type="number"
                        min={1}
                        value={inputCount}
                        onChange={e => setInputCount(Number(e.target.value))}
                        style={{ width: "60px", fontSize: "1em", textAlign: "center" }}
                    />
                </label>
            </div>
        </div>
    );
};

export default App;