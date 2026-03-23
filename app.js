const API_QURAN = "https://equran.id/api/v2";
let allSurahs = [], currentSurah = null, audioEngine = document.getElementById('audio-engine'), activeAyahIndex = -1;

// STATE
let prefs = JSON.parse(localStorage.getItem('rPrefs')) || { qari: "05", arabSize: 32, latinSize: 14, showLatin: true, showTrans: true, showTajwid: true, autoplay: true };
let bookmark = JSON.parse(localStorage.getItem('rBookmark')) || null;
let autoScrollInterval = null;
let scrollSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
    fixDateDisplay(); 
    fetchSurahs(); 
    loadPrefsUI(); 
    checkBookmark();
    checkDirectLink(); // Cek jika web dibuka dari link "Bagikan"
});

// --- DATE FIX ---
function fixDateDisplay() {
    const today = new Date();
    // Tanggal Masehi
    const optGreg = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('date-greg').innerText = today.toLocaleDateString('id-ID', optGreg);
    
    // Tanggal Hijriah Fix (Cegah 'SM')
    try {
        const optHijri = { day: 'numeric', month: 'long', year: 'numeric' };
        let hijriStr = new Intl.DateTimeFormat('id-ID-u-ca-islamic', optHijri).format(today);
        // Hapus tulisan SM jika muncul karena bug browser
        hijriStr = hijriStr.replace(/SM/g, '').replace(/AH/g, '').trim();
        document.getElementById('date-hijri').innerHTML = `${hijriStr} H <i class="fas fa-calendar-alt small"></i>`;
    } catch(e) {
        document.getElementById('date-hijri').innerHTML = `1447 H <i class="fas fa-calendar-alt small"></i>`;
    }
}

// --- NAVIGASI ---
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if(pageId === 'page-home') { document.getElementById('nav-home-mob')?.classList.add('active'); document.getElementById('nav-home-desk')?.classList.add('active'); }
    if(pageId === 'page-tools') { document.getElementById('nav-tools-mob')?.classList.add('active'); document.getElementById('nav-tools-desk')?.classList.add('active'); loadJadwalDummy(); }
    
    if(pageId !== 'page-read') {
        audioEngine.pause();
        scrollSpeed = 0; clearInterval(autoScrollInterval);
        if(document.getElementById('btn-autoscroll-txt')) document.getElementById('btn-autoscroll-txt').innerText = "Off";
    }
    window.scrollTo(0,0);
}

// --- FETCH & SEARCH QURAN ---
async function fetchSurahs() {
    try {
        const res = await fetch(`${API_QURAN}/surat`);
        allSurahs = (await res.json()).data;
        renderSurahs(allSurahs);
    } catch (e) { document.getElementById('surah-list').innerHTML = `<p class="text-center text-muted">Gagal memuat. Cek Koneksi.</p>`; }
}
function renderSurahs(data) {
    document.getElementById('surah-list').innerHTML = data.map(s => `
        <div class="surah-card" onclick="openSurah(${s.nomor})">
            <div class="s-num">${s.nomor}</div>
            <div style="flex:1;"><h4 class="font-bold m-0">${s.namaLatin}</h4><p class="small text-muted m-0">${s.arti} • ${s.jumlahAyat} Ayat</p></div>
            <div class="s-arab font-arab text-primary" style="font-size:24px">${s.nama}</div>
        </div>
    `).join('');
}
function filterSurah() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    if (!isNaN(q) && q !== '') {
        renderSurahs(allSurahs.filter(s => s.nomor.toString() === q));
    } else {
        renderSurahs(allSurahs.filter(s => s.namaLatin.toLowerCase().includes(q) || s.arti.toLowerCase().includes(q)));
    }
}

