/* ==============================================================
   PREMIUM.JS - TAFSIR COMPARISON & MEDIA SESSION
   ============================================================== */

window.openTafsirPerAyat = async function(surahNo, ayahNo) {
    document.getElementById('tafsir-content').innerHTML = `<div class="text-center p-4"><i class="fas fa-circle-notch fa-spin text-primary" style="font-size:30px;"></i></div>`;
    document.getElementById('tafsir-ringkas-content').innerHTML = `<div class="text-center p-4"><i class="fas fa-circle-notch fa-spin text-primary" style="font-size:30px;"></i></div>`;
    
    document.getElementById('tafsir-title-header').innerHTML = `<i class="fas fa-book-open"></i> Tafsir Ayat ${ayahNo}`;
    window.switchTafsirTab('kemenag'); // Reset ke Tab Pertama
    window.openModal('modal-tafsir');
    
    try {
        const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNo}`); 
        const data = await res.json();
        const tafsirTeks = data.data.tafsir.find(t => t.ayat == ayahNo).teks;
        
        // Tab Kemenag Lengkap
        document.getElementById('tafsir-content').innerHTML = `<p style="text-align: justify; font-size:14px; line-height:1.7;">${tafsirTeks}</p>`;
        
        // Simulasi Tab Terjemah Ringkas (Mengambil Terjemahan Utama)
        if(window.currentSurah) {
            const terjemah = window.currentSurah.ayat.find(a => a.nomorAyat == ayahNo).teksIndonesia;
            document.getElementById('tafsir-ringkas-content').innerHTML = `<p style="text-align: justify; font-size:15px; font-weight:bold; color: var(--primary-color);">"${terjemah}"</p><p class="small mt-2">Ini adalah terjemahan langsung dari ayat untuk memudahkan pemahaman ringkas.</p>`;
        }
    } catch(e) { 
        document.getElementById('tafsir-content').innerHTML = `<p class="text-danger font-bold text-center">Gagal memuat tafsir. Periksa koneksi.</p>`; 
    }
};

window.switchTafsirTab = function(tabName) {
    const tabK = document.getElementById('tab-kemenag');
    const tabR = document.getElementById('tab-ringkas');
    const contentK = document.getElementById('tafsir-content');
    const contentR = document.getElementById('tafsir-ringkas-content');

    if(tabName === 'kemenag') {
        tabK.style.borderBottom = "3px solid var(--primary-color)"; tabK.style.color = "var(--primary-color)";
        tabR.style.borderBottom = "3px solid transparent"; tabR.style.color = "var(--text-muted)";
        contentK.classList.remove('hidden'); contentR.classList.add('hidden');
    } else {
        tabR.style.borderBottom = "3px solid var(--primary-color)"; tabR.style.color = "var(--primary-color)";
        tabK.style.borderBottom = "3px solid transparent"; tabK.style.color = "var(--text-muted)";
        contentR.classList.remove('hidden'); contentK.classList.add('hidden');
    }
};

// --- MEDIA SESSION ---
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
        const qariNames = { 
            "01": "Mahmoud Khalil Al-Husary", "02": "Abdul Muhsir Al-Qasim", "03": "Abdurrahman As-Sudais", "04": "Ibrahim Al-Dawsari", 
            "05": "Mishary Rashid Alafasy", "06": "Yasser Al-Dosari", "07": "Saad Al-Ghamdi", "08": "Maher Al-Muaiqly", "09": "Abdullah Al-Matrood"
        };
        const artistName = qariNames[window.prefs.qari] || "Qari Internasional";
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `Q.S ${window.currentSurah.namaLatin} : ${window.currentSurah.ayat[idx].nomorAyat}`,
            artist: artistName,
            album: 'Rifqy Al-Quran',
            artwork: [{ src: 'https://equran.id/favicon.png', sizes: '512x512', type: 'image/png' }]
        });
    }
};
