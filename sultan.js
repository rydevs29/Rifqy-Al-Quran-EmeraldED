/* ==============================================================
   SULTAN.JS - KUMPULAN FITUR PREMIUM (DOA, WIRID, TAHLIL)
   ============================================================== */

window.startVoiceSearch = function() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { const rec = new SR(); rec.lang = 'id-ID'; rec.start(); const inp = document.getElementById('search-input'); inp.placeholder = "Mendengarkan..."; rec.onresult = e => { inp.value = e.results[0][0].transcript; window.filterSurah(); inp.placeholder = "Cari Surat..."; }; rec.onerror = () => { alert("Suara tidak jelas."); inp.placeholder = "Cari Surat..."; }; } 
    else alert("Tidak didukung.");
};

window.hitungZakat = function() { const m = parseFloat(document.getElementById('zakat-maal').value) || 0; document.getElementById('hasil-maal').innerText = `Rp ${(m * 0.025).toLocaleString('id-ID')}`; };
window.hitungKhatam = function() { const hari = document.getElementById('target-hari').value; const div = document.getElementById('hasil-khatam'); if (!hari || hari <= 0) { alert("Masukkan hari valid!"); return; } div.innerHTML = `Target: Baca <b>${Math.ceil(Math.ceil((604 / hari) / 2) / 5)} Lembar</b> tiap sholat.`; div.classList.remove('hidden'); };
window.compassActive = false;
window.startCompassReal = function() {
    if (window.compassActive) return;
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => { let c = e.webkitCompassHeading || Math.abs(e.alpha - 360); if (c) { document.getElementById('compass-ring').style.transform = `rotate(${295 - c}deg)`; if (c > 285 && c < 305 && navigator.vibrate) navigator.vibrate(30); } }); window.compassActive = true; alert("Putar HP.");
    } else alert("Sensor tidak didukung.");
};
window.findNearbyMosque = function() { window.open(`https://www.google.com/maps/search/Masjid+Terdekat`, '_blank'); };
window.tasbihCount = 0;
window.openTasbih = function() {
    window.tasbihCount++; if (navigator.vibrate) navigator.vibrate(30);
    document.getElementById('tafsir-content').innerHTML = `<div class="text-center cursor-pointer p-3" onclick="window.openTasbih()"><p class="text-muted mb-3">Ketuk area ini untuk bertasbih</p><h1 class="text-primary" style="font-size:80px;">${window.tasbihCount}</h1><button class="btn-outline-primary mt-3" onclick="event.stopPropagation(); window.tasbihCount=0; window.openTasbih();">Reset</button></div>`;
    window.openModal('modal-tafsir');
};
window.startQuiz = function(t) { let ans = prompt("Hukum nun mati bertemu Ba (ب) disebut?\nA. Ikhfa\nB. Iqlab\nC. Idzhar"); if(ans && ans.toLowerCase() === 'b') alert("✅ Benar!"); else alert("❌ Salah."); };

