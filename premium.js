/* ==============================================================
   PREMIUM.JS - WALLPAPER & RECORDER
   ============================================================== */

window.isRecording = false;

window.toggleRecord = async function(ayahIndex) {
    const btn = document.getElementById(`btn-record-${ayahIndex}`); const audioPlayback = document.getElementById(`audio-user-${ayahIndex}`);
    if (!window.isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); window.mediaRecorder = new MediaRecorder(stream);
            window.mediaRecorder.ondataavailable = e => window.audioChunks.push(e.data);
            window.mediaRecorder.onstop = () => { audioPlayback.src = URL.createObjectURL(new Blob(window.audioChunks, { type: 'audio/webm' })); audioPlayback.classList.remove('hidden'); window.audioChunks = []; };
            window.mediaRecorder.start(); window.isRecording = true; btn.classList.add('recording'); alert("Mulai merekam...");
        } catch (err) { alert("Gagal akses mikrofon."); }
    } else { window.mediaRecorder.stop(); window.isRecording = false; btn.classList.remove('recording'); alert("Rekaman selesai."); }
};

window.openWallpaperCreator = function(idx) {
    if(!window.currentSurah) return;
    const a = window.currentSurah.ayat[idx];
    document.getElementById('wp-arab').innerText = a.teksArab; document.getElementById('wp-indo').innerText = `"${a.teksIndonesia}"`; document.getElementById('wp-source').innerText = `Q.S ${window.currentSurah.namaLatin} : ${a.nomorAyat}`;
    window.openModal('modal-wallpaper');
};

// --- MEDIA SESSION (NOTIFIKASI BACKGROUND PLAYER) ---
window.initMediaSession = function() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => { if(window.audioEngine) window.audioEngine.play(); });
        navigator.mediaSession.setActionHandler('pause', () => { if(window.audioEngine) window.audioEngine.pause(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { if(window.activeAyahIndex > 0) window.playAyah(window.activeAyahIndex - 1); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { if(window.currentSurah && window.activeAyahIndex < window.currentSurah.ayat.length - 1) window.playAyah(window.activeAyahIndex + 1); });
    }
};

window.updateMediaSession = function(idx) {
    if ('mediaSession' in navigator && window.currentSurah) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Q.S ${window.currentSurah.namaLatin} : ${window.currentSurah.ayat[idx].nomorAyat}`,
            artist: 'Syekh Mishary Rashid',
            album: 'Rifqy Al-Quran',
            artwork: [{ src: 'https://equran.id/favicon.png', sizes: '512x512', type: 'image/png' }]
        });
    }
};
