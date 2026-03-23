const API_QURAN = "https://equran.id/api/v2";
let allSurahs = [], currentSurah = null, audioEngine = document.getElementById('audio-engine'), activeAyahIndex = -1;

// PREFERENCES & STATE
let prefs = JSON.parse(localStorage.getItem('rifqyPrefs')) || { qari: "05", arabSize: 32, latinSize: 14, showLatin: true, showTrans: true, showTajwid: true, autoplay: true };
let bookmark = JSON.parse(localStorage.getItem('rifqyBookmark')) || null;
let alarms = JSON.parse(localStorage.getItem('rifqyAlarms')) || { master: false, sahur: "", sholat: "" };

document.addEventListener('DOMContentLoaded', () => {
    initDate(); fetchSurahs(); loadPrefsUI(); checkBookmark(); checkAlarmsLoop();
    
    // Setup Media Session untuk Audio Background (Lockscreen)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', toggleAudioSurah);
        navigator.mediaSession.setActionHandler('pause', toggleAudioSurah);
    }
});

// --- 1. NAVIGASI ---
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if(pageId === 'page-home') { document.getElementById('nav-home-mob')?.classList.add('active'); document.getElementById('nav-home-desk')?.classList.add('active'); }
    if(pageId === 'page-tools') { document.getElementById('nav-tools-mob')?.classList.add('active'); document.getElementById('nav-tools-desk')?.classList.add('active'); getLocationAndPrayerTimes(); }
    if(pageId === 'page-community') { document.getElementById('nav-comm-mob')?.classList.add('active'); document.getElementById('nav-comm-desk')?.classList.add('active'); }
    window.scrollTo(0,0);
}

// --- 2. QURAN ENGINE (PENCARIAN, VOICE, RENDER) ---
async function fetchSurahs() {
    try {
        const res = await fetch(`${API_QURAN}/surat`);
        allSurahs = (await res.json()).data;
        renderSurahs(allSurahs);
    } catch (e) { document.getElementById('surah-list').innerHTML = `<p class="text-center text-muted">Gagal memuat Quran.</p>`; }
}
function renderSurahs(data) {
    document.getElementById('surah-list').innerHTML = data.map(s => `
        <div class="surah-card" onclick="openSurah(${s.nomor})">
            <div class="s-num">${s.nomor}</div>
            <div style="flex:1;"><h4>${s.namaLatin}</h4><p class="small text-muted">${s.arti} • ${s.jumlahAyat} Ayat</p></div>
            <div class="s-arab font-arab" style="font-size:20px">${s.nama}</div>
        </div>
    `).join('');
}
function filterSurah() {
    const q = document.getElementById('search-input').value.toLowerCase();
    // Bisa cari pakai nama atau nomor surat
    renderSurahs(allSurahs.filter(s => s.namaLatin.toLowerCase().includes(q) || s.nomor.toString() === q));
}

// VOICE SEARCH
function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.start();
        document.getElementById('search-input').placeholder = "Mendengarkan...";
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('search-input').value = transcript;
            filterSurah();
            document.getElementById('search-input').placeholder = "Cari Surat...";
        };
        recognition.onerror = function() {
            alert("Suara tidak terdengar jelas.");
            document.getElementById('search-input').placeholder = "Cari Surat...";
        };
    } else { alert("Browser Anda tidak mendukung pencarian suara."); }
}

