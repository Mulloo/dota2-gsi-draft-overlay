const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Serve static files (logos, HTML, CSS)
app.use(express.static("public"));
app.use("/logos", express.static(path.join(__dirname, "logos"))); // Serve team logos

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

let gsiData = {}; // This will store the latest game state

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Overlay connected');
    
    // Send the initial data to the client (if any)
    if (Object.keys(gsiData).length) {
        ws.send(JSON.stringify(gsiData));
    }

    // Listen for when the connection is closed
    ws.on('close', () => {
        console.log('Overlay disconnected');
    });
});

// Endpoint to receive GSI data
app.post('/gsi', (req, res) => {
    gsiData = req.body; // Store the GSI data

    // Ensure draft object exists before processing
    if (gsiData.draft) {
        const team2 = gsiData.draft.team2 || {}; // Default to empty object if undefined
        const team3 = gsiData.draft.team3 || {}; // Default to empty object if undefined

        // Check if team names exist; otherwise, use default
        const team2Name = team2.name ? team2.name.trim() : 'default';
        const team3Name = team3.name ? team3.name.trim() : 'default';

        gsiData.draft.team2.logo = getTeamLogo(team2Name);
        gsiData.draft.team3.logo = getTeamLogo(team3Name);
    }

    // Send the updated GSI data to all connected WebSocket clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gsiData));
        }
    });

    res.sendStatus(200);
});

// Function to check if a team logo exists, fallback to default
function getTeamLogo(teamName) {
    if (!teamName || !teamName.trim()) return '/logos/default.png'; // Use default logo

    const logoFileName = teamName.replace(/\s+/g, '_').toLowerCase() + '.png';
    const logoPath = path.join(__dirname, 'logos', logoFileName);

    return fs.existsSync(logoPath) ? `/logos/${logoFileName}` : '/logos/default.png';
}

// Start the server
app.listen(PORT, () => {
    console.log(`Dota 2 GSI server running on http://localhost:${PORT}`);
});
