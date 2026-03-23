const API_QURAN = "https://equran.id/api/v2";
let allSurahs = [], currentSurah = null, audioEngine = document.getElementById('audio-engine'), activeAyahIndex = -1;

// STATE
let prefs = JSON.parse(localStorage.getItem('rPrefs')) || { qari: "05", arabSize: 32, latinSize: 14, showLatin: true, showTrans: true, showTajwid: true, autoplay: true };
let bookmark = JSON.parse(localStorage.getItem('rBookmark')) || null;
let autoScrollInterval = null;
let scrollSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
    fixDateDisplay(); fetchSurahs(); loadPrefsUI(); checkBookmark(); checkDirectLink();
});

function fixDateDisplay() {
    const today = new Date();
    document.getElementById('date-greg').innerText = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    try {
        let hijriStr = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
        hijriStr = hijriStr.replace(/SM/g, '').replace(/AH/g, '').trim();
        document.getElementById('date-hijri').innerHTML = `${hijriStr} H <i class="fas fa-calendar-alt small"></i>`;
    } catch(e) { document.getElementById('date-hijri').innerHTML = `Memuat Hijriah... <i class="fas fa-calendar-alt small"></i>`; }
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if(pageId === 'page-home') { document.getElementById('nav-home-mob')?.classList.add('active'); document.getElementById('nav-home-desk')?.classList.add('active'); }
    if(pageId === 'page-tools') { document.getElementById('nav-tools-mob')?.classList.add('active'); document.getElementById('nav-tools-desk')?.classList.add('active'); }
    
    if(pageId !== 'page-read') {
        audioEngine.pause();
        scrollSpeed = 0; clearInterval(autoScrollInterval);
        if(document.getElementById('btn-autoscroll-txt')) document.getElementById('btn-autoscroll-txt').innerText = "Off";
    }
    window.scrollTo(0,0);
}

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

