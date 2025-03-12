const socket = new WebSocket("ws://localhost:8080");

let lastUpdateTime = 0;
const DEBOUNCE_DELAY = 500; // Delay in milliseconds (500ms, can adjust for your preference)

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const currentTime = Date.now();

    // Only update if the debounce delay has passed
    if (currentTime - lastUpdateTime > DEBOUNCE_DELAY) {
        lastUpdateTime = currentTime;

        if (data.draft) {
            const team2 = data.draft.team2 || {};
            const team3 = data.draft.team3 || {};

            const team2Name = team2.name || "Radiant";
            const team3Name = team3.name || "Dire";

            // Update team names and logos
            document.getElementById("team2-name").innerText = team2Name;
            document.getElementById("team3-name").innerText = team3Name;
            document.getElementById("team2-logo").src = `/logos/${team2Name.replace(/\s+/g, '_').toLowerCase()}.png`;
            document.getElementById("team3-logo").src = `/logos/${team3Name.replace(/\s+/g, '_').toLowerCase()}.png`;

            // Update timer for active team
            document.getElementById("timer").innerText = `${data.draft.activeteam === 2 ? team2Name : team3Name} Turn - ${data.draft.activeteam_time_remaining}s`;

            // Update reserve times
            document.getElementById("reserve-time2").innerText = formatTime(data.draft.radiant_bonus_time);
            document.getElementById("reserve-time3").innerText = formatTime(data.draft.dire_bonus_time);

            // Update bans and picks (but only load the WebM once)
            updateDraft("bans2", team2, "ban", 7, false);
            updateDraft("picks2", team2, "pick", 5, true);
            updateDraft("bans3", team3, "ban", 7, false);
            updateDraft("picks3", team3, "pick", 5, true);

            // Highlight the active team
            highlightActiveTeam(data.draft.activeteam, data.draft.pick);
        }
    }
};

// Format time in minutes and seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Update the draft (bans/picks)
function updateDraft(containerId, team, type, slots, isPick) {
    const container = document.getElementById(containerId);

    // Only load the WebM videos once and keep them in place
    for (let i = 0; i < slots; i++) {
        const heroClass = team[`${type}${i}_class`];
        let slot = container.children[i];

        // If the slot doesn't exist yet, create a new one
        if (!slot) {
            slot = document.createElement("div");
            slot.classList.add("hero-slot");
            container.appendChild(slot);
        }

        // Clear the previous media (image or video) from the slot
        slot.innerHTML = '';

        if (heroClass) {
            let media;

            if (isPick) {
                // Create a video element for picks
                media = document.createElement("video");
                media.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${heroClass}.webm`;
                media.autoplay = true;
                media.muted = true;
                media.setAttribute("playsinline", "true");
                media.loop = false;  // Disable loop
                media.load(); // Explicitly load the video

                // Add event listener to stop video and show image after finishing
                media.addEventListener('ended', function() {
                    const img = document.createElement('img');
                    img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${heroClass}.png`;
                    img.style.width = "100%"; // Ensure the image fits the slot
                    img.style.height = "100%";
                    slot.appendChild(img);
                });

            } else {
                // Create an image element for bans
                media = document.createElement("img");
                media.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${heroClass}.png`;
            }

            slot.appendChild(media);
        }
    }
}

// Highlight the active team with a glowing effect
function highlightActiveTeam(teamId, isPick) {
    const pickBanStatus = document.getElementById("pick-ban-status");
    if (pickBanStatus) {
        document.getElementById("team2").classList.toggle("active-picking", teamId === 2);
        document.getElementById("team3").classList.toggle("active-picking", teamId === 3);
        pickBanStatus.innerText = isPick ? "Picking..." : "Banning...";
        pickBanStatus.className = isPick ? "picking" : "banning";
    }
}
