(function() {
    let siteData = null;
    let audio = document.getElementById("audioElem");
    let isPlaying = false;
    let lyricList = [];
    let currentLyricIdx = -1;
    let firstUserClick = true;

    const profileImg = document.getElementById("profileImg");
    const displayName = document.getElementById("displayName");
    const displayBio = document.getElementById("displayBio");
    const linksContainer = document.getElementById("linksList");
    const playerAlbumArt = document.getElementById("playerAlbumArt");
    const playerSongTitle = document.getElementById("playerSongTitle");
    const playerArtist = document.getElementById("playerArtist");
    const lyricsBoxDiv = document.getElementById("activeLyricLine");
    const playPauseBtn = document.getElementById("playPauseBtnMusic");
    const playIcon = document.getElementById("playIcon");
    const progressFill = document.getElementById("progressFill");
    const currentTimeLabel = document.getElementById("currentTimeLabel");
    const durationLabel = document.getElementById("durationLabel");
    const progressBg = document.getElementById("progressBg");
    const musicWidget = document.getElementById("musicPlayerWidget");
    const togglePlayerBtn = document.getElementById("togglePlayerBtn");
    const welcomeOverlay = document.getElementById("welcomeOverlay");
    const closeWelcome = document.getElementById("closeWelcomeBtn");

    function formatTime(sec) {
        if (isNaN(sec)) return "0:00";
        const mins = Math.floor(sec / 60);
        const remain = Math.floor(sec % 60);
        return `${mins}:${remain < 10 ? "0" : ""}${remain}`;
    }

    function updateLyricsByTime(currentTime) {
        if (!lyricList || lyricList.length === 0) return lyricsBoxDiv.innerText = "No lyrics";
        let activeIndex = -1;
        for (let i = 0; i < lyricList.length; i++) {
            if (currentTime >= lyricList[i].time) activeIndex = i;
            else break;
        }
        if (activeIndex !== -1 && activeIndex !== currentLyricIdx) {
            currentLyricIdx = activeIndex;
            let rawText = lyricList[activeIndex].text;
            if (rawText) lyricsBoxDiv.innerHTML = rawText.replace(/\n/g, "<br>");
        }
    }

    function updateProgressAndTime() {
        if (!audio || !audio.duration || isNaN(audio.duration)) return;
        const current = audio.currentTime;
        const percent = (current / audio.duration) * 100;
        progressFill.style.width = percent + "%";
        currentTimeLabel.innerText = formatTime(current);
        updateLyricsByTime(current);
    }

    function bindAudioEvents() {
        audio.addEventListener("timeupdate", updateProgressAndTime);
        audio.addEventListener("loadedmetadata", () => {
            durationLabel.innerText = formatTime(audio.duration);
            progressFill.style.width = "0%";
        });
        audio.addEventListener("ended", () => {
            isPlaying = false;
            playIcon.className = "iconoir-play";
        });
        audio.addEventListener("play", () => {
            isPlaying = true;
            playIcon.className = "iconoir-pause";
        });
        audio.addEventListener("pause", () => {
            isPlaying = false;
            playIcon.className = "iconoir-play";
        });
    }

    function setupMusic(musicData) {
        if (!musicData) return;
        playerSongTitle.innerText = musicData.title || "Unknown Track";
        playerArtist.innerText = musicData.artist || "Unknown Artist";
        if (musicData.albumArt) playerAlbumArt.src = musicData.albumArt;
        if (musicData.audioFile) {
            audio.src = musicData.audioFile;
            audio.load();
        }
        if (musicData.timeSync && Array.isArray(musicData.timeSync)) {
            lyricList = musicData.timeSync.map(item => ({
                time: item.time,
                text: item.text
            }));
            lyricList.sort((a, b) => a.time - b.time);
        }
        bindAudioEvents();
    }

    function togglePlayback() {
        if (!audio.src || audio.src === "") return;
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }

    function seek(e) {
        if (!audio.duration || isNaN(audio.duration)) return;
        const rect = progressBg.getBoundingClientRect();
        let percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        audio.currentTime = percent * audio.duration;
        updateProgressAndTime();
    }

    function renderLinks(linksArray) {
        if (!linksContainer) return;
        linksContainer.innerHTML = "";
        linksArray.forEach(link => {
            if (!link.url || link.url === "") return;
            const a = document.createElement("a");
            a.className = "link-btn";
            a.href = link.url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            const icon = document.createElement("i");
            let iconClass = link.icon || "iconoir-link";
            if (!iconClass.startsWith("iconoir")) iconClass = "iconoir-link";
            icon.className = iconClass;
            a.appendChild(icon);
            a.appendChild(document.createTextNode(link.title));
            linksContainer.appendChild(a);
        });
    }

    function updateProfile(profile) {
        if (profile.name) displayName.innerText = profile.name;
        if (profile.bio) displayBio.innerText = profile.bio;
        if (profile.image && profile.image !== "") profileImg.src = profile.image;
    }

    function loadData() {
        fetch("data.json").then(response => {
            if (!response.ok) throw new Error("JSON not found");
            return response.json();
        }).then(data => {
            applyFullData(data);
        });
    }

    function applyFullData(data) {
        if (!data) return;
        if (data.profile) updateProfile(data.profile);
        if (data.links) renderLinks(data.links);
        if (data.music) setupMusic(data.music);
    }

    function initWelcome() {
        const lastVisit = localStorage.getItem("lastVisitMono");
        const now = Date.now();
        if (!lastVisit || now - parseInt(lastVisit) > 3600000) {
            welcomeOverlay.classList.add("visible");
            localStorage.setItem("lastVisitMono", now);
        }
        closeWelcome.addEventListener("click", () => welcomeOverlay.classList.remove("visible"));
        welcomeOverlay.addEventListener("click", (e) => {
            if (e.target === welcomeOverlay) welcomeOverlay.classList.remove("visible");
        });
    }

    let isMinimized = false;
    togglePlayerBtn.addEventListener("click", () => {
        isMinimized = !isMinimized;
        musicWidget.classList.toggle("minimized", isMinimized);
        togglePlayerBtn.innerHTML = isMinimized ? '<i class="iconoir-arrow-up"></i>' : '<i class="iconoir-arrow-down"></i>';
    });

    playPauseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlayback();
    });
    if (progressBg) progressBg.addEventListener("click", seek);

    function onFirstInteraction() {
        if (firstUserClick) {
            firstUserClick = false;
            if (audio && audio.src && audio.paused) audio.play().catch(() => {});
            document.removeEventListener("click", onFirstInteraction);
            document.removeEventListener("touchstart", onFirstInteraction);
        }
    }
    document.addEventListener("click", onFirstInteraction);
    document.addEventListener("touchstart", onFirstInteraction);

    loadData();
    initWelcome();
    setInterval(() => {
        if (audio && !audio.paused && audio.duration) updateProgressAndTime();
        else if (audio && audio.paused && audio.currentTime) updateProgressAndTime();
    }, 200);
})();