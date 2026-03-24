/* ==============================================================
   TAJWID.JS - 14 HUKUM TAJWID DATABASE & REGEX
   ============================================================== */

const tajwidDatabase = [
    { id: "Hamzah Wasl", arab: "هَمْزَةُ الْوَصْلِ", color: "#9ca3af", class: "tj-hamzah", penjelasan: "Hamzah yang dibaca di awal kata saat memulai bacaan, tetapi tidak dibaca ketika menyambung dari kata sebelumnya.", cara: "Jika memulai bacaan dari hamzah wasl, baca dengan harakat yang sesuai. Jika menyambung, hamzah ini tidak dibaca.", contoh: "ٱلْحَمْدُ - Alif-lam di awal tidak dibaca jika menyambung" },
    { id: "Idgham Syamsiyah", arab: "لَام شَمْسِيَّة", color: "#3b82f6", class: "tj-idgham-syam", penjelasan: "Lam Syamsiyah terjadi ketika huruf lam pada 'ال' bertemu huruf syamsiyah. Lam tidak dibaca dan huruf setelahnya ditasydidkan.", cara: "Tidak membunyikan huruf lam, langsung membaca huruf setelahnya dengan tasydid.", contoh: "الشَّمْسُ - dibaca 'asy-syams'" },
    { id: "Ghunnah (Dengung)", arab: "غُنَّة", color: "#f97316", class: "tj-ghunnah", penjelasan: "Ghunnah adalah dengung dari pangkal hidung (2 harakat) pada nun dan mim bertasydid.", cara: "Keluarkan suara dengung dari hidung selama 2 harakat.", contoh: "إِنَّ - nun bertasydid, dengungkan 2 ketukan" },
    { id: "Ikhfa", arab: "إِخْفَاء حَقِيقِي", color: "#ec4899", class: "tj-ikhfa", penjelasan: "Nun mati/tanwin bertemu 15 huruf ikhfa. Disamarkan antara izhar dan idgham disertai ghunnah.", cara: "Bacaan disamarkan dengan dengung 2 harakat.", contoh: "مِنْ قَبْلُ - samarkan dengan ghunnah" },
    { id: "Madd (Panjang)", arab: "مَدّ", color: "#ef4444", class: "tj-mad", penjelasan: "Pemanjangan suara pada huruf mad (ا و ي) atau tanda bendera.", cara: "Panjangkan suara 2 hingga 6 harakat.", contoh: "قَالُوْا - panjangkan 2 harakat" },
    { id: "Qalqalah", arab: "قَلْقَلَة", color: "#10b981", class: "tj-qalqalah", penjelasan: "Pantulan suara pada huruf (ق ط ب ج د) ketika sukun/berhenti.", cara: "Bunyikan huruf dengan pantulan dari makhrajnya.", contoh: "يَخْلُقُ - pantulan 'qo'" },
    { id: "Iqlab", arab: "إِقْلَاب", color: "#8b5cf6", class: "tj-iqlab", penjelasan: "Nun mati/tanwin bertemu ba (ب). Diubah menjadi mim dan dibaca samar dengan ghunnah.", cara: "Ubah bunyi menjadi mim, samarkan dengan dengung.", contoh: "مِنْ بَعْدِ - dibaca 'mim ba'di'" },
    { id: "Idgham", arab: "إِدْغَام", color: "#06b6d4", class: "tj-idgham", penjelasan: "Memasukkan bunyi nun mati/tanwin ke huruf setelahnya (Bighunnah & Bilaghunnah).", cara: "Masukkan ke huruf berikutnya dengan atau tanpa dengung.", contoh: "مَنْ يَقُوْلُ - masuk ke ya dengan ghunnah" },
    { id: "Ikhfa Syafawi", arab: "إِخْفَاء شَفَوِي", color: "#d946ef", class: "tj-ikhfa-syaf", penjelasan: "Mim mati (مْ) bertemu huruf ba (ب). Disembunyikan dengan bibir hampir tertutup.", cara: "Rapatkan bibir tapi jangan menempel sempurna, dengungkan 2 harakat.", contoh: "تَرْمِيهِمْ بِحِجَارَةٍ - mim mati bertemu ba" },
    { id: "Saktah", arab: "سَكْتَة", color: "#64748b", class: "tj-saktah", penjelasan: "Berhenti sejenak tanpa bernapas (2 harakat) di tempat tertentu (Hafs).", cara: "Berhenti sejenak tanpa mengambil napas.", contoh: "عِوَجًا ۜ قَيِّمًا - berhenti sejenak" },
    { id: "Idgham Mutamatsilain", arab: "إِدْغَام مُتَمَاثِلَيْن", color: "#0ea5e9", class: "tj-mutamatsilain", penjelasan: "Mim mati bertemu mim berharakat. Dimasukkan dengan sempurna disertai ghunnah.", cara: "Masukkan mim pertama ke mim kedua, dengungkan 2 harakat.", contoh: "فِي قُلُوبِهِمْ مَرَضٌ - mim mati bertemu mim" },
    { id: "Idgham Mutaqaribain", arab: "إِدْغَام مُتَقَارِبَيْن", color: "#14b8a6", class: "tj-mutaqaribain", penjelasan: "Dua huruf berdekatan makhraj bertemu, huruf pertama masuk ke kedua.", cara: "Masukkan huruf pertama ke huruf kedua.", contoh: "أَلَمْ نَخْلُقْكُمْ - qaf masuk ke kaf" },
    { id: "Idgham Mutajanisain", arab: "إِدْغَام مُتَجَانِسَيْن", color: "#6366f1", class: "tj-mutajanisain", penjelasan: "Dua huruf sama makhraj tetapi beda sifat bertemu.", cara: "Masukkan huruf pertama ke kedua secara sempurna.", contoh: "قَدْ تَبَيَّنَ - dal masuk ke ta" },
    { id: "Izhar (Jelas)", arab: "إِظْهَار حَلْقِي", color: "#eab308", class: "tj-idzhar", penjelasan: "Nun mati/tanwin bertemu 6 huruf halqi. Dibaca jelas tanpa ghunnah.", cara: "Baca nun/tanwin dengan jelas tanpa dengung.", contoh: "مِنْ عِنْدِ - baca jelas tanpa ghunnah" }
];

