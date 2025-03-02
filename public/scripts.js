const socket = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server URL

socket.onopen = function () {
    console.log("WebSocket connection established");
};

let timerInterval;

// Initialize arrays to store picks and bans for each team
let radiantPicks = [];
let radiantBans = [];
let direPicks = [];
let direBans = [];

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

        document.getElementById("team2-logo").src = `/logos/${team2Name
            .replace(/\s+/g, "_")
            .toLowerCase()}.png`;
        document.getElementById("team3-logo").src = `/logos/${team3Name
            .replace(/\s+/g, "_")
            .toLowerCase()}.png`;

        clearInterval(timerInterval);

        let activeteamTimeRemaining = data.draft.activeteam_time_remaining;
        let radiantReserveTime = data.draft.radiant_bonus_time;
        let direReserveTime = data.draft.dire_bonus_time;

        const timerElement = document.getElementById("timer");
        const timeDisplayElement = document.getElementById("time-display");
        const reserveDisplayElement =
            document.getElementById("reserve-display");
        const reserveTimeElementRadiant = document.getElementById(
            "reserve-time-radiant"
        );
        const reserveTimeElementDire =
            document.getElementById("reserve-time-dire");

        const updateTimerDisplay = () => {
            const minutes = Math.floor(activeteamTimeRemaining / 60);
            const seconds = activeteamTimeRemaining % 60;
            const reserveTime =
                data.draft.activeteam === 2
                    ? radiantReserveTime
                    : direReserveTime;
            const reserveMinutes = Math.floor(reserveTime / 60);
            const reserveSeconds = reserveTime % 60;
            const action =
                data.draft.activeteam_action === "pick" ? "Pick" : "Ban";
            timeDisplayElement.innerText = `${
                data.draft.activeteam === 2 ? team2Name : team3Name
            } ${action} - ${minutes}m ${seconds}s`;
            reserveDisplayElement.innerText = `Reserve Time: ${reserveMinutes}m ${reserveSeconds}s`;
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
            if (activeteamTimeRemaining > 0) {
                activeteamTimeRemaining--;
            } else {
                if (data.draft.activeteam === 2 && radiantReserveTime > 0) {
                    radiantReserveTime--;
                    reserveDisplayElement.classList.add("active");
                    reserveTimeElementRadiant.classList.remove("active");
                    reserveTimeElementDire.classList.remove("active");
                } else if (data.draft.activeteam === 3 && direReserveTime > 0) {
                    direReserveTime--;
                    reserveDisplayElement.classList.add("active");
                    reserveTimeElementDire.classList.remove("active");
                    reserveTimeElementRadiant.classList.remove("active");
                } else {
                    reserveDisplayElement.classList.remove("active");
                }
            }
            updateTimerDisplay();
            updateReserveTimeDisplay();
        }, 1000);

        // Update the draft for both teams
        updateDraft("bans2", team2, "ban");
        updateDraft("picks2", team2, "pick");
        updateDraft("bans3", team3, "ban");
        updateDraft("picks3", team3, "pick");
    }
};

function updateDraft(containerId, team, type) {
    const container = document.getElementById(containerId);

    // Initialize all slots at their full size
    for (let i = 0; i < 5; i++) {
        // Assuming up to 5 picks per team
        let slot = container.children[i];
        if (!slot) {
            slot = document.createElement("div");
            slot.classList.add("hero-slot");
            slot.classList.add(type === "ban" ? "ban" : "pick");
            container.appendChild(slot);
        }
    }

    // Update slots with hero data
    for (let i = 0; i < 5; i++) {
        const heroClass = team[`${type}${i}_class`];

        let slot = container.children[i];

        if (!heroClass) {
            slot.classList.remove("show");
            slot.classList.remove("animate"); // Remove animation class if no heroClass
            continue; // Skip if heroClass is undefined
        }

        if (type === "ban") {
            let img = slot.querySelector("img");
            if (!img) {
                img = document.createElement("img");
                img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${heroClass}.png`; // Updated URL
                slot.appendChild(img);
            } else if (
                img.src !==
                `https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${heroClass}.png`
            ) {
                img.src = `https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${heroClass}.png`; // Updated URL
            }
            img.alt = heroClass.replace("npc_dota_hero_", "").replace("_", " ");
        } else {
            let video = slot.querySelector("video");
            if (!video) {
                video = document.createElement("video");
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.width = 160; // Set the width of the video
                video.height = 90; // Set the height of the video
                const videoHeroClass = heroClass.replace("npc_dota_hero_", ""); // Remove the prefix for the video URL
                video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`;
                slot.appendChild(video);
                // Add an intersection observer to lazy load the video
                const observer = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                const video = entry.target;
                                video.src = video.dataset.src;
                                observer.unobserve(video);
                            }
                        });
                    }
                );
                observer.observe(video);
            } else {
                const videoHeroClass = heroClass.replace("npc_dota_hero_", ""); // Remove the prefix for the video URL
                if (
                    video.dataset.src !==
                    `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`
                ) {
                    video.dataset.src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${videoHeroClass}.webm`;
                    // Re-observe the video for lazy loading
                    const observer = new IntersectionObserver(
                        (entries, observer) => {
                            entries.forEach((entry) => {
                                if (entry.isIntersecting) {
                                    const video = entry.target;
                                    video.src = video.dataset.src;
                                    observer.unobserve(video);
                                }
                            });
                        }
                    );
                    observer.observe(video);
                }
            }
            video.alt = heroClass
                .replace("npc_dota_hero_", "")
                .replace("_", " ");
        }

        // Add hero name
        let heroName = slot.querySelector(".hero-name");
        if (!heroName) {
            heroName = document.createElement("div");
            heroName.classList.add("hero-name");
            slot.appendChild(heroName);
        }
        heroName.innerText = heroClass
            .replace("npc_dota_hero_", "")
            .replace("_", " ");

        slot.classList.add("show");

        // Animate the slot
        if (i === team.currentPickIndex) {
            slot.classList.add("animate");
        } else {
            slot.classList.remove("animate");
        }
    }
}
