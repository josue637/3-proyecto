(function() {
    const loginScreen = document.getElementById('login-screen');
    const playerScreen = document.getElementById('player-screen');
    const usernameInput = document.getElementById('username-input');
    const startBtn = document.getElementById('start-btn');
    const greetingText = document.getElementById('greeting-text');
    const songTitleEl = document.getElementById('song-title');
    const songArtistEl = document.getElementById('song-artist');
    const audio = document.getElementById('audio');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationTimeEl = document.getElementById('duration-time');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const songsList = document.getElementById('songs-list');
    const logoutBtn = document.getElementById('logout-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const albumArt = document.getElementById('album-art');
    const equalizer = document.getElementById('equalizer');
    const nowPlayingBadge = document.querySelector('.now-playing-badge');
    const toastContainer = document.getElementById('toast-container');

    const allSongsBtn = document.getElementById('all-songs-btn');
    const userPlaylistsContainer = document.getElementById('user-playlists-container');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');

    let currentSongIndex = -1;
    let isPlaying = false;
    let songs = [];
    let currentUsername = '';
    let toastTimer = null;

    // Modos especiales
    let shuffleMode = false;
    let shuffledQueue = [];
    let shuffleQueueIndex = -1;

    let repeatMode = false;   // repetición de canción

    const defaultSongs = [
        { title: 'Sunset Boulevard', artist: 'Chillwave Collective', duration: '3:42', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', image: 'https://picsum.photos/seed/sunset/300/300', color: '#f59e0b', origIndex: 0 },
        { title: 'Digital Dreams', artist: 'Synthwave Runner', duration: '4:15', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', image: 'https://picsum.photos/seed/digital/300/300', color: '#8b5cf6', origIndex: 1 },
        { title: 'Midnight Jazz', artist: 'The Lounge Lizards', duration: '5:01', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', image: 'https://picsum.photos/seed/jazz/300/300', color: '#3b82f6', origIndex: 2 },
        { title: 'Acoustic Morning', artist: 'Folk & Fable', duration: '3:28', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', image: 'https://picsum.photos/seed/acoustic/300/300', color: '#22c55e', origIndex: 3 },
        { title: 'Electric Pulse', artist: 'Neon Lights', duration: '4:50', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', image: 'https://picsum.photos/seed/electric/300/300', color: '#ef4444', origIndex: 4 },
        { title: 'Smooth Sailing', artist: 'Ocean Waves', duration: '4:02', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', image: 'https://picsum.photos/seed/sailing/300/300', color: '#06b6d4', origIndex: 5 },
        { title: 'Urban Groove', artist: 'City Beats', duration: '3:55', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', image: 'https://picsum.photos/seed/urban/300/300', color: '#f472b6', origIndex: 6 },
    ];

    const staticPlaylists = {
        favoritas: [0, 2, 5],
        concentracion: [1, 3, 6],
        energia: [0, 4, 6, 2],
    };

    let userPlaylists = {};

    // ---------- UTILIDADES ----------
    function showToast(message) {
        if (toastTimer) clearTimeout(toastTimer);
        document.querySelectorAll('.toast').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        toastTimer = setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2200);
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- FUNCIONES DE SHUFFLE ----------
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateShuffledQueue() {
        if (songs.length === 0) {
            shuffledQueue = [];
            shuffleQueueIndex = -1;
            return;
        }
        const indices = Array.from({ length: songs.length }, (_, i) => i);
        shuffledQueue = shuffleArray(indices);
        if (currentSongIndex >= 0 && currentSongIndex < songs.length) {
            shuffleQueueIndex = shuffledQueue.indexOf(currentSongIndex);
            if (shuffleQueueIndex === -1) shuffleQueueIndex = 0;
        } else {
            shuffleQueueIndex = 0;
        }
    }

    function updateShuffleButtonUI() {
        if (shuffleMode) {
            shuffleBtn.classList.add('active');
        } else {
            shuffleBtn.classList.remove('active');
        }
    }

    function toggleShuffle() {
        shuffleMode = !shuffleMode;
        if (shuffleMode) {
            generateShuffledQueue();
            showToast('🔀 Reproducción aleatoria activada');
        } else {
            shuffledQueue = [];
            shuffleQueueIndex = -1;
            showToast('➡️ Reproducción normal');
        }
        updateShuffleButtonUI();
    }

    // ---------- FUNCIONES DE REPEAT ----------
    function updateRepeatButtonUI() {
        if (repeatMode) {
            repeatBtn.classList.add('active');
        } else {
            repeatBtn.classList.remove('active');
        }
    }

    function toggleRepeat() {
        repeatMode = !repeatMode;
        updateRepeatButtonUI();
        showToast(repeatMode ? '🔁 Repetición de canción activada' : '🔁 Repetición desactivada');
    }

    // ---------- INTERFAZ DEL REPRODUCTOR ----------
    function updatePlayerUI() {
        if (currentSongIndex >= 0 && currentSongIndex < songs.length) {
            const song = songs[currentSongIndex];
            songTitleEl.textContent = song.title;
            songArtistEl.textContent = song.artist;
            nowPlayingBadge.style.display = 'inline-block';
            if (song.image) {
                albumArt.style.backgroundImage = `url('${song.image}')`;
                albumArt.style.backgroundSize = 'cover';
                albumArt.style.backgroundPosition = 'center';
                albumArt.textContent = '';
                albumArt.style.color = 'transparent';
            } else {
                albumArt.style.backgroundImage = '';
                albumArt.textContent = '🎵';
                albumArt.style.color = 'rgba(255,255,255,0.7)';
                albumArt.style.background = `linear-gradient(135deg, ${song.color || '#0072ff'}, rgba(0,0,0,0.3))`;
            }
        } else {
            songTitleEl.textContent = 'Ninguna canción seleccionada';
            songArtistEl.textContent = '-';
            nowPlayingBadge.style.display = 'none';
            albumArt.style.backgroundImage = '';
            albumArt.textContent = '🎧';
            albumArt.style.color = 'rgba(255,255,255,0.7)';
            albumArt.style.background = 'linear-gradient(135deg, #0072ff, #00c6ff)';
        }
        updatePlayButton();
        updateEqualizer();
        highlightActiveSong();
        updateShuffleButtonUI();
        updateRepeatButtonUI();
    }

    function updatePlayButton() {
        if (isPlaying) {
            playBtn.textContent = '⏸';
            playBtn.classList.add('playing');
            albumArt.classList.add('playing-animation');
        } else {
            playBtn.textContent = '▶';
            playBtn.classList.remove('playing');
            albumArt.classList.remove('playing-animation');
        }
    }

    function updateEqualizer() {
        equalizer.classList.toggle('stopped', !isPlaying);
    }

    function highlightActiveSong() {
        const items = songsList.querySelectorAll('li');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentSongIndex && isPlaying);
        });
    }

    // ---------- RENDERIZADO DE LA LISTA DE CANCIONES ----------
    function renderSongsList() {
        songsList.innerHTML = '';
        if (songs.length === 0) {
            const li = document.createElement('li');
            li.textContent = '📭 No hay canciones disponibles';
            li.style.color = 'var(--text-muted)';
            li.style.cursor = 'default';
            songsList.appendChild(li);
            return;
        }
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="song-num">${index + 1}</span>
                <div class="song-detail">
                    <span class="s-name">${song.title}</span>
                    <span class="s-artist">${song.artist}</span>
                </div>
                <span class="playing-icon">🔊</span>
                <span class="song-dur">${song.duration}</span>
                <button class="add-to-playlist-btn" data-original-index="${song.origIndex}" title="Agregar a playlist">➕</button>
            `;
            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-playlist-btn')) return;
                if (currentSongIndex === index) togglePlay();
                else loadAndPlaySong(index);
            });
            songsList.appendChild(li);
        });

        document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const originalIndex = parseInt(btn.getAttribute('data-original-index'));
                showAddToPlaylistPrompt(originalIndex);
            });
        });

        highlightActiveSong();
    }

    // ---------- AGREGAR A PLAYLIST (solo a existentes) ----------
    function showAddToPlaylistPrompt(songIndex) {
        const playlistNames = Object.keys(userPlaylists);
        if (playlistNames.length === 0) {
            showToast('⚠️ No tienes playlists. Crea una primero con el botón ➕ Nueva Playlist.');
            return;
        }
        const listStr = playlistNames.join(', ');
        const input = prompt(
            `Agregar canción a una playlist existente.\nPlaylists disponibles: ${listStr}\n\nEscribe el nombre exacto de la playlist:`,
            playlistNames[0]
        );
        if (input && input.trim()) {
            const name = input.trim();
            if (userPlaylists[name]) {
                addSongToExistingPlaylist(songIndex, name);
            } else {
                showToast(`❌ La playlist "${name}" no existe. Solo puedes agregar a playlists existentes.`);
            }
        }
    }

    function addSongToExistingPlaylist(originalIndex, playlistName) {
        if (!userPlaylists[playlistName]) {
            showToast(`❌ Error inesperado: la playlist "${playlistName}" no existe.`);
            return;
        }
        if (!userPlaylists[playlistName].includes(originalIndex)) {
            userPlaylists[playlistName].push(originalIndex);
            showToast(`✅ Canción agregada a "${playlistName}"`);
            if (userPlaylistsContainer) renderUserPlaylists();
        } else {
            showToast(`ℹ️ La canción ya está en "${playlistName}"`);
        }
    }

    // ---------- RENDERIZAR PLAYLISTS DEL USUARIO ----------
    function renderUserPlaylists() {
        if (!userPlaylistsContainer) return;
        userPlaylistsContainer.innerHTML = '';
        Object.keys(userPlaylists).forEach(name => {
            const count = userPlaylists[name].length;
            const div = document.createElement('div');
            div.className = 'playlist-item user-playlist';
            div.setAttribute('data-playlist-user', name);
            div.innerHTML = `
                📋 ${escapeHTML(name)} (${count} canc.)
                <button class="remove-playlist-btn" data-playlist-user="${escapeHTML(name)}" title="Eliminar playlist">✕</button>
            `;
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-playlist-btn')) return;
                loadPlaylist(name, userPlaylists[name]);
            });
            userPlaylistsContainer.appendChild(div);
        });

        document.querySelectorAll('.remove-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = btn.getAttribute('data-playlist-user');
                if (confirm(`¿Eliminar la playlist "${name}"?`)) {
                    delete userPlaylists[name];
                    renderUserPlaylists();
                    showToast(`🗑️ Playlist "${name}" eliminada`);
                }
            });
        });
    }

    function loadPlaylist(playlistName, indices) {
        if (!indices || indices.length === 0) {
            showToast('📭 La playlist está vacía');
            return;
        }
        songs = indices.map(i => ({ ...defaultSongs[i] }));
        currentSongIndex = -1;
        isPlaying = false;
        audio.pause();
        audio.src = '';
        if (shuffleMode) generateShuffledQueue();
        renderSongsList();
        updatePlayerUI();
        showToast(`📋 Playlist "${playlistName}" cargada`);
        const songsTabBtn = document.querySelector('[data-tab="tab-canciones"]');
        if (songsTabBtn) songsTabBtn.click();
    }

    function loadAllSongs() {
        songs = defaultSongs.map(s => ({ ...s }));
        currentSongIndex = -1;
        isPlaying = false;
        audio.pause();
        audio.src = '';
        if (shuffleMode) generateShuffledQueue();
        renderSongsList();
        updatePlayerUI();
        showToast('🎵 Mostrando todas las canciones');
        const songsTabBtn = document.querySelector('[data-tab="tab-canciones"]');
        if (songsTabBtn) songsTabBtn.click();
    }

    // ---------- REPRODUCCIÓN ----------
    function loadAndPlaySong(index) {
        if (index < 0 || index >= songs.length || songs.length === 0) return;
        currentSongIndex = index;
        if (shuffleMode && shuffledQueue.length > 0) {
            const pos = shuffledQueue.indexOf(index);
            if (pos !== -1) {
                shuffleQueueIndex = pos;
            } else {
                generateShuffledQueue();
            }
        }
        const song = songs[index];
        audio.src = song.src;
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayerUI();
                updateMediaSession();
                showToast(`🎶 ${song.title} - ${song.artist}`);
            }).catch(() => {
                isPlaying = false;
                updatePlayerUI();
                showToast('⚠️ No se pudo reproducir. Intenta de nuevo.');
            });
        }
    }

    function togglePlay() {
        if (currentSongIndex < 0) {
            if (songs.length > 0) {
                const startIndex = shuffleMode ? shuffledQueue[0] : 0;
                loadAndPlaySong(startIndex);
            } else {
                showToast('📭 Agrega canciones primero');
            }
            return;
        }
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => { isPlaying = true; }).catch(() => {
                    isPlaying = false;
                    showToast('⚠️ Error al reproducir');
                });
            }
        }
        updatePlayerUI();
        updateMediaSession();
    }

    function playNext() {
        if (songs.length === 0) return;
        if (shuffleMode && shuffledQueue.length > 0) {
            shuffleQueueIndex++;
            if (shuffleQueueIndex >= shuffledQueue.length) {
                generateShuffledQueue();
                shuffleQueueIndex = 0;
            }
            const nextRealIndex = shuffledQueue[shuffleQueueIndex];
            loadAndPlaySong(nextRealIndex);
        } else {
            const nextIndex = (currentSongIndex + 1) % songs.length;
            loadAndPlaySong(nextIndex);
        }
    }

    function playPrevious() {
        if (songs.length === 0) return;
        if (shuffleMode && shuffledQueue.length > 0) {
            shuffleQueueIndex--;
            if (shuffleQueueIndex < 0) {
                shuffleQueueIndex = shuffledQueue.length - 1;
            }
            const prevRealIndex = shuffledQueue[shuffleQueueIndex];
            loadAndPlaySong(prevRealIndex);
        } else {
            const prevIndex = currentSongIndex <= 0 ? songs.length - 1 : currentSongIndex - 1;
            loadAndPlaySong(prevIndex);
        }
    }

    // ---------- MEDIA SESSION ----------
    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;
        if (currentSongIndex >= 0 && currentSongIndex < songs.length && isPlaying) {
            const song = songs[currentSongIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: 'Mi Reproductor Musical Pro',
            });
        }
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => { if (!isPlaying && currentSongIndex >= 0) togglePlay(); });
        navigator.mediaSession.setActionHandler('pause', () => { if (isPlaying) togglePlay(); });
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }

    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
            durationTimeEl.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
        }
    });
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
            currentTimeEl.textContent = formatTime(audio.currentTime);
            progressBar.value = audio.currentTime;
            if (audio.duration && isFinite(audio.duration)) {
                durationTimeEl.textContent = formatTime(audio.duration);
                progressBar.max = audio.duration;
            }
        }
    });
    audio.addEventListener('ended', () => {
        if (repeatMode) {
            // Repetir la misma canción
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    isPlaying = false;
                    updatePlayerUI();
                    showToast('⚠️ Error al repetir la canción');
                });
            }
        } else {
            isPlaying = false;
            updatePlayerUI();
            updateMediaSession();
            setTimeout(() => { if (!isPlaying) playNext(); }, 500);
        }
    });
    audio.addEventListener('play', () => { isPlaying = true; updatePlayerUI(); updateMediaSession(); });
    audio.addEventListener('pause', () => { isPlaying = false; updatePlayerUI(); updateMediaSession(); });
    audio.addEventListener('error', () => { isPlaying = false; updatePlayerUI(); showToast('⚠️ Error al cargar el audio'); });

    progressBar.addEventListener('input', () => {
        const time = parseFloat(progressBar.value);
        if (!isNaN(time) && isFinite(time) && audio.duration) {
            audio.currentTime = time;
            currentTimeEl.textContent = formatTime(time);
        }
    });

    // Listeners de los botones de control
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabPanels.forEach(panel => panel.classList.toggle('hidden-panel', panel.id !== targetTab));
        });
    });

    document.querySelectorAll('.playlist-item[data-playlist]').forEach(item => {
        item.addEventListener('click', () => {
            const playlistKey = item.getAttribute('data-playlist');
            if (playlistKey && staticPlaylists[playlistKey]) {
                loadPlaylist(playlistKey, staticPlaylists[playlistKey]);
            }
        });
    });

    if (allSongsBtn) {
        allSongsBtn.addEventListener('click', loadAllSongs);
    }

    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', () => {
            const name = prompt('Nombre de la nueva playlist:');
            if (name && name.trim()) {
                const trimmed = name.trim();
                if (userPlaylists[trimmed]) {
                    showToast('ℹ️ Esa playlist ya existe');
                } else {
                    userPlaylists[trimmed] = [];
                    renderUserPlaylists();
                    showToast(`✅ Playlist "${trimmed}" creada`);
                }
            }
        });
    }

    document.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', () => showToast(`📁 Carpeta: ${item.textContent.trim()}`));
    });

    // ---------- LOGIN / LOGOUT ----------
    function handleLogin() {
        const name = usernameInput.value.trim();
        if (!name) {
            showToast('😊 Por favor, ingresa tu nombre');
            usernameInput.style.borderColor = 'var(--danger)';
            usernameInput.focus();
            setTimeout(() => usernameInput.style.borderColor = 'var(--border)', 1000);
            return;
        }
        currentUsername = name;
        showPlayerScreen(name);
    }

    function showPlayerScreen(name) {
        loginScreen.classList.add('hidden');
        playerScreen.classList.remove('hidden');
        greetingText.innerHTML = `¡Hola, ${escapeHTML(name)}! <span class="wave">👋</span>`;
        songs = defaultSongs.map(s => ({ ...s }));
        shuffleMode = false;
        shuffledQueue = [];
        shuffleQueueIndex = -1;
        repeatMode = false;
        updateShuffleButtonUI();
        updateRepeatButtonUI();
        renderSongsList();
        if (userPlaylistsContainer) renderUserPlaylists();
        currentSongIndex = -1;
        isPlaying = false;
        audio.src = '';
        audio.load();
        currentTimeEl.textContent = '0:00';
        durationTimeEl.textContent = '0:00';
        progressBar.value = 0;
        updatePlayerUI();
        showToast(`👋 ¡Bienvenido, ${escapeHTML(name)}!`);
    }

    function handleLogout() {
        audio.pause();
        audio.src = '';
        audio.load();
        currentSongIndex = -1;
        isPlaying = false;
        songs = [];
        userPlaylists = {};
        shuffleMode = false;
        shuffledQueue = [];
        shuffleQueueIndex = -1;
        repeatMode = false;
        songsList.innerHTML = '';
        if (userPlaylistsContainer) renderUserPlaylists();
        playerScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        usernameInput.value = '';
        currentTimeEl.textContent = '0:00';
        durationTimeEl.textContent = '0:00';
        progressBar.value = 0;
        updatePlayerUI();
        localStorage.removeItem('musicPlayerUsername');
        currentUsername = '';
        showToast('👋 Sesión cerrada. ¡Hasta pronto!');
    }

    startBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
    });

    document.addEventListener('keydown', (e) => {
        if (loginScreen.classList.contains('hidden') === false) return;
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (e.key === ' ') { e.preventDefault(); togglePlay(); }
        if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); playNext(); }
        if (e.key === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); playPrevious(); }
    });

    function init() {
        loginScreen.classList.remove('hidden');
        playerScreen.classList.add('hidden');
        usernameInput.focus();
        equalizer.classList.add('stopped');
    }
    init();
})();