async function openSurah(nomor, targetAyah = 1) {
    switchPage('page-read');
    document.getElementById('ayah-list').innerHTML = `<div class="text-center mt-3"><i class="fas fa-spinner fa-spin text-primary"></i> Memuat...</div>`;
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
                        <button class="btn-ayah-action" onclick="playAyah(${i})"><i class="fas fa-play" id="icon-play-${i}"></i></button>
                        <button class="btn-ayah-action btn-bookmark ${isMarked ? 'active' : ''}" onclick="bookmarkAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${currentSurah.namaLatin}', this)"><i class="fas fa-bookmark"></i></button>
                        <button class="btn-ayah-action" onclick="shareAyah(${currentSurah.nomor}, ${a.nomorAyat}, '${a.teksArab.replace(/'/g, "\\'")}', '${a.teksIndonesia.replace(/'/g, "\\'")}')"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
                <div class="text-arab" style="font-size:${prefs.arabSize}px;">${prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab}</div>
                <div class="box-latin ${prefs.showLatin?'':'hidden'}"><div class="text-latin" style="font-size:${prefs.latinSize}px;">${a.teksLatin}</div></div>
                <div class="box-trans ${prefs.showTrans?'':'hidden'}"><div class="text-trans" style="font-size:${prefs.latinSize}px;">${a.teksIndonesia}</div></div>
            </div>`;
        }).join('');
        
        document.getElementById('ayah-list').innerHTML = html;
        activeAyahIndex = -1; 
        
        if(targetAyah > 1) {
            setTimeout(() => {
                const targetEl = document.getElementById(`ayah-${targetAyah - 1}`);
                if(targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 600);
        }
    } catch(e) { alert("Gagal memuat."); switchPage('page-home'); }
}

function applyTajwid(t) {
    return t.replace(/([نم])[\u0651]/g, `<span class="t-rule tj-ghunnah" onclick="showTajwidInfo('Ghunnah', '$&')">$&</span>`)
            .replace(/([بجدطق])\u0652/g, `<span class="t-rule tj-qalqalah" onclick="showTajwidInfo('Qalqalah', '$&')">$&</span>`)
            .replace(/[\u0653]/g, `<span class="t-rule tj-mad" onclick="showTajwidInfo('Mad/Panjang', '$&')">$&</span>`)
            .replace(/[\u06E2]/g, `<span class="t-rule tj-iqlab" onclick="showTajwidInfo('Iqlab', '$&')">$&</span>`)
            .replace(/[\u064B\u064C\u064D]/g, `<span class="t-rule tj-ikhfa" onclick="showTajwidInfo('Ikhfa/Idgham', '$&')">$&</span>`);
}

function checkDirectLink() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('surah')) openSurah(parseInt(urlParams.get('surah')), urlParams.get('ayah') ? parseInt(urlParams.get('ayah')) : 1);
}

function playAyah(idx) {
    document.querySelectorAll('.btn-ayah-action .fa-pause').forEach(i => i.className = 'fas fa-play');
    document.querySelectorAll('.ayah-item').forEach(el => el.classList.remove('playing'));
    const icon = document.getElementById(`icon-play-${idx}`);
    const audioUrl = currentSurah.ayat[idx].audio[prefs.qari];

    if (activeAyahIndex === idx && !audioEngine.paused) {
        audioEngine.pause(); icon.className = 'fas fa-play';
    } else {
        if (activeAyahIndex !== idx || audioEngine.src !== audioUrl) audioEngine.src = audioUrl;
        audioEngine.play(); activeAyahIndex = idx; icon.className = 'fas fa-pause';
        const card = document.getElementById(`ayah-${idx}`);
        card.classList.add('playing'); card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

audioEngine.addEventListener('ended', () => {
    document.getElementById(`icon-play-${activeAyahIndex}`).className = 'fas fa-play';
    if (prefs.autoplay && currentSurah && activeAyahIndex < currentSurah.ayat.length - 1) { playAyah(activeAyahIndex + 1); }
});

function bookmarkAyah(sNo, aNo, sName, btnEl) {
    bookmark = { sNo, sName, aNo }; localStorage.setItem('rBookmark', JSON.stringify(bookmark));
    document.querySelectorAll('.btn-bookmark').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active'); alert(`Berhasil ditandai: Surat ${sName} Ayat ${aNo}`); checkBookmark();
}

function shareAyah(sNo, aNo, teksArab, teksIndo) {
    const link = `${window.location.origin}${window.location.pathname}?surah=${sNo}&ayah=${aNo}`;
    const textToShare = `Q.S ${currentSurah.namaLatin} Ayat ${aNo}:\n\n${teksArab}\n\n"${teksIndo}"\n\nBaca di: ${link}`;
    if (navigator.share) navigator.share({ title: 'Rifqy Quran', text: textToShare });
    else { navigator.clipboard.writeText(textToShare); alert("Teks & Link berhasil disalin!"); }
}

function checkBookmark() {
    const card = document.getElementById('continue-reading-card');
    if(bookmark) {
        document.getElementById('cr-surah').innerText = bookmark.sName;
        document.getElementById('cr-ayah').innerText = `Ayat No: ${bookmark.aNo}`;
        card.classList.remove('hidden');
    } else { card.classList.add('hidden'); }
}
function continueReading() { if(bookmark) openSurah(bookmark.sNo, bookmark.aNo); }

function openTafsirModal() {
    if(!currentSurah) return;
    document.getElementById('tafsir-content').innerHTML = currentSurah.deskripsi;
    document.getElementById('modal-tafsir').style.display = 'flex';
}
function toggleAutoScroll() {
    scrollSpeed++; if(scrollSpeed > 3) scrollSpeed = 0;
    clearInterval(autoScrollInterval); const btn = document.getElementById('btn-autoscroll-txt');
    if(scrollSpeed === 0) btn.innerText = "Off"; 
    else { btn.innerText = `${scrollSpeed}x`; autoScrollInterval = setInterval(() => { window.scrollBy(0, scrollSpeed); }, 30); }
}

function openSettingsModal() { document.getElementById('modal-settings').style.display = 'flex'; }
function openCalendarModal() { 
    document.getElementById('modal-calendar').style.display = 'flex'; 
    document.getElementById('cal-month-year').innerText = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { month: 'long', year: 'numeric' }).format(new Date());
    document.getElementById('cal-grid').innerHTML = Array.from({length: 30}, (_, i) => `<div class="cal-day ${i+1 === parseInt(new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric' }).format(new Date())) ? 'today' : ''}">${i+1}</div>`).join('');
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

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
    prefs.showLatin = document.getElementById('toggle-latin').checked;
    prefs.showTrans = document.getElementById('toggle-trans').checked;
    prefs.showTajwid = document.getElementById('toggle-tajwid').checked;
    prefs.autoplay = document.getElementById('toggle-autoplay').checked;
    document.querySelectorAll('.box-latin').forEach(e => e.classList.toggle('hidden', !prefs.showLatin));
    document.querySelectorAll('.box-trans').forEach(e => e.classList.toggle('hidden', !prefs.showTrans));
    savePrefs();
    if(currentSurah) {
        currentSurah.ayat.forEach((a, i) => { const el = document.querySelector(`#ayah-${i} .text-arab`); if(el) el.innerHTML = prefs.showTajwid ? applyTajwid(a.teksArab) : a.teksArab; });
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
