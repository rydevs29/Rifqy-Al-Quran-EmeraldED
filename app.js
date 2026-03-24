const API_QURAN = "https://equran.id/api/v2";
let allSurahs = [], currentSurah = null, audioEngine = document.getElementById('audio-engine'), activeAyahIndex = -1;
let prefs = JSON.parse(localStorage.getItem('rPrefs')) || { qari: "05", arabSize: 32, latinSize: 14, showLatin: true, showTrans: true, showTajwid: true, autoplay: true };
let bookmark = JSON.parse(localStorage.getItem('rBookmark')) || null;
let autoScrollInterval = null; let scrollSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
    fixDateDisplay(); fetchSurahs(); loadPrefsUI(); checkBookmark(); checkDirectLink(); getLocationAndPrayerTimes(); renderCalGrid();
});

function fixDateDisplay() {
    const today = new Date();
    try {
        let hijriStr = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
        document.getElementById('header-hijri').innerHTML = `${hijriStr.replace(/SM|AH/g, '').trim()} H`;
    } catch(e) { document.getElementById('header-hijri').innerHTML = `1447 H`; }
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if(pageId === 'page-home') { document.getElementById('nav-home-mob')?.classList.add('active'); document.getElementById('nav-home-desk')?.classList.add('active'); }
    if(pageId !== 'page-read') {
        audioEngine.pause(); scrollSpeed = 0; clearInterval(autoScrollInterval);
        if(document.getElementById('btn-autoscroll-txt')) document.getElementById('btn-autoscroll-txt').innerText = "Off";
    }
    window.scrollTo(0,0);
}

// --- FETCH & SEARCH QURAN ---
async function fetchSurahs() {
    try {
        const res = await fetch(`${API_QURAN}/surat`); allSurahs = (await res.json()).data; renderSurahs(allSurahs);
    } catch (e) { document.getElementById('surah-list').innerHTML = `<p class="text-center text-muted">Gagal memuat. Cek Koneksi.</p>`; }
}

function renderSurahs(data) {
    const progressData = JSON.parse(localStorage.getItem('surahProgress')) || {};
    document.getElementById('surah-list').innerHTML = data.map(s => {
        const pct = progressData[s.nomor] || 0;
        return `
        <div class="surah-card" onclick="openSurah(${s.nomor})">
            <div class="s-num">${s.nomor}</div>
            <div style="flex:1;">
                <h4 class="font-bold m-0">${s.namaLatin}</h4>
                <div class="flex-between"><p class="small text-muted m-0">${s.arti} • ${s.jumlahAyat} Ayat</p><small class="text-primary font-bold">${pct}%</small></div>
                <div class="surah-progress-container"><div class="surah-progress-fill" style="width: ${pct}%"></div></div>
            </div>
            <div class="s-arab font-arab text-primary ml-2" style="font-size:24px">${s.nama}</div>
        </div>`;
    }).join('');
}

function filterSurah() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    if (!isNaN(q) && q !== '') renderSurahs(allSurahs.filter(s => s.nomor.toString() === q));
    else renderSurahs(allSurahs.filter(s => s.namaLatin.toLowerCase().includes(q) || s.arti.toLowerCase().includes(q)));
}

