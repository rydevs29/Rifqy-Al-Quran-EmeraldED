/* ==============================================================
   PREMIUM.JS - FITUR AI, VISUAL ADVANCED, DAN MEDIA SESSION
   ============================================================== */

let isRecording = false;

window.toggleRecord = async function(ayahIndex) {
    const btn = document.getElementById(`btn-record-${ayahIndex}`); const audioPlayback = document.getElementById(`audio-user-${ayahIndex}`);
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => { audioPlayback.src = URL.createObjectURL(new Blob(audioChunks, { type: 'audio/webm' })); audioPlayback.classList.remove('hidden'); audioChunks = []; };
            mediaRecorder.start(); isRecording = true; btn.classList.add('recording'); alert("Mulai merekam...");
        } catch (err) { alert("Gagal akses mikrofon."); }
    } else { mediaRecorder.stop(); isRecording = false; btn.classList.remove('recording'); alert("Rekaman selesai."); }
};

window.openTafsirPerAyat = async function(surahNo, ayahNo) {
    document.getElementById('tafsir-content').innerHTML = `<div class="text-center"><i class="fas fa-spinner fa-spin text-primary"></i> Mengambil Tafsir...</div>`;
    openModal('modal-tafsir');
    try {
        const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNo}`); const data = await res.json();
        const tafsirTeks = data.data.tafsir.find(t => t.ayat === ayahNo).teks;
        document.getElementById('tafsir-content').innerHTML = `<h4 class="text-primary mb-2">Tafsir Kemenag (Ayat ${ayahNo})</h4><p style="text-align: justify;">${tafsirTeks}</p>`;
    } catch(e) { document.getElementById('tafsir-content').innerHTML = `<p class="text-danger">Gagal memuat tafsir.</p>`; }
};

// --- MEDIA SESSION (NOTIFIKASI BACKGROUND PLAYER) ---
window.initMediaSession = function() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => { if(audioEngine) audioEngine.play(); });
        navigator.mediaSession.setActionHandler('pause', () => { if(audioEngine) audioEngine.pause(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { if(activeAyahIndex > 0) playAyah(activeAyahIndex - 1); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { if(currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) playAyah(activeAyahIndex + 1); });
    }
};

window.updateMediaSession = function(idx) {
    if ('mediaSession' in navigator && currentSurah) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Q.S ${currentSurah.namaLatin} : ${currentSurah.ayat[idx].nomorAyat}`,
            artist: 'Syekh Mishary Rashid',
            album: 'Rifqy Al-Quran',
            artwork: [{ src: 'https://equran.id/favicon.png', sizes: '512x512', type: 'image/png' }]
        });
    }
};
