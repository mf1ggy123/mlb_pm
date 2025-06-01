import React, { useState, useEffect } from 'react';
import Scoreboard from './components/Scoreboard';

const App: React.FC = () => {
    const [inning, setInning] = useState(1);
    const [homeScores, setHomeScores] = useState(0);
    const [awayScores, setAwayScores] = useState(0);
    const [outs, setOuts] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [balls, setBalls] = useState(0);
    const [isTop, setIsTop] = useState(true);

    useEffect(() => {
        // Create a WebSocket connection
        const socket = new WebSocket('ws://localhost:3000'); // Replace with your WebSocket server URL

        // Handle incoming messages
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'updateScore') {
                setHomeScores(data.homeScore);
                setAwayScores(data.awayScore);
            } else if (data.type === 'updateInning') {
                setInning(data.inning);
                setIsTop(data.isTop);
            } else if (data.type === 'updateCounts') {
                setOuts(data.outs);
                setStrikes(data.strikes);
                setBalls(data.balls);
            }
        };

        // Handle WebSocket errors
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Clean up the WebSocket connection on component unmount
        return () => {
            socket.close();
        };
    }, []);

    return (
        <div>
            <Scoreboard
                inning={inning}
                isTop={isTop}
                homeScores={homeScores}
                awayScores={awayScores}
                outs={outs}
                strikes={strikes}
                balls={balls}
            />
        </div>
    );
};

export default App;