window.openTajwidGuide = function() {
    document.getElementById('modal-lainnya').style.display = 'none';
    const list = document.getElementById('tajwid-guide-list');
    list.innerHTML = tajwidDatabase.map((t, i) => `
        <div class="tg-item">
            <div class="tg-header" onclick="toggleTG(${i})">
                <div class="tg-color-box" style="background-color: ${t.color};">${t.id.charAt(0)}</div>
                <div style="flex:1;"><div style="font-weight:bold; font-size:15px;">${t.id}</div><div class="font-arab" style="font-size:14px; color:#94a3b8;">${t.arab}</div></div>
                <i class="fas fa-chevron-down" id="tg-icon-${i}"></i>
            </div>
            <div class="tg-body" id="tg-body-${i}">
                <div style="padding: 10px 0;">
                    <div class="t-section-title" style="color:#60a5fa;">Penjelasan</div><p class="mb-3">${t.penjelasan}</p>
                    <div class="t-section-title" style="color:#fbbf24;">Cara Membaca</div><p class="mb-3">${t.cara}</p>
                    <div class="t-section-title" style="color:#34d399;">Contoh</div><p><span class="font-arab" style="font-size:18px;">${t.contoh.split(' - ')[0]}</span> - ${t.contoh.split(' - ')[1] || ''}</p>
                </div>
            </div>
        </div>`).join('');
    document.getElementById('modal-tajwid-guide').style.display = 'flex';
};