// --- RENDER BACAAN ---
async function openSurah(nomor, targetAyah = 1) {
    switchPage('page-read');
    document.getElementById('ayah-list').innerHTML = `<div class="text-center mt-3"><i class="fas fa-spinner fa-spin text-primary"></i> Memuat surat...</div>`;
    try {
        currentSurah = (await (await fetch(`${API_QURAN}/surat/${nomor}`)).json()).data;
        document.getElementById('read-surah-name').innerHTML = `${currentSurah.namaLatin} <i class="fas fa-info-circle small text-muted"></i>`;
        document.getElementById('read-surah-info').innerText = `Surat ke-${currentSurah.nomor} • ${currentSurah.arti}`;
        
        let html = currentSurah.nomor !== 9 && currentSurah.nomor !== 1 ? `<div class="text-arab text-primary text-center" style="font-size:${prefs.arabSize}px;">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>` : '';
        
        html += currentSurah.ayat.map((a, i) => {
            const isMarked = bookmark && bookmark.sNo === currentSurah.nomor && bookmark.aNo === a.nomorAyat;
            return `
            <div class="ayah-item" id="ayah-${i}">
                <div class="ayah-toolbar">
                    <span class="ayah-badge">${currentSurah.nomor}:${a.nomorAyat}</span>
                    <div class="ayah-actions">
                        <button class="btn-ayah-action" onclick="playAyah(${i})">
                            <i class="fas fa-play" id="icon-play-${i}"></i>
                        </button>
                        <button class="btn-ayah-action btn-bookmark ${isMarked ? 'active' : ''}" 
                            onclick="bookmarkAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${currentSurah.namaLatin}', this)">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="btn-ayah-action" onclick="shareAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${a.teksArab.replace(/'/g, "\\'")}', '${a.teksIndonesia.replace(/'/g, "\\'")}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="text-arab" style="font-size:${prefs.arabSize}px;">
                    ${prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab}
                </div>
                
                <div class="box-latin ${prefs.showLatin?'':'hidden'}">
                    <div class="text-latin" style="font-size:${prefs.latinSize}px;">${a.teksLatin}</div>
                </div>
                <div class="box-trans ${prefs.showTrans?'':'hidden'}">
                    <div class="text-trans" style="font-size:${prefs.latinSize}px;">${a.teksIndonesia}</div>
                </div>
            </div>`;
        }).join('');
        
        document.getElementById('ayah-list').innerHTML = html;
        activeAyahIndex = -1; 
        
        // Cek target Ayah
        if(targetAyah > 1) {
            setTimeout(() => {
                const targetEl = document.getElementById(`ayah-${targetAyah - 1}`);
                if(targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
        }
    } catch(e) { alert("Gagal memuat."); switchPage('page-home'); }
}

function applyTajwid(t) {
    return t.replace(/([نم])[\u0651]/g, `<span class="tj-ghunnah">$&</span>`)
            .replace(/([بجدطق])\u0652/g, `<span class="tj-qalqalah">$&</span>`)
            .replace(/[\u0653]/g, `<span class="tj-mad">$&</span>`)
            .replace(/[\u06E2]/g, `<span class="tj-iqlab">$&</span>`)
            .replace(/[\u064B\u064C\u064D]/g, `<span class="tj-ikhfa">$&</span>`);
}

// --- DIRECT LINK SHARE CHECK ---
function checkDirectLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const pSurah = urlParams.get('surah');
    const pAyah = urlParams.get('ayah');
    if(pSurah) {
        openSurah(parseInt(pSurah), pAyah ? parseInt(pAyah) : 1);
    }
}

// --- AUDIO PER-AYAT ---
function playAyah(idx) {
    // Reset All icons
    document.querySelectorAll('.btn-ayah-action .fa-pause').forEach(i => i.className = 'fas fa-play');
    document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('playing'));

    const icon = document.getElementById(`icon-play-${idx}`);
    // Ambil URL berdasar Qari yang dipilih di settings
    const audioUrl = currentSurah.ayat[idx].audio[prefs.qari];

    if (activeAyahIndex === idx && !audioEngine.paused) {
        audioEngine.pause();
        icon.className = 'fas fa-play';
    } else {
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
    document.getElementById(`icon-play-${activeAyahIndex}`).className = 'fas fa-play';
    if (prefs.autoplay && currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) {
        let nxt = activeAyahIndex + 1; 
        playAyah(nxt);
    }
});

// --- FITUR TOOLBAR AYAT ---
function bookmarkAyah(sNo, aNo, sName, btnEl) {
    bookmark = { sNo, sName, aNo };
    localStorage.setItem('rBookmark', JSON.stringify(bookmark));
    
    // Reset class active
    document.querySelectorAll('.btn-bookmark').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    
    checkBookmark();
}

function shareAyah(sNo, aNo, teksArab, teksIndo) {
    const link = `${window.location.origin}${window.location.pathname}?surah=${sNo}&ayah=${aNo}`;
    const textToShare = `Q.S ${currentSurah.namaLatin} Ayat ${aNo}:\n\n${teksArab}\n\n"${teksIndo}"\n\nBaca selengkapnya di: ${link}`;
    
    if (navigator.share) {
        navigator.share({ title: 'Rifqy Quran', text: textToShare });
    } else {
        navigator.clipboard.writeText(textToShare);
        alert("Link dan Ayat berhasil disalin ke clipboard!");
    }
}

// --- BOOKMARK HOME ---
function checkBookmark() {
    const card = document.getElementById('continue-reading-card');
    if(bookmark) {
        document.getElementById('cr-surah').innerText = bookmark.sName;
        document.getElementById('cr-ayah').innerText = `Ayat No: ${bookmark.aNo}`;
        card.classList.remove('hidden');
    } else { card.classList.add('hidden'); }
}
function continueReading() { if(bookmark) openSurah(bookmark.sNo, bookmark.aNo); }

// --- TAFSIR & AUTO SCROLL ---
function openTafsirModal() {
    if(!currentSurah) return;
    document.getElementById('tafsir-content').innerHTML = currentSurah.deskripsi;
    document.getElementById('modal-tafsir').style.display = 'flex';
}
function toggleAutoScroll() {
    scrollSpeed++;
    if(scrollSpeed > 3) scrollSpeed = 0;
    
    clearInterval(autoScrollInterval);
    const btn = document.getElementById('btn-autoscroll-txt');
    
    if(scrollSpeed === 0) { btn.innerText = "Off"; } 
    else {
        btn.innerText = `${scrollSpeed}x`;
        autoScrollInterval = setInterval(() => { window.scrollBy(0, scrollSpeed); }, 30);
    }
}

// --- SETTINGS (DARI TITIK TIGA KANAN ATAS) ---
function openSettingsModal() { document.getElementById('modal-settings').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function changeQari() { 
    prefs.qari = document.getElementById('qari-selector').value; 
    savePrefs(); 
    if(currentSurah && activeAyahIndex >= 0) {
        // Jika sedang play, ganti source
        const newUrl = currentSurah.ayat[activeAyahIndex].audio[prefs.qari];
        if(!audioEngine.paused) { audioEngine.src = newUrl; audioEngine.play(); }
    }
}

function updateFont(type, val) {
    if(type === 'arab') { prefs.arabSize = val; document.querySelectorAll('.text-arab').forEach(e => e.style.fontSize = val+'px'); }
    else { prefs.latinSize = val; document.querySelectorAll('.text-latin, .text-trans').forEach(e => e.style.fontSize = val+'px'); }
    savePrefs();
}

function toggleFeature() {
    prefs.showLatin = document.getElementById('toggle-latin').checked;
    prefs.showTrans = document.getElementById('toggle-trans').checked;
    prefs.showTajwid = document.getElementById('toggle-tajwid').checked;
    prefs.autoplay = document.getElementById('toggle-autoplay').checked;
    
    document.querySelectorAll('.box-latin').forEach(e => e.classList.toggle('hidden', !prefs.showLatin));
    document.querySelectorAll('.box-trans').forEach(e => e.classList.toggle('hidden', !prefs.showTrans));
    savePrefs();
    
    if(currentSurah) {
        currentSurah.ayat.forEach((a, i) => {
            const arabEl = document.querySelector(`#ayah-${i} .text-arab`);
            if(arabEl) arabEl.innerHTML = prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab;
        });
    }
}

function savePrefs() { localStorage.setItem('rPrefs', JSON.stringify(prefs)); }
function loadPrefsUI() {
    document.getElementById('qari-selector').value = prefs.qari;
    document.getElementById('toggle-latin').checked = prefs.showLatin;
    document.getElementById('toggle-trans').checked = prefs.showTrans;
    document.getElementById('toggle-tajwid').checked = prefs.showTajwid;
    document.getElementById('toggle-autoplay').checked = prefs.autoplay;
}

// Dummy Alat
function loadJadwalDummy() {
    document.getElementById('prayer-times').innerHTML = `
        <div class="prayer-times-grid text-center">
            <div class="bg-light p-2 border-radius"><small class="text-muted">Subuh</small><br><strong class="font-bold">04:30</strong></div>
            <div class="bg-light p-2 border-radius"><small class="text-muted">Dzuhur</small><br><strong class="font-bold">12:00</strong></div>
            <div class="bg-light p-2 border-radius"><small class="text-muted">Ashar</small><br><strong class="font-bold">15:15</strong></div>
            <div class="bg-primary text-white p-2 border-radius"><small>Maghrib</small><br><strong class="font-bold">18:12</strong></div>
            <div class="bg-light p-2 border-radius"><small class="text-muted">Isya</small><br><strong class="font-bold">19:20</strong></div>
        </div>
    `;
}