// --- DATA DOA & TAHLIL ---
const doaDatabase = [
    { t: "Doa Sapu Jagad (Kebaikan Dunia Akhirat)", a: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", l: "Rabbana atina fiddunya hasanah wa fil akhiroti hasanah waqina 'adzabannar", i: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka." },
    { t: "Doa Kedua Orang Tua", a: "رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا", l: "Rabbighfir lii waliwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa", i: "Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah mereka sebagaimana mereka merawatku di waktu kecil." },
    { t: "Doa Keluar Rumah", a: "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ", l: "Bismillahi tawakkaltu 'alallah, laa hawla wa laa quwwata illaa billaah", i: "Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan (pertolongan) Allah." },
    { t: "Doa Penenang Hati (Anti Gundah)", a: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", l: "Allahumma inni a'udzu bika minal hammi wal hazan", i: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari keluh kesah dan kesedihan." },
    { t: "Sayyidul Istighfar", a: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ", l: "Allahumma anta Rabbi laa ilaaha illaa anta, khalaqtanii wa anaa 'abduka", i: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu." }
];

window.switchDoaTab = function(tabName) {
    const tabU = document.getElementById('tab-doa-umum'); const tabT = document.getElementById('tab-doa-tahlil');
    const contU = document.getElementById('doa-container'); const contT = document.getElementById('tahlil-container');
    if(tabName === 'umum') {
        tabU.style.borderBottom = "3px solid var(--primary-color)"; tabU.style.color = "var(--primary-color)"; tabT.style.borderBottom = "3px solid transparent"; tabT.style.color = "var(--text-muted)";
        contU.classList.remove('hidden'); contT.classList.add('hidden');
    } else {
        tabT.style.borderBottom = "3px solid var(--primary-color)"; tabT.style.color = "var(--primary-color)"; tabU.style.borderBottom = "3px solid transparent"; tabU.style.color = "var(--text-muted)";
        contT.classList.remove('hidden'); contU.classList.add('hidden'); window.loadTahlil('singkat');
    }
};

window.renderDoaList = function(data) {
    const cont = document.getElementById('doa-container'); if(!cont) return;
    cont.innerHTML = data.map((d, i) => `
        <div class="doa-item">
            <div class="doa-header" onclick="window.toggleDoa(${i})"><span>${d.t}</span><i class="fas fa-chevron-down" id="di-icon-${i}"></i></div>
            <div class="doa-body" id="di-body-${i}"><div class="p-3"><p class="font-arab text-right mb-2 text-primary" style="font-size:24px;">${d.a}</p><p class="small text-primary mb-2" style="font-style:italic;">${d.l}</p><p class="small text-muted">${d.i}</p></div></div>
        </div>
    `).join('');
};

window.filterDoa = function() {
    const q = document.getElementById('search-doa').value.toLowerCase().trim();
    const filtered = doaDatabase.filter(d => d.t.toLowerCase().includes(q) || d.i.toLowerCase().includes(q));
    window.renderDoaList(filtered);
};

window.toggleDoa = function(idx) {
    const b = document.getElementById(`di-body-${idx}`); const icon = document.getElementById(`di-icon-${idx}`);
    if(b.style.maxHeight === '0px' || b.style.maxHeight === '') { b.style.maxHeight = '500px'; icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); } 
    else { b.style.maxHeight = '0px'; icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); }
};

window.loadTahlil = function(type) {
    const btnS = document.getElementById('btn-tahlil-singkat'); const btnL = document.getElementById('btn-tahlil-lengkap');
    if(type === 'singkat') { btnS.classList.replace('btn-outline-primary','btn-primary'); btnL.classList.replace('btn-primary','btn-outline-primary'); }
    else { btnL.classList.replace('btn-outline-primary','btn-primary'); btnS.classList.replace('btn-primary','btn-outline-primary'); }
    
    let html = "";
    if(type === 'singkat') {
        html = `
        <div class="bg-light p-3 border-radius mb-3 text-center">
            <h4 class="font-bold text-primary mb-2">Tahlil Singkat</h4>
            <p class="font-arab text-primary mb-2" style="font-size:24px;">لَا إِلَهَ إِلَّا اللهُ</p>
            <p class="small text-muted">Laa ilaaha illallah (Dibaca 33x / 100x)</p>
        </div>
        <div class="bg-light p-3 border-radius text-center">
            <p class="font-arab text-primary mb-2" style="font-size:24px;">سُبْحَانَ اللهِ وَبِحَمْدِهِ</p>
            <p class="small text-muted">Subhanallah wa bihamdihi (Dibaca 33x)</p>
        </div>`;
    } else {
        html = `
        <div class="bg-light p-3 border-radius mb-3">
            <h4 class="font-bold text-primary mb-2">Urutan Tahlil Lengkap</h4>
            <ol class="small text-muted" style="padding-left: 15px; line-height: 1.8;">
                <li>Pengantar Al-Fatihah (Ila hadroti...)</li>
                <li>Membaca Surat Yasin (Atau Al-Ikhlas 3x, Al-Falaq, An-Nas)</li>
                <li>Membaca Ayat Kursi</li>
                <li>Dzikir Tahlil (Laa ilaaha illallah 100x)</li>
                <li>Sholawat Nabi</li>
                <li>Doa Arwah / Penutup</li>
            </ol>
        </div>`;
    }
    document.getElementById('tahlil-content').innerHTML = html;
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { window.renderDoaList(doaDatabase); }, 500); });