// BUKA SURAT
async function openSurah(nomor) {
    switchPage('page-read');
    document.getElementById('ayah-list').innerHTML = `<div class="text-center mt-3"><i class="fas fa-spinner fa-spin text-primary"></i> Memuat ayat...</div>`;
    try {
        currentSurah = (await (await fetch(`${API_QURAN}/surat/${nomor}`)).json()).data;
        document.getElementById('read-surah-name').innerText = currentSurah.namaLatin;
        document.getElementById('read-surah-info').innerText = `Surat ke-${currentSurah.nomor} • ${currentSurah.jumlahAyat} Ayat`;
        
        // Update Media Session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({ title: currentSurah.namaLatin, artist: 'Rifqy Al-Quran', album: 'Murottal' });
        }

        let html = currentSurah.nomor !== 9 && currentSurah.nomor !== 1 ? `<div class="text-arab text-primary text-center" style="font-size:${prefs.arabSize}px;">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>` : '';
        html += currentSurah.ayat.map((a, i) => `
            <div class="ayah-item" id="ayah-${i}">
                <div class="ayah-header">
                    <span class="ayah-badge">${currentSurah.nomor}:${a.nomorAyat}</span>
                    <button class="btn-icon text-primary" onclick="playAyah(${i}, '${a.audio[prefs.qari]}')"><i class="fas fa-play-circle"></i></button>
                </div>
                <div class="text-arab" style="font-size:${prefs.arabSize}px;">${prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab}</div>
                <div class="text-latin ${prefs.showLatin?'':'hidden'}" style="font-size:${prefs.latinSize}px;">${a.teksLatin}</div>
                <div class="text-trans ${prefs.showTrans?'':'hidden'}" style="font-size:${prefs.latinSize}px;">${a.teksIndonesia}</div>
            </div>
        `).join('');
        document.getElementById('ayah-list').innerHTML = html;
        if(!audioEngine.paused) audioEngine.pause(); // Reset audio
    } catch(e) { alert("Gagal memuat surat."); switchPage('page-home'); }
}

// --- 3. MESIN TAJWID & POPUP INFO ---
function applyTajwid(t) {
    return t.replace(/([نم])[\u0651]/g, `<span class="t-rule tj-ghunnah" onclick="infoTajwid('Ghunnah', 'Dengung 2-3 harakat karena huruf Nun/Mim bertasydid.', '$&')">$&</span>`)
            .replace(/([بجدطق])\u0652/g, `<span class="t-rule tj-qalqalah" onclick="infoTajwid('Qalqalah', 'Dipantulkan karena huruf Qalqalah berharakat Sukun.', '$&')">$&</span>`)
            .replace(/[\u0653]/g, `<span class="t-rule tj-mad" onclick="infoTajwid('Mad Wajib/Jaiz', 'Dibaca panjang 4-5 harakat karena ada tanda bendera.', '$&')">$&</span>`)
            .replace(/[\u06E2]/g, `<span class="t-rule tj-iqlab" onclick="infoTajwid('Iqlab', 'Suara Nun Mati/Tanwin diganti menjadi Mim, berdengung karena bertemu Ba.', '$&')">$&</span>`)
            .replace(/[\u064B\u064C\u064D]/g, `<span class="t-rule tj-ikhfa" onclick="infoTajwid('Ikhfa / Idgham', 'Perhatikan Tanwin ini, bacaannya disamarkan atau dilebur ke huruf setelahnya.', '$&')">$&</span>`);
}

function infoTajwid(title, desc, letters) {
    document.getElementById('t-info-title').innerText = title;
    document.getElementById('t-info-desc').innerText = desc;
    document.getElementById('t-info-letters').innerText = letters;
    document.getElementById('modal-tajwid-info').style.display = 'flex';
}

// --- 4. AUDIO, AUTOPLAY & BOOKMARK ---
function playAyah(idx, url) {
    document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('playing'));
    audioEngine.src = url; audioEngine.play(); activeAyahIndex = idx;
    
    const card = document.getElementById(`ayah-${idx}`);
    card.classList.add('playing'); 
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

audioEngine.addEventListener('ended', () => {
    if (prefs.autoplay && currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) {
        let nxt = activeAyahIndex + 1; 
        playAyah(nxt, currentSurah.ayat[nxt].audio[prefs.qari]);
    }
});

function toggleAutoplay() { prefs.autoplay = document.getElementById('toggle-autoplay').checked; savePrefs(); }
function openTafsirSurah() { alert("Tafsir Kemenag untuk surat ini sedang disiapkan..."); }

function bookmarkCurrent() {
    if(!currentSurah) return;
    const ayahNo = activeAyahIndex >= 0 ? activeAyahIndex + 1 : 1;
    bookmark = { sNo: currentSurah.nomor, sName: currentSurah.namaLatin, aNo: ayahNo };
    localStorage.setItem('rifqyBookmark', JSON.stringify(bookmark));
    alert(`Berhasil menandai Surat ${currentSurah.namaLatin} Ayat ${ayahNo}`);
    checkBookmark();
}

