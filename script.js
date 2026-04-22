// Menemukan script.js yang diperbaiki untuk menampilkan lirik
let userData = null;
let currentLyricIndex = -1;
let songDuration = 60;
let isPlaying = false;
let isFirstInteraction = true;

const profilePic = document.getElementById('profilePic');
const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const linksContainer = document.getElementById('linksContainer');
const currentYear = document.getElementById('currentYear');
const albumArt = document.getElementById('albumArt');
const songTitle = document.getElementById('songTitle');
const artist = document.getElementById('artist');
const lyrics = document.getElementById('lyrics');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const musicPlayer = document.getElementById('musicPlayer');
const musicToggle = document.getElementById('musicToggle');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const welcomePanel = document.getElementById('welcomePanel');
const welcomeCloseBtn = document.getElementById('welcomeCloseBtn');
const audioPlayer = document.getElementById('audioPlayer');

function checkWelcomePanel() {
    const lastVisit = localStorage.getItem('lastVisit');
    const currentTime = new Date().getTime();
    
    if (!lastVisit || (currentTime - lastVisit) > 60000) { 
        welcomePanel.classList.add('visible');
        localStorage.setItem('lastVisit', currentTime);
    }
}

welcomeCloseBtn.addEventListener('click', () => {
    welcomePanel.classList.remove('visible');
});

function getAverageColor(imageElement, callback) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!imageElement.complete) {
        imageElement.onload = function() {
            extractColor();
        };
    } else {
        extractColor();
    }

    function extractColor() {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            pixelCount++;
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? '33, 33, 33' : '255, 255, 255';
        
        const bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`;

        const hue1 = Math.floor(Math.random() * 360);
        const hue2 = (hue1 + 180) % 360;

        const primaryColor = `hsl(${hue1}, 70%, 50%)`;
        const secondaryColor = `hsl(${hue2}, 70%, 50%)`;

        callback(bgColor, `rgb(${textColor})`, textColor, primaryColor, secondaryColor);
    }
}

function initializeFromJSON(data) {
    userData = data;

    profileName.textContent = data.profile.name;
    profileBio.textContent = data.profile.bio;
    profilePic.crossOrigin = "Anonymous";
    profilePic.src = data.profile.image;
    
    profilePic.onload = function() {
        getAverageColor(profilePic, (bgColor, textColor, textColorRgb, primaryColor, secondaryColor) => {
            document.body.style.backgroundColor = bgColor;
            document.documentElement.style.setProperty('--bg-color', bgColor);
            document.documentElement.style.setProperty('--text-color', textColor);
            document.documentElement.style.setProperty('--text-color-rgb', textColorRgb);
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        });
    };
    

    linksContainer.innerHTML = '';
    
    data.links.forEach((link, index) => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.className = 'link-item animate-link';
        linkElement.style.animationDelay = `${0.1 * (index + 1)}s`;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        
        const icon = document.createElement('i');
        icon.className = link.icon;
        
        const text = document.createTextNode(link.title);
        
        linkElement.appendChild(icon);
        linkElement.appendChild(text);
        
        linksContainer.appendChild(linkElement);
    });
    

    songTitle.textContent = data.music.title;
    artist.textContent = data.music.artist;
    albumArt.src = data.music.albumArt;
    
    if (data.music.audioFile) {
        audioPlayer.src = data.music.audioFile;
        
        audioPlayer.addEventListener('loadedmetadata', function() {
            songDuration = audioPlayer.duration;
            totalTimeDisplay.textContent = formatTime(songDuration);
        });

        audioPlayer.addEventListener('timeupdate', function() {
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            const percent = (audioPlayer.currentTime / songDuration) * 100;
            progressBar.style.width = `${percent}%`;

            updateLyricsDisplay(audioPlayer.currentTime);
        });

        audioPlayer.addEventListener('ended', function() {
            audioPlayer.currentTime = 0;
            if (isPlaying) {
                audioPlayer.play();
            } else {
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
            }
        });
    } else {
        songDuration = data.music.duration || 60;
        totalTimeDisplay.textContent = formatTime(songDuration);
    }
    
    // PERBAIKAN: Periksa format timeSync dan pastikan kita mengakses elemen dengan benar
    if (data.music.timeSync) {
        console.log("Lyrics data loaded:", data.music.timeSync);
        updateLyricsDisplay(0);
    } else {
       lyrics.textContent = data.music.lyrics || "No lyrics available";
    }
    currentYear.textContent = new Date().getFullYear();
}

function updateLyricsDisplay(time) {
    if (!userData || !userData.music.timeSync) return;

    // PERBAIKAN: Deteksi dan tangani format yang ada di data.json
    // Jika timeSync adalah array dalam array, ambil array pertama
    let lyricArray = userData.music.timeSync;
    if (Array.isArray(lyricArray) && lyricArray.length > 0 && Array.isArray(lyricArray[0])) {
        lyricArray = lyricArray[0];
        console.log("Detected nested array format, using first array:", lyricArray.length, "items");
    }

    let currentLyric = null;
    let newLyricIndex = -1;
    
    for (let i = 0; i < lyricArray.length; i++) {
        if (lyricArray[i].time <= time) {
            currentLyric = lyricArray[i];
            newLyricIndex = i;
        } else {
            break;
        }
    }

    if (currentLyric && newLyricIndex !== currentLyricIndex) {
        currentLyricIndex = newLyricIndex;
        
        lyrics.innerHTML = '';
        
        const lyricLine = document.createElement('div');
        lyricLine.className = 'lyrics-line active';
        lyricLine.textContent = currentLyric.text;
        
        lyrics.appendChild(lyricLine);
        
        lyricLine.classList.add('lyrics-fade-in');
        setTimeout(() => {
            lyricLine.classList.remove('lyrics-fade-in');
        }, 500);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        playPauseIcon.className = 'fas fa-pause';
        if (audioPlayer.src) {
            audioPlayer.play();
        }
    } else {
        playPauseIcon.className = 'fas fa-play';
        if (audioPlayer.src) {
            audioPlayer.pause();
        }
    }
}

musicToggle.addEventListener('click', () => {
    musicPlayer.classList.toggle('hidden');
});

playPauseBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePlayPause();
});

document.querySelector('.progress-container').addEventListener('click', function(e) {
    if (audioPlayer.src) {
        const progressContainer = this;
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * songDuration;
    }
});

document.addEventListener('click', function playOnFirstInteraction() {
    if (isFirstInteraction) {
        isFirstInteraction = false;
        // Start playing music
        if (!isPlaying) {
            togglePlayPause();
        }
        document.removeEventListener('click', playOnFirstInteraction);
    }
}, true);


document.addEventListener('DOMContentLoaded', function() {
    checkWelcomePanel();
    
    currentLyricIndex = -1; 
    
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log("Data loaded successfully:", data);
            initializeFromJSON(data);
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});