// --- BUG FIX: DIRECT LINK SHARE ---
function checkDirectLink() {
    const p = new URLSearchParams(window.location.search);
    const surahP = p.get('surah');
    const ayahP = p.get('ayah');
    if(surahP) {
        openSurah(parseInt(surahP), ayahP ? parseInt(ayahP) : 1);
        // Hapus parameter URL agar tidak nyangkut saat kembali ke beranda!
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// --- BUKA SURAH & RENDER AYAT ---
async function openSurah(nomor, targetAyah = 1) {
    switchPage('page-read');
    document.getElementById('ayah-list').innerHTML = `<div class="text-center mt-3"><i class="fas fa-spinner fa-spin text-primary"></i> Memuat...</div>`;
    try {
        currentSurah = (await (await fetch(`${API_QURAN}/surat/${nomor}`)).json()).data;
        document.getElementById('read-surah-name').innerHTML = `${currentSurah.namaLatin} <i class="fas fa-info-circle small text-muted"></i>`;
        document.getElementById('read-surah-info').innerText = `Surat ke-${currentSurah.nomor} • ${currentSurah.arti}`;
        
        let html = currentSurah.nomor !== 9 && currentSurah.nomor !== 1 ? `<div class="text-arab text-primary text-center font-arab" style="font-size:${prefs.arabSize}px;">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>` : '';
        
        html += currentSurah.ayat.map((a, i) => {
            const isMarked = bookmark && bookmark.sNo === currentSurah.nomor && bookmark.aNo === a.nomorAyat;
            return `
            <div class="ayah-item" id="ayah-${i}">
                <div class="ayah-toolbar">
                    <span class="ayah-badge">${currentSurah.nomor}:${a.nomorAyat}</span>
                    <div class="ayah-actions">
                        <button class="btn-ayah-action" onclick="playAyah(${i})"><i class="fas fa-play" id="icon-play-${i}"></i></button>
                        <button class="btn-ayah-action btn-bookmark ${isMarked ? 'active' : ''}" onclick="bookmarkAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${currentSurah.namaLatin}', this, ${currentSurah.jumlahAyat})"><i class="fas fa-bookmark"></i></button>
                        <button class="btn-ayah-action text-info" onclick="openTafsirPerAyat(${currentSurah.nomor}, ${a.nomorAyat})"><i class="fas fa-book-open"></i></button>
                        <button class="btn-ayah-action btn-record" id="btn-record-${i}" onclick="toggleRecord(${i})"><i class="fas fa-microphone"></i></button>
                        <button class="btn-ayah-action text-success" onclick="openWallpaperCreator('${a.teksArab.replace(/'/g, "\\'")}', '${a.teksIndonesia.replace(/'/g, "\\'")}', '${currentSurah.namaLatin}', ${a.nomorAyat})"><i class="fas fa-paint-brush"></i></button>
                        <button class="btn-ayah-action" onclick="shareAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${a.teksArab.replace(/'/g, "\\'")}', '${a.teksIndonesia.replace(/'/g, "\\'")}')"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
                <audio id="audio-user-${i}" controls class="w-100 mb-2 hidden" style="height: 30px;"></audio>
                <div class="text-arab font-arab" style="font-size:${prefs.arabSize}px;">${prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab}</div>
                <div class="box-latin ${prefs.showLatin?'':'hidden'}"><div class="text-latin" style="font-size:${prefs.latinSize}px;">${a.teksLatin}</div></div>
                <div class="box-trans ${prefs.showTrans?'':'hidden'}"><div class="text-trans" style="font-size:${prefs.latinSize}px;">${a.teksIndonesia}</div></div>
            </div>`;
        }).join('');
        
        document.getElementById('ayah-list').innerHTML = html; activeAyahIndex = -1; 
        
        if(targetAyah > 1) {
            setTimeout(() => {
                const targetEl = document.getElementById(`ayah-${targetAyah - 1}`);
                if(targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
        }
    } catch(e) { alert("Gagal memuat."); switchPage('page-home'); }
}

// --- BUG FIX: AUDIO PLAY/PAUSE LOGIC ---
function playAyah(idx) {
    const icon = document.getElementById(`icon-play-${idx}`);
    const audioUrl = currentSurah.ayat[idx].audio[prefs.qari];

    if (activeAyahIndex === idx && !audioEngine.paused) {
        audioEngine.pause(); 
        icon.className = 'fas fa-play';
    } else {
        // Matikan semua ikon lain
        document.querySelectorAll('.btn-ayah-action .fa-pause').forEach(i => i.className = 'fas fa-play');
        document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('playing'));
        
        // Cek jika butuh ganti source
        if (activeAyahIndex !== idx || audioEngine.src !== audioUrl) {
            audioEngine.src = audioUrl;
        }
        
        audioEngine.play(); 
        activeAyahIndex = idx; 
        icon.className = 'fas fa-pause';
        
        const card = document.getElementById(`ayah-${idx}`);
        card.classList.add('playing'); 
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

audioEngine.addEventListener('ended', () => {
    const currentIcon = document.getElementById(`icon-play-${activeAyahIndex}`);
    if(currentIcon) currentIcon.className = 'fas fa-play';
    if (prefs.autoplay && currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) playAyah(activeAyahIndex + 1);
});

// --- BOOKMARK & SHARE ---
function bookmarkAyah(sNo, aNo, sName, btnEl, totalAyah) {
    bookmark = { sNo, sName, aNo }; localStorage.setItem('rBookmark', JSON.stringify(bookmark));
    document.querySelectorAll('.btn-bookmark').forEach(btn => btn.classList.remove('active')); btnEl.classList.add('active');
    let progData = JSON.parse(localStorage.getItem('surahProgress')) || {};
    progData[sNo] = Math.round((aNo / totalAyah) * 100); localStorage.setItem('surahProgress', JSON.stringify(progData));
    alert(`Berhasil ditandai: Surat ${sName} Ayat ${aNo}`); checkBookmark();
}

function checkBookmark() {
    const card = document.getElementById('continue-reading-card');
    if(bookmark) { document.getElementById('cr-surah').innerText = bookmark.sName; document.getElementById('cr-ayah').innerText = `Ayat No: ${bookmark.aNo}`; card.classList.remove('hidden'); } 
    else { card.classList.add('hidden'); }
}
function continueReading() { if(bookmark) openSurah(bookmark.sNo, bookmark.aNo); }

function shareAyah(sNo, aNo, teksArab, teksIndo) {
    const link = `${window.location.origin}${window.location.pathname}?surah=${sNo}&ayah=${aNo}`;
    const textToShare = `Q.S ${currentSurah.namaLatin} Ayat ${aNo}:\n\n${teksArab}\n\n"${teksIndo}"\n\nBaca di: ${link}`;
    if (navigator.share) navigator.share({ title: 'Rifqy Quran', text: textToShare }); else { navigator.clipboard.writeText(textToShare); alert("Teks & Link disalin!"); }
}

// --- MODALS & SETTINGS ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openTafsirModal() {
    if(!currentSurah) return;
    document.getElementById('tafsir-content').innerHTML = currentSurah.deskripsi;
    openModal('modal-tafsir');
}

function changeQari() { 
    prefs.qari = document.getElementById('qari-selector').value; savePrefs(); 
    if(currentSurah && activeAyahIndex >= 0 && !audioEngine.paused) { audioEngine.src = currentSurah.ayat[activeAyahIndex].audio[prefs.qari]; audioEngine.play(); }
}
function updateFont(type, val) {
    if(type === 'arab') { prefs.arabSize = val; document.querySelectorAll('.text-arab').forEach(e => e.style.fontSize = val+'px'); }
    else { prefs.latinSize = val; document.querySelectorAll('.text-latin, .text-trans').forEach(e => e.style.fontSize = val+'px'); }
    savePrefs();
}
function toggleFeature() {
    prefs.showLatin = document.getElementById('toggle-latin').checked; prefs.showTrans = document.getElementById('toggle-trans').checked; prefs.showTajwid = document.getElementById('toggle-tajwid').checked; prefs.autoplay = document.getElementById('toggle-autoplay').checked;
    document.querySelectorAll('.box-latin').forEach(e => e.classList.toggle('hidden', !prefs.showLatin)); document.querySelectorAll('.box-trans').forEach(e => e.classList.toggle('hidden', !prefs.showTrans));
    savePrefs();
    if(currentSurah) { currentSurah.ayat.forEach((a, i) => { const el = document.querySelector(`#ayah-${i} .text-arab`); if(el) el.innerHTML = prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab; }); }
}
function savePrefs() { localStorage.setItem('rPrefs', JSON.stringify(prefs)); }
function loadPrefsUI() {
    document.getElementById('qari-selector').value = prefs.qari; document.getElementById('toggle-latin').checked = prefs.showLatin; document.getElementById('toggle-trans').checked = prefs.showTrans; document.getElementById('toggle-tajwid').checked = prefs.showTajwid; document.getElementById('toggle-autoplay').checked = prefs.autoplay;
}

// --- JADWAL SHOLAT & COUNTDOWN ---
function getLocationAndPrayerTimes() {
    const container = document.getElementById('prayer-times');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude; const lng = pos.coords.longitude;
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                document.getElementById('location-text').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${(await geoRes.json()).address.city || "Lokasi Anda"}`;
                const d = new Date(); const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
                const t = (await (await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`)).json()).data.timings;
                renderRealPrayerTimes(t, container);
                startPrayerCountdown(t); // Mulai countdown
            } catch (err) { fetchFallbackPrayer(container); }
        }, () => { fetchFallbackPrayer(container); });
    } else { fetchFallbackPrayer(container); }
}

