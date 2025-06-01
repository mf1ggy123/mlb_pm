// Install ws: npm install ws
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send a message to the client
    ws.send(JSON.stringify({ type: 'updateScore', homeScore: 1, awayScore: 0 }));

    // Handle incoming messages
    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});