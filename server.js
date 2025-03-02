const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/logos", express.static(path.join(__dirname, "logos"))); // Serve team logos

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });
let gsiData = {}; // Store latest game state

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Overlay connected");
    ws.send(JSON.stringify(gsiData));

    ws.on("close", () => {
        console.log("Overlay disconnected");
    });

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.draft) {
            const team2 = data.draft.team2 || {};
            const team3 = data.draft.team3 || {};

            const team2Name = team2.name || "Unknown Team";
            const team3Name = team3.name || "Unknown Team";

            document.getElementById("team2-name").innerText = team2Name;
            document.getElementById("team3-name").innerText = team3Name;

            document.getElementById("team2-logo").src = team2Name === "Unknown Team" ? "/logos/default_logo.png" : `/logos/${team2Name.replace(/\s+/g, '_').toLowerCase()}.png`;
            document.getElementById("team3-logo").src = team3Name === "Unknown Team" ? "/logos/default_logo.png" : `/logos/${team3Name.replace(/\s+/g, '_').toLowerCase()}.png`;

            document.getElementById("timer").innerText = 
                `${data.draft.activeteam === 2 ? team2Name : team3Name} Turn - ${data.draft.activeteam_time_remaining}s`;

            updateDraft("bans2", team2, "ban");
            updateDraft("picks2", team2, "pick");
            updateDraft("bans3", team3, "ban");
            updateDraft("picks3", team3, "pick");
        }
    };
});

// Handle GSI Data from Dota 2
app.post("/gsi", (req, res) => {
    gsiData = req.body;
    
    // Process team logos
    if (gsiData.draft) {
        gsiData.draft.team2 = gsiData.draft.team2 || {};
        gsiData.draft.team3 = gsiData.draft.team3 || {};
        gsiData.draft.team2.logo = getTeamLogo(gsiData.draft.team2?.name);
        gsiData.draft.team3.logo = getTeamLogo(gsiData.draft.team3?.name);
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gsiData));
        }
    });

    res.sendStatus(200);
});

// Function to check if a team logo exists, fallback to default
function getTeamLogo(teamName) {
    if (!teamName) return "/logos/default_logo.png";

    const logoPath = `/logos/${teamName.replace(/\s+/g, "_").toLowerCase()}.png`;
    if (fs.existsSync(path.join(__dirname, logoPath))) {
        return logoPath;
    }
    return "/logos/default_logo.png"; // Default logo if not found
}

// New draft data and endpoints
let draftData = {
    team2: {
        name: 'Radiant',
        logo: 'default_logo.png',
        bans: [],
        picks: []
    },
    team3: {
        name: 'Dire',
        logo: 'default_logo.png',
        bans: [],
        picks: []
    }
};

app.post('/update-draft', (req, res) => {
    const { team, logo, bans, picks } = req.body;

    if (team === 'team2' || team === 'team3') {
        if (!draftData[team]) {
            draftData[team] = {};
        }
        draftData[team].logo = logo || draftData[team].logo;
        draftData[team].bans = bans || draftData[team].bans;
        draftData[team].picks = picks || draftData[team].picks;
    }

    res.sendStatus(200);
});

app.get('/draft-data', (req, res) => {
    res.json(draftData);
});

// Function to update draft
function updateDraft(containerId, team, type) {
    const container = document.getElementById(containerId);
    for (let i = 0; i < 7; i++) { // Assuming up to 7 bans/picks per team
        const heroClass = team[`${type}${i}_class`];
        let slot = container.children[i];
        if (!slot) {
            slot = document.createElement("div");
            slot.classList.add("hero-slot");
            slot.classList.add(type === "ban" ? "ban" : "pick");
            container.appendChild(slot);
        }
        if (heroClass) {
            if (type === "ban") {
                let img = slot.querySelector('img');
                if (!img) {
                    img = document.createElement("img");
                    img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`;
                    slot.appendChild(img);
                } else if (img.src !== `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`) {
                    img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`;
                }
                img.alt = heroClass.replace("_", " ");
            } else {
                let video = slot.querySelector('video');
                if (!video) {
                    video = document.createElement("video");
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${heroClass}.webm`;
                    slot.appendChild(video);
                    // Add an intersection observer to lazy load the video
                    const observer = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const video = entry.target;
                                video.src = video.dataset.src;
                                observer.unobserve(video);
                            }
                        });
                    });
                    observer.observe(video);
                } else if (video.dataset.src !== `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${heroClass}.webm`) {
                    video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${heroClass}.webm`;
                    // Re-observe the video for lazy loading
                    const observer = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const video = entry.target;
                                video.src = video.dataset.src;
                                observer.unobserve(video);
                            }
                        });
                    });
                    observer.observe(video);
                }
                video.alt = heroClass.replace("_", " ");
            }
            slot.classList.add("show");
        } else {
            slot.classList.remove("show");
        }
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Dota 2 GSI server running on http://localhost:${PORT}`);
});
