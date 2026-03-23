const API_QURAN = "https://equran.id/api/v2";
let allSurahs = [], currentSurah = null, audioEngine = document.getElementById('audio-engine'), activeAyahIndex = -1;

let prefs = { qari: "05", arabSize: 32, latinSize: 14, showLatin: true, showTrans: true, showTajwid: true };
let userLocation = { lat: -6.200000, lng: 106.816666 }; // Default: Jakarta

document.addEventListener('DOMContentLoaded', () => {
    initDate(); fetchSurahs(); getLocationAndPrayerTimes();
});

// --- NAVIGASI ---
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if(pageId === 'page-home') {
        document.getElementById('nav-home-desk')?.classList.add('active');
        document.getElementById('nav-home-mob')?.classList.add('active');
    } else if(pageId === 'page-tools') {
        document.getElementById('nav-tools-desk')?.classList.add('active');
        document.getElementById('nav-tools-mob')?.classList.add('active');
    }
    window.scrollTo(0,0);
}

// --- TANGGAL & KALENDER ---
function initDate() {
    const today = new Date();
    document.getElementById('date-gregorian').innerText = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('date-hijri').innerHTML = `${new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(today)} <i class="fas fa-calendar-alt"></i>`;
}
function openCalendarModal() {
    document.getElementById('modal-calendar').style.display = 'flex';
    document.getElementById('cal-month-year').innerText = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { month: 'long', year: 'numeric' }).format(new Date());
    const grid = document.getElementById('cal-grid');
    const todayNum = parseInt(new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric' }).format(new Date()));
    grid.innerHTML = Array.from({length: 30}, (_, i) => `<div class="cal-day ${i+1 === todayNum ? 'today' : ''}">${i+1}</div>`).join('');
}

// --- QURAN FETCH & BACA ---
async function fetchSurahs() {
    try {
        const res = await fetch(`${API_QURAN}/surat`);
        allSurahs = (await res.json()).data;
        renderSurahs(allSurahs);
    } catch (e) { document.getElementById('surah-list').innerHTML = `<p class="text-center">Gagal memuat Quran.</p>`; }
}
function renderSurahs(data) {
    document.getElementById('surah-list').innerHTML = data.map(s => `
        <div class="surah-card" onclick="openSurah(${s.nomor})">
            <div class="s-num">${s.nomor}</div>
            <div style="flex:1;"><h4>${s.namaLatin}</h4><p class="small text-muted">${s.arti} • ${s.jumlahAyat} Ayat</p></div>
            <div class="s-arab">${s.nama}</div>
        </div>
    `).join('');
}
function filterSurah() {
    const q = document.getElementById('search-input').value.toLowerCase();
    renderSurahs(allSurahs.filter(s => s.namaLatin.toLowerCase().includes(q)));
}
async function openSurah(nomor) {
    switchPage('page-read');
    document.getElementById('ayah-list').innerHTML = `<div class="text-center mt-3"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>`;
    try {
        currentSurah = (await (await fetch(`${API_QURAN}/surat/${nomor}`)).json()).data;
        document.getElementById('read-surah-name').innerText = currentSurah.namaLatin;
        document.getElementById('read-surah-info').innerText = `${currentSurah.tempatTurun} • ${currentSurah.jumlahAyat} Ayat`;
        
        let html = currentSurah.nomor !== 9 ? `<div class="text-arab text-primary text-center" style="font-size:${prefs.arabSize}px;">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>` : '';
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
        if(!audioEngine.paused) toggleAudioSurah();
    } catch(e) { alert("Gagal memuat."); switchPage('page-home'); }
}
function applyTajwid(t) {
    return t.replace(/([نم])[\u0651]/g, '<span class="tj-ghunnah">$&</span>')
            .replace(/([بجدطق])\u0652/g, '<span class="tj-qalqalah">$&</span>')
            .replace(/[\u0653]/g, '<span class="tj-mad">$&</span>')
            .replace(/[\u06E2]/g, '<span class="tj-iqlab">$&</span>')
            .replace(/[\u064B\u064C\u064D]/g, '<span class="tj-ikhfa">$&</span>');
}