window.showTajwidInfo = function(jenis, huruf) {
    const tData = tajwidDatabase.find(t => t.id.includes(jenis) || jenis.includes(t.id)) || tajwidDatabase[0];
    document.getElementById('t-info-icon').innerText = tData.id.charAt(0);
    document.getElementById('t-info-icon').style.backgroundColor = tData.color;
    document.getElementById('t-info-title').innerText = tData.id;
    document.getElementById('t-info-arab').innerText = tData.arab;
    document.getElementById('t-info-desc').innerText = tData.penjelasan;
    document.getElementById('t-info-cara').innerText = tData.cara;
    const contohParts = tData.contoh.split(' - ');
    document.getElementById('t-info-contoh').innerText = contohParts[0];
    document.getElementById('t-info-contoh-desc').innerText = contohParts[1] || '';
    document.getElementById('t-info-letters').innerText = huruf;
    document.getElementById('modal-tajwid-info').style.display = 'flex';
};

// Advanced Regex Approximation for 14 Tajwid rules in pure JS (Without API pre-parsed markings)
window.applyTajwid = function(text) {
    return text
        // 1. Ghunnah (Mim/Nun Tasydid)
        .replace(/([نم])[\u0651]/g, `<span class="t-rule tj-ghunnah" onclick="showTajwidInfo('Ghunnah', '$&')">$&</span>`)
        // 2. Qalqalah (Ba, Jim, Dal, Tha, Qaf sukun)
        .replace(/([بجدطق])\u0652/g, `<span class="t-rule tj-qalqalah" onclick="showTajwidInfo('Qalqalah', '$&')">$&</span>`)
        // 3. Mad (Tanda bendera/panjang)
        .replace(/[\u0653]/g, `<span class="t-rule tj-mad" onclick="showTajwidInfo('Madd', '$&')">$&</span>`)
        // 4. Iqlab (Mim kecil)
        .replace(/[\u06E2]/g, `<span class="t-rule tj-iqlab" onclick="showTajwidInfo('Iqlab', '$&')">$&</span>`)
        // 5. Ikhfa Syafawi (Mim mati ketemu Ba)
        .replace(/مْ(?=\s*ب)/g, `<span class="t-rule tj-ikhfa-syaf" onclick="showTajwidInfo('Ikhfa Syafawi', '$&')">$&</span>`)
        // 6. Idgham Mutamatsilain / Mimi (Mim mati ketemu Mim)
        .replace(/مْ(?=\s*م)/g, `<span class="t-rule tj-mutamatsilain" onclick="showTajwidInfo('Idgham Mutamatsilain', '$&')">$&</span>`)
        // 7. Idgham Bighunnah (Nun mati/Tanwin ketemu Ya, Nun, Mim, Waw)
        .replace(/(نْ|[\u064B\u064C\u064D])(?=\s*[ينمو])/g, `<span class="t-rule tj-idgham" onclick="showTajwidInfo('Idgham', '$&')">$&</span>`)
        // 8. Idgham Bilaghunnah (Nun mati/Tanwin ketemu Lam, Ra)
        .replace(/(نْ|[\u064B\u064C\u064D])(?=\s*[لر])/g, `<span class="t-rule tj-idgham" onclick="showTajwidInfo('Idgham', '$&')">$&</span>`)
        // 9. Ikhfa Haqiqi (Nun mati/Tanwin ketemu 15 huruf ikhfa)
        .replace(/(نْ|[\u064B\u064C\u064D])(?=\s*[تثجدذزسشصضطظفقك])/g, `<span class="t-rule tj-ikhfa" onclick="showTajwidInfo('Ikhfa', '$&')">$&</span>`)
        // 10. Idzhar Halqi (Nun mati/Tanwin ketemu huruf halqi)
        .replace(/(نْ|[\u064B\u064C\u064D])(?=\s*[ءأإهعحغخ])/g, `<span class="t-rule tj-idzhar" onclick="showTajwidInfo('Izhar', '$&')">$&</span>`)
        // 11. Idgham Syamsiyah (Alif Lam ketemu huruf Syamsiyah)
        .replace(/ال(?=[تثدذرزسشصضطظلن][\u0651])/g, `<span class="t-rule tj-idgham-syam" onclick="showTajwidInfo('Idgham Syamsiyah', '$&')">$&</span>`);
};
