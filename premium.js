/* ==============================================================
   PREMIUM.JS - WALLPAPER DOWNLOADER, TAFSIR, & MEDIA SESSION
   ============================================================== */

window.openTafsirPerAyat = async function(surahNo, ayahNo) {
    document.getElementById('tafsir-content').innerHTML = `<div class="text-center"><i class="fas fa-circle-notch fa-spin text-primary" style="font-size:30px;"></i><p class="mt-2">Mengambil Tafsir...</p></div>`;
    window.openModal('modal-tafsir');
    try {
        const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNo}`); 
        const data = await res.json();
        const tafsirTeks = data.data.tafsir.find(t => t.ayat == ayahNo).teks;
        document.getElementById('tafsir-content').innerHTML = `<h4 class="text-primary mb-2 font-bold">Tafsir Kemenag (Ayat ${ayahNo})</h4><p style="text-align: justify; font-size:14px; line-height:1.7;">${tafsirTeks}</p>`;
    } catch(e) { document.getElementById('tafsir-content').innerHTML = `<p class="text-danger font-bold text-center">Gagal memuat tafsir. Periksa koneksi.</p>`; }
};

// --- WALLPAPER REAL DOWNLOAD ---
window.downloadWallpaper = function() {
    const canvasEl = document.getElementById('wallpaper-canvas');
    const btn = document.querySelector('#modal-wallpaper .btn-primary');
    const oldText = btn.innerHTML;
    
    // Indikator Loading
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses Gambar...';
    
    html2canvas(canvasEl, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = `RifqyQuran-Wallpaper.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = oldText;
        window.closeModal('modal-wallpaper');
        alert("Wallpaper berhasil diunduh ke galeri!");
    }).catch(err => {
        alert("Gagal mengunduh gambar.");
        btn.innerHTML = oldText;
    });
};

// --- MEDIA SESSION (BACKGROUND PLAYER) ---
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
        const qariNames = { "01": "Mahmoud Khalil Al-Husary", "02": "Abdul Muhsir Al-Qasim", "03": "Abdurrahman As-Sudais", "04": "Ibrahim Al-Dawsari", "05": "Mishary Rashid Alafasy" };
        const artistName = qariNames[window.prefs.qari] || "Mishary Rashid Alafasy";
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Q.S ${window.currentSurah.namaLatin} : ${window.currentSurah.ayat[idx].nomorAyat}`,
            artist: artistName,
            album: 'Rifqy Al-Quran',
            artwork: [{ src: 'https://equran.id/favicon.png', sizes: '512x512', type: 'image/png' }]
        });
    }
};