function renderRealPrayerTimes(t, container) {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const list = [{n: "Subuh", t: t.Fajr}, {n: "Dzuhur", t: t.Dhuhr}, {n: "Ashar", t: t.Asr}, {n: "Maghrib", t: t.Maghrib}, {n: "Isya", t: t.Isha}];
    container.innerHTML = list.map(p => {
        const pMin = parseInt(p.t.split(':')[0])*60 + parseInt(p.t.split(':')[1]);
        const isActive = (pMin > nowMin) ? 'bg-primary text-white' : 'bg-light';
        return `<div class="${isActive} p-2 border-radius"><small>${p.n}</small><br><strong class="font-bold">${p.t}</strong></div>`;
    }).join('');
}
function fetchFallbackPrayer(container) { container.innerHTML = `<div class="bg-light p-2 border-radius"><small>Subuh</small><br><strong>04:30</strong></div><div class="bg-light p-2 border-radius"><small>Dzuhur</small><br><strong>12:00</strong></div><div class="bg-light p-2 border-radius"><small>Ashar</small><br><strong>15:15</strong></div><div class="bg-primary text-white p-2 border-radius"><small>Maghrib</small><br><strong>18:12</strong></div><div class="bg-light p-2 border-radius"><small>Isya</small><br><strong>19:20</strong></div>`; }