function checkBookmark() {
    const card = document.getElementById('continue-reading-card');
    if(bookmark) {
        document.getElementById('cr-surah').innerText = bookmark.sName;
        document.getElementById('cr-ayah').innerText = `Ayat ${bookmark.aNo}`;
        card.classList.remove('hidden');
    } else { card.classList.add('hidden'); }
}

function continueReading() { if(bookmark) openSurah(bookmark.sNo); }

// --- 5. PENGATURAN UI DARI HALAMAN BACA ---
function openSettingsModal() { document.getElementById('modal-settings').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function changeQari() { prefs.qari = document.getElementById('qari-selector').value; savePrefs(); }
function updateFont(type, val) {
    if(type === 'arab') { prefs.arabSize = val; document.querySelectorAll('.text-arab').forEach(e => e.style.fontSize = val+'px'); }
    else { prefs.latinSize = val; document.querySelectorAll('.text-latin, .text-trans').forEach(e => e.style.fontSize = val+'px'); }
    savePrefs();
}
function toggleFeature() {
    prefs.showLatin = document.getElementById('toggle-latin').checked;
    prefs.showTrans = document.getElementById('toggle-trans').checked;
    prefs.showTajwid = document.getElementById('toggle-tajwid').checked;
    document.querySelectorAll('.text-latin').forEach(e => e.classList.toggle('hidden', !prefs.showLatin));
    document.querySelectorAll('.text-trans').forEach(e => e.classList.toggle('hidden', !prefs.showTrans));
    savePrefs();
    if(currentSurah) openSurah(currentSurah.nomor); // Rerender tajwid
}
function savePrefs() { localStorage.setItem('rifqyPrefs', JSON.stringify(prefs)); }
function loadPrefsUI() {
    document.getElementById('qari-selector').value = prefs.qari;
    document.getElementById('toggle-latin').checked = prefs.showLatin;
    document.getElementById('toggle-trans').checked = prefs.showTrans;
    document.getElementById('toggle-tajwid').checked = prefs.showTajwid;
    if(document.getElementById('toggle-autoplay')) document.getElementById('toggle-autoplay').checked = prefs.autoplay;
}

// --- 6. ALAT & ALARM ---
function initDate() {
    document.getElementById('date-hijri-mob').innerHTML = `${new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long' }).format(new Date())} <i class="fas fa-calendar-alt"></i>`;
}

function toggleMasterAlarm() { alarms.master = document.getElementById('alarm-master').checked; saveAlarms(); }
function saveAlarms() {
    alarms.sahur = document.getElementById('alarm-sahur').value;
    alarms.sholat = document.getElementById('alarm-sholat').value;
    localStorage.setItem('rifqyAlarms', JSON.stringify(alarms));
}
function checkAlarmsLoop() {
    document.getElementById('alarm-master').checked = alarms.master;
    document.getElementById('alarm-sahur').value = alarms.sahur;
    document.getElementById('alarm-sholat').value = alarms.sholat;
    
    setInterval(() => {
        if(!alarms.master) return;
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        // Jika menit pas (cegah spam alert pakai deteksi detik 00)
        if(now.getSeconds() === 0) {
            if(currentTime === alarms.sahur) alert("Waktunya Sahur / Tahajud!");
            if(currentTime === alarms.sholat) alert("Pengingat Waktu Sholat!");
        }
    }, 1000);
}

// Dummy Fungsi Lokasi & Jadwal (Simplifikasi)
function getLocationAndPrayerTimes() {
    // Simulasi render jadwal Jakarta untuk tampilan
    document.getElementById('prayer-times').innerHTML = `
        <div class="prayer-item"><small>Subuh</small><strong>04:30</strong></div>
        <div class="prayer-item"><small>Dzuhur</small><strong>12:00</strong></div>
        <div class="prayer-item"><small>Ashar</small><strong>15:15</strong></div>
        <div class="prayer-item bg-primary text-white"><small>Maghrib</small><strong>18:12</strong></div>
        <div class="prayer-item"><small>Isya</small><strong>19:20</strong></div>
    `;
}
