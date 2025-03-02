let latestData = null;
let gamePaused = false;
let timerInterval = null;

const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    latestData = data; // Store the latest data for export
    if (data.draft) {
        const team2 = data.draft.team2 || {};
        const team3 = data.draft.team3 || {};

        const team2Name = team2.name || "Radiant";
        const team3Name = team3.name || "Dire";

        document.getElementById("team2-name").innerText = team2Name;
        document.getElementById("team3-name").innerText = team3Name;

        document.getElementById("team2-logo").src = `/logos/${team2Name.replace(/\s+/g, '_').toLowerCase()}.png`;
        document.getElementById("team3-logo").src = `/logos/${team3Name.replace(/\s+/g, '_').toLowerCase()}.png`;

        clearInterval(timerInterval);

        let activeteamTimeRemaining = data.draft.activeteam_time_remaining;
        let radiantReserveTime = data.draft.radiant_bonus_time;
        let direReserveTime = data.draft.dire_bonus_time;

        const timerElement = document.getElementById("timer");
        const reserveTimeElementRadiant = document.getElementById("reserve-time-radiant");
        const reserveTimeElementDire = document.getElementById("reserve-time-dire");

        const updateTimerDisplay = () => {
            const minutes = Math.floor(activeteamTimeRemaining / 60);
            const seconds = activeteamTimeRemaining % 60;
            timerElement.innerText = `${data.draft.activeteam === 2 ? team2Name : team3Name} Turn - ${minutes}m ${seconds}s`;
        };

        const updateReserveTimeDisplay = () => {
            const reserveMinutesRadiant = Math.floor(radiantReserveTime / 60);
            const reserveSecondsRadiant = radiantReserveTime % 60;
            reserveTimeElementRadiant.innerText = `Reserve Time: ${reserveMinutesRadiant}m ${reserveSecondsRadiant}s`;

            const reserveMinutesDire = Math.floor(direReserveTime / 60);
            const reserveSecondsDire = direReserveTime % 60;
            reserveTimeElementDire.innerText = `Reserve Time: ${reserveMinutesDire}m ${reserveSecondsDire}s`;
        };

        // Initial update
        updateTimerDisplay();
        updateReserveTimeDisplay();

        timerInterval = setInterval(() => {
            if (!gamePaused) {
                if (activeteamTimeRemaining > 0) {
                    activeteamTimeRemaining--;
                } else {
                    if (data.draft.activeteam === 2 && radiantReserveTime > 0) {
                        radiantReserveTime--;
                    } else if (data.draft.activeteam === 3 && direReserveTime > 0) {
                        direReserveTime--;
                    }
                }
                updateTimerDisplay();
                updateReserveTimeDisplay();
            }
        }, 1000);

        updateDraft("bans2", team2, "ban");
        updateDraft("picks2", team2, "pick");
        updateDraft("bans3", team3, "ban");
        updateDraft("picks3", team3, "pick");
    }
};

function updateDraft(containerId, team, type) {
    const container = document.getElementById(containerId);
    for (let i = 0; i < 7; i++) { // Assuming up to 7 bans/picks per team
        const heroClass = team[`${type}${i}_class`];
        if (!heroClass) {
            console.error(`Missing heroClass for ${type} ${i}`);
            continue; // Skip if heroClass is undefined
        }
        let slot = container.children[i];
        if (!slot) {
            slot = document.createElement("div");
            slot.classList.add("hero-slot");
            slot.classList.add(type === "ban" ? "ban" : "pick");
            container.appendChild(slot);
        }
        if (type === "ban") {
            let img = slot.querySelector('img');
            if (!img) {
                img = document.createElement("img");
                img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`;
                slot.appendChild(img);
            } else if (img.src !== `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`) {
                img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/${heroClass}.png`;
            }
            img.alt = heroClass.replace("npc_dota_hero_", "").replace("_", " ");
        } else {
            let video = slot.querySelector('video');
            if (!video) {
                video = document.createElement("video");
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                const videoHeroClass = heroClass.replace("npc_dota_hero_", ""); // Remove the prefix for the video URL
                video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`;
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
            } else {
                const videoHeroClass = heroClass.replace("npc_dota_hero_", ""); // Remove the prefix for the video URL
                if (video.dataset.src !== `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`) {
                    video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`;
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
            }
            video.alt = heroClass.replace("npc_dota_hero_", "").replace("_", " ");
        }
        slot.classList.add("show");
    }
}

// Function to handle game pause
function toggleGamePause() {
    gamePaused = !gamePaused;
    const pauseIndicator = document.getElementById("pause-indicator");
    if (gamePaused) {
        pauseIndicator.innerText = "Game Paused";
    } else {
        pauseIndicator.innerText = "";
    }
}

// Add event listener for pause button (assuming there's a button with id "pause-button")
const pauseButton = document.getElementById("pause-button");
if (pauseButton) {
    pauseButton.addEventListener("click", toggleGamePause);
}