window.renderAsmaulHusna = function() {
    const asmaulHusna99 = [
        {a:"الرَّحْمَنُ", l:"Ar-Rahman", i:"Maha Pengasih"},{a:"الرَّحِيمُ", l:"Ar-Rahim", i:"Maha Penyayang"},{a:"الْمَلِكُ", l:"Al-Malik", i:"Maha Merajai"},{a:"الْقُدُّوسُ", l:"Al-Quddus", i:"Maha Suci"},{a:"السَّلَامُ", l:"As-Salam", i:"Maha Menyelamatkan"},
        {a:"الْمُؤْمِنُ", l:"Al-Mu'min", i:"Maha Pemberi Keamanan"},{a:"الْمُهَيْمِنُ", l:"Al-Muhaimin", i:"Maha Pemelihara"},{a:"الْعَزِيزُ", l:"Al-'Aziz", i:"Maha Perkasa"},{a:"الْجَبَّارُ", l:"Al-Jabbar", i:"Maha Pemaksa"},{a:"الْمُتَكَبِّرُ", l:"Al-Mutakabbir", i:"Maha Pemilik Kebesaran"},
        {a:"الْخَالِقُ", l:"Al-Khaliq", i:"Maha Pencipta"},{a:"الْبَارِئُ", l:"Al-Bari'", i:"Maha Mengadakan"},{a:"الْمُصَوِّرُ", l:"Al-Musawwir", i:"Maha Membentuk Rupa"},{a:"الْغَفَّارُ", l:"Al-Ghaffar", i:"Maha Pengampun"},{a:"الْقَهَّارُ", l:"Al-Qahhar", i:"Maha Menundukkan"},
        {a:"الْوَهَّابُ", l:"Al-Wahhab", i:"Maha Pemberi Karunia"},{a:"الرَّزَّاقُ", l:"Ar-Razzaq", i:"Maha Pemberi Rezeki"},{a:"الْفَتَّاحُ", l:"Al-Fattah", i:"Maha Pembuka Rahmat"},{a:"الْعَلِيمُ", l:"Al-'Alim", i:"Maha Mengetahui"},{a:"الْقَابِضُ", l:"Al-Qabidh", i:"Maha Menyempitkan"},
        {a:"الْبَاسِطُ", l:"Al-Basith", i:"Maha Melapangkan"},{a:"الْخَافِضُ", l:"Al-Khafidh", i:"Maha Merendahkan"},{a:"الرَّافِعُ", l:"Ar-Rafi'", i:"Maha Meninggikan"},{a:"الْمُعِزُّ", l:"Al-Mu'izz", i:"Maha Memuliakan"},{a:"الْمُذِلُّ", l:"Al-Mudzill", i:"Maha Menghinakan"},
        {a:"السَّمِيعُ", l:"As-Sami'", i:"Maha Mendengar"},{a:"الْبَصِيرُ", l:"Al-Bashir", i:"Maha Melihat"},{a:"الْحَكَمُ", l:"Al-Hakam", i:"Maha Menetapkan"},{a:"الْعَدْلُ", l:"Al-'Adl", i:"Maha Adil"},{a:"اللَّطِيفُ", l:"Al-Lathif", i:"Maha Lembut"},
        {a:"الْخَبِيرُ", l:"Al-Khabir", i:"Maha Mengetahui Rahasia"},{a:"الْحَلِيمُ", l:"Al-Halim", i:"Maha Penyantun"},{a:"الْعَظِيمُ", l:"Al-'Azhim", i:"Maha Agung"},{a:"الْغَفُورُ", l:"Al-Ghafur", i:"Maha Pengampun"},{a:"الشَّكُورُ", l:"Asy-Syakur", i:"Maha Pembalas Budi"},
        {a:"الْعَلِيُّ", l:"Al-'Aliy", i:"Maha Tinggi"},{a:"الْكَبِيرُ", l:"Al-Kabir", i:"Maha Besar"},{a:"الْحَفِيظُ", l:"Al-Hafizh", i:"Maha Menjaga"},{a:"الْمُقِيتُ", l:"Al-Muqit", i:"Maha Pemberi Kecukupan"},{a:"الْحَسِيبُ", l:"Al-Hasib", i:"Maha Pembuat Perhitungan"},
        {a:"الْجَلِيلُ", l:"Al-Jalil", i:"Maha Mulia"},{a:"الْكَرِيمُ", l:"Al-Karim", i:"Maha Pemurah"},{a:"الرَّقِيبُ", l:"Ar-Raqib", i:"Maha Mengawasi"},{a:"الْمُجِيبُ", l:"Al-Mujib", i:"Maha Mengabulkan"},{a:"الْوَاسِعُ", l:"Al-Wasi'", i:"Maha Luas"},
        {a:"الْحَكِيمُ", l:"Al-Hakim", i:"Maha Bijaksana"},{a:"الْوَدُودُ", l:"Al-Wadud", i:"Maha Penuh Cinta"},{a:"الْمَجِيدُ", l:"Al-Majid", i:"Maha Mulia"},{a:"الْبَاعِثُ", l:"Al-Ba'its", i:"Maha Membangkitkan"},{a:"الشَّهِيدُ", l:"Asy-Syahid", i:"Maha Menyaksikan"},
        {a:"الْحَقُّ", l:"Al-Haqq", i:"Maha Benar"},{a:"الْوَكِيلُ", l:"Al-Wakil", i:"Maha Memelihara"},{a:"الْقَوِيُّ", l:"Al-Qawiyyu", i:"Maha Kuat"},{a:"الْمَتِينُ", l:"Al-Matin", i:"Maha Kokoh"},{a:"الْوَلِيُّ", l:"Al-Waliy", i:"Maha Melindungi"},
        {a:"الْحَمِيدُ", l:"Al-Hamid", i:"Maha Terpuji"},{a:"الْمُحْصِي", l:"Al-Muhshi", i:"Maha Mengkalkulasi"},{a:"الْمُبْدِئُ", l:"Al-Mubdi'", i:"Maha Memulai"},{a:"الْمُعِيدُ", l:"Al-Mu'id", i:"Maha Mengembalikan Kehidupan"},{a:"الْمُحْيِي", l:"Al-Muhyi", i:"Maha Menghidupkan"},
        {a:"الْمُمِيتُ", l:"Al-Mumit", i:"Maha Mematikan"},{a:"الْحَيُّ", l:"Al-Hayyu", i:"Maha Hidup"},{a:"الْقَيُّومُ", l:"Al-Qayyum", i:"Maha Mandiri"},{a:"الْوَاجِدُ", l:"Al-Wajid", i:"Maha Penemu"},{a:"الْمَاجِدُ", l:"Al-Majid", i:"Maha Mulia"},
        {a:"الْوَاحِدُ", l:"Al-Wahid", i:"Maha Tunggal"},{a:"الْأَحَد", l:"Al-Ahad", i:"Maha Esa"},{a:"الصَّمَدُ", l:"Ash-Shamad", i:"Maha Dibutuhkan"},{a:"الْقَادِرُ", l:"Al-Qadir", i:"Maha Menentukan"},{a:"الْمُقْتَدِرُ", l:"Al-Muqtadir", i:"Maha Berkuasa"},
        {a:"الْمُقَدِّمُ", l:"Al-Muqaddim", i:"Maha Mendahulukan"},{a:"الْمُؤَخِّرُ", l:"Al-Mu'akhkhir", i:"Maha Mengakhirkan"},{a:"الْأَوَّلُ", l:"Al-Awwal", i:"Maha Awal"},{a:"الْآخِرُ", l:"Al-Akhir", i:"Maha Akhir"},{a:"الظَّاهِرُ", l:"Azh-Zhahir", i:"Maha Nyata"},
        {a:"الْبَاطِنُ", l:"Al-Bathin", i:"Maha Ghaib"},{a:"الْوَالِي", l:"Al-Wali", i:"Maha Memerintah"},{a:"الْمُتَعَالِي", l:"Al-Muta'ali", i:"Maha Tinggi"},{a:"الْبَرُّ", l:"Al-Barr", i:"Maha Penderma"},{a:"التَّوَّابُ", l:"At-Tawwab", i:"Maha Penerima Taubat"},
        {a:"الْمُنْتَقِمُ", l:"Al-Muntaqim", i:"Maha Pemberi Balasan"},{a:"الْعَفُوُّ", l:"Al-'Afuww", i:"Maha Pemaaf"},{a:"الرَّءُوفُ", l:"Ar-Ra'uf", i:"Maha Pengasih"},{a:"مَالِكُ الْمُلْكِ", l:"Malikul Mulk", i:"Penguasa Kerajaan"},{a:"ذُو الْجَلَالِ وَالْإِكْرَامِ", l:"Dzul Jalaali Wal Ikraam", i:"Pemilik Kebesaran dan Kemuliaan"},
        {a:"الْمُقْسِطُ", l:"Al-Muqsit", i:"Maha Adil"},{a:"الْجَامِعُ", l:"Al-Jami'", i:"Maha Mengumpulkan"},{a:"الْغَنِيُّ", l:"Al-Ghaniy", i:"Maha Berkecukupan"},{a:"الْمُغْنِي", l:"Al-Mughni", i:"Maha Memberi Kekayaan"},{a:"الْمَانِعُ", l:"Al-Mani'", i:"Maha Mencegah"},
        {a:"الضَّارُّ", l:"Adh-Dharr", i:"Maha Penimpa Kemudharatan"},{a:"النَّافِعُ", l:"An-Nafi'", i:"Maha Memberi Manfaat"},{a:"النُّورُ", l:"An-Nur", i:"Maha Bercahaya"},{a:"الْهَادِي", l:"Al-Hadi", i:"Maha Pemberi Petunjuk"},{a:"الْبَدِيعُ", l:"Al-Badi'", i:"Maha Pencipta Tiada Banding"},
        {a:"الْبَاقِي", l:"Al-Baqi", i:"Maha Kekal"},{a:"الْوَارِثُ", l:"Al-Warits", i:"Maha Pewaris"},{a:"الرَّشِيدُ", l:"Ar-Rasyid", i:"Maha Pandai"},{a:"الصَّبُورُ", l:"Ash-Shabur", i:"Maha Sabar"}
    ];
    const list = document.getElementById('asmaul-list');
    if(list) list.innerHTML = `<div class="asmaul-grid">${asmaulHusna99.map((n, i) => `<div class="asmaul-item"><div class="small text-muted mb-1">${i+1}</div><h3 class="font-arab text-primary mb-1">${n.a}</h3><strong>${n.l}</strong><br><small class="text-muted">${n.i}</small></div>`).join('')}</div>`;
};