function startPrayerCountdown(timings) {
    setInterval(() => {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        let nextName = "Subuh", nextTime = timings.Fajr;
        
        const list = [{n: "Subuh", t: timings.Fajr}, {n: "Dzuhur", t: timings.Dhuhr}, {n: "Ashar", t: timings.Asr}, {n: "Maghrib", t: timings.Maghrib}, {n: "Isya", t: timings.Isha}];
        for(let p of list) {
            const pMin = parseInt(p.t.split(':')[0])*60 + parseInt(p.t.split(':')[1]);
            if(pMin > nowMin) { nextName = p.n; nextTime = p.t; break; }
        }

        // Kalkulasi sisa waktu (Sederhana)
        let [nH, nM] = nextTime.split(':').map(Number);
        let target = new Date(); target.setHours(nH, nM, 0);
        if(target < now) target.setDate(target.getDate() + 1); // Besoknya
        
        let diff = target - now;
        let h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        let m = Math.floor((diff / 1000 / 60) % 60);
        let s = Math.floor((diff / 1000) % 60);
        
        document.getElementById('header-countdown').innerHTML = `<i class="fas fa-clock"></i> Menuju ${nextName}: ${h}j ${m}m ${s}s`;
    }, 1000);
}

function renderCalGrid() {
    document.getElementById('cal-month-year').innerText = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { month: 'long', year: 'numeric' }).format(new Date());
    document.getElementById('cal-grid').innerHTML = Array.from({length: 30}, (_, i) => `<div class="cal-day ${i+1 === parseInt(new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric' }).format(new Date())) ? 'today' : ''}">${i+1}</div>`).join('');
}