// --- AUDIO ENGINE ---
function playAyah(idx, url) {
    document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('playing'));
    audioEngine.src = url; audioEngine.play(); activeAyahIndex = idx;
    const card = document.getElementById(`ayah-${idx}`);
    card.classList.add('playing'); card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('btn-play-surah').classList.replace('fa-play-circle', 'fa-pause-circle');
}
audioEngine.addEventListener('ended', () => {
    if (currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) {
        let nxt = activeAyahIndex + 1; playAyah(nxt, currentSurah.ayat[nxt].audio[prefs.qari]);
    } else { document.getElementById('btn-play-surah').classList.replace('fa-pause-circle', 'fa-play-circle'); }
});
function toggleAudioSurah() {
    if(audioEngine.paused) {
        if(!audioEngine.src && currentSurah) playAyah(0, currentSurah.ayat[0].audio[prefs.qari]);
        else { audioEngine.play(); document.getElementById('btn-play-surah').classList.replace('fa-play-circle', 'fa-pause-circle'); }
    } else { audioEngine.pause(); document.getElementById('btn-play-surah').classList.replace('fa-pause-circle', 'fa-play-circle'); }
}

// --- ALAT MUSLIM: LOKASI, JADWAL, KIBLAT, MASJID ---
function getLocationAndPrayerTimes() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.lat = position.coords.latitude;
                userLocation.lng = position.coords.longitude;
                document.getElementById('location-text').innerHTML = `<i class="fas fa-map-marker-alt"></i> Lokasi Ditemukan`;
                fetchPrayerTimes(userLocation.lat, userLocation.lng);
            },
            (error) => { fetchPrayerTimes(userLocation.lat, userLocation.lng); } // Fallback Jakarta
        );
    } else { fetchPrayerTimes(userLocation.lat, userLocation.lng); }
}

async function fetchPrayerTimes(lat, lng) {
    try {
        const date = new Date();
        const strDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
        const res = await fetch(`https://api.aladhan.com/v1/timings/${strDate}?latitude=${lat}&longitude=${lng}&method=2`);
        const timings = (await res.json()).data.timings;
        
        document.getElementById('prayer-times').innerHTML = `
            <div class="prayer-item"><small>Subuh</small><strong>${timings.Fajr}</strong></div>
            <div class="prayer-item"><small>Dzuhur</small><strong>${timings.Dhuhr}</strong></div>
            <div class="prayer-item"><small>Ashar</small><strong>${timings.Asr}</strong></div>
            <div class="prayer-item active"><small>Maghrib</small><strong>${timings.Maghrib}</strong></div>
            <div class="prayer-item"><small>Isya</small><strong>${timings.Isha}</strong></div>
        `;
    } catch(e) { document.getElementById('prayer-times').innerHTML = `<small class="text-muted">Gagal memuat jadwal dari API.</small>`; }
}

function findNearbyMosque() {
    const url = `https://www.google.com/maps/search/masjid+terdekat/@${userLocation.lat},${userLocation.lng},15z`;
    window.open(url, '_blank');
}

let compassActive = false;
function startCompass() {
    if(compassActive) return;
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            let compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
            if(compass) {
                // Kiblat untuk Indonesia umumnya sekitar 295 derajat (Barat Laut)
                // Kita putar ring agar panah menunjuk arah HP menghadap Kiblat
                let qiblaOffset = 295; 
                let rotation = qiblaOffset - compass;
                document.getElementById('compass-ring').style.transform = `rotate(${rotation}deg)`;
            }
        });
        compassActive = true;
        alert("Kompas diaktifkan. Putar HP Anda mencari arah panah.");
    } else { alert("Sensor kompas tidak didukung di perangkat ini."); }
}

// --- PENGATURAN UI ---
function openSettingsModal() { document.getElementById('modal-settings').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function changeQari() { prefs.qari = document.getElementById('qari-selector').value; }
function updateFont(type, val) {
    if(type === 'arab') { prefs.arabSize = val; document.getElementById('val-arab').innerText = val+'px'; document.querySelectorAll('.text-arab').forEach(e => e.style.fontSize = val+'px'); }
    else { prefs.latinSize = val; document.getElementById('val-latin').innerText = val+'px'; document.querySelectorAll('.text-latin, .text-trans').forEach(e => e.style.fontSize = val+'px'); }
}
function toggleFeature() {
    prefs.showLatin = document.getElementById('toggle-latin').checked;
    prefs.showTrans = document.getElementById('toggle-trans').checked;
    prefs.showTajwid = document.getElementById('toggle-tajwid').checked;
    document.querySelectorAll('.text-latin').forEach(e => e.classList.toggle('hidden', !prefs.showLatin));
    document.querySelectorAll('.text-trans').forEach(e => e.classList.toggle('hidden', !prefs.showTrans));
    if(currentSurah) openSurah(currentSurah.nomor);
}