window.trackerData = JSON.parse(localStorage.getItem('rTracker')) || { Subuh:false, Dzuhur:false, Ashar:false, Maghrib:false, Isya:false, Puasa:false, Tarawih:false };
window.initTracker = function() {
    window.renderAsmaulHusna();
    const tList = document.getElementById('tracker-list');
    if(!tList) return;
    tList.innerHTML = Object.keys(window.trackerData).map(k => `
        <div class="tracker-item"><span>${k}</span><input type="checkbox" onchange="window.updateTracker('${k}', this.checked)" ${window.trackerData[k] ? 'checked' : ''}></div>
    `).join('');
    window.updateTrackerProgress();
};
window.updateTracker = function(k, val) { window.trackerData[k] = val; localStorage.setItem('rTracker', JSON.stringify(window.trackerData)); window.updateTrackerProgress(); };
window.updateTrackerProgress = function() {
    const keys = Object.keys(window.trackerData); const checked = keys.filter(k => window.trackerData[k]).length;
    const pct = Math.round((checked / keys.length) * 100);
    const prog = document.getElementById('tracker-progress');
    const stat = document.getElementById('tracker-status');
    if(prog) prog.style.width = `${pct}%`; 
    if(stat) stat.innerText = `Progres Hari Ini: ${pct}%`;
};
