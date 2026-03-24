/* ==============================================================
   TAJWID.JS - DATABASE & PANDUAN TAJWID KOMPREHENSIF
   ============================================================== */

const tajwidDatabase = [
    { id: "Hamzah Wasl", color: "#9ca3af", desc: "Hamzah yang diucapkan saat di awal bacaan, tapi tidak diucapkan saat disambung dengan kata sebelumnya." },
    { id: "Idgham Syamsiyah", color: "#3b82f6", desc: "Alif Lam (ال) bertemu huruf Syamsiyah. Huruf Lam tidak dibaca, langsung masuk ke huruf berikutnya yang bertasydid." },
    { id: "Ghunnah", color: "#f97316", desc: "Dengung ditahan 2-3 harakat. Terjadi saat huruf Nun (ن) atau Mim (م) bertasydid." },
    { id: "Ikhfa", color: "#ec4899", desc: "Disamarkan atau dilebur ke huruf setelahnya disertai dengung. Terjadi saat Nun Mati/Tanwin bertemu 15 huruf Ikhfa." },
    { id: "Madd", color: "#ef4444", desc: "Dibaca panjang. Harakat panjang atau tanda bendera (4-6 harakat)." },
    { id: "Qalqalah", color: "#10b981", desc: "Suara dipantulkan. Terjadi saat huruf Ba, Jim, Dal, Tha, Qaf berharakat Sukun." },
    { id: "Iqlab", color: "#8b5cf6", desc: "Suara Nun Mati/Tanwin diganti menjadi huruf Mim (م), berdengung karena bertemu huruf Ba (ب)." },
    { id: "Idgham Bighunnah", color: "#06b6d4", desc: "Dilebur dengan dengung. Nun Mati/Tanwin bertemu Ya, Nun, Mim, Wawu." },
    { id: "Ikhfa Syafawi", color: "#d946ef", desc: "Mim mati (مْ) bertemu huruf Ba (ب). Dibaca samar disertai dengung." },
    { id: "Idzhar", color: "#eab308", desc: "Dibaca Jelas tanpa dengung. Nun Mati/Tanwin bertemu huruf tenggorokan (Alif, Ha, Kha, 'Ain, Ghain, Ha)." }
];

document.addEventListener('DOMContentLoaded', () => {
    renderTajwidGuide();
});

function renderTajwidGuide() {
    const container = document.getElementById('tajwid-guide-list');
    if(!container) return;
    
    container.innerHTML = tajwidDatabase.map((t, i) => `
        <div class="tg-item">
            <div class="tg-header" onclick="toggleTG(${i})">
                <div class="tg-color-box" style="background-color: ${t.color};"></div>
                <span style="flex:1;">${t.id}</span>
                <i class="fas fa-chevron-down" id="tg-icon-${i}"></i>
            </div>
            <div class="tg-body" id="tg-body-${i}">
                ${t.desc}
            </div>
        </div>
    `).join('');
}

function toggleTG(idx) {
    const body = document.getElementById(`tg-body-${idx}`);
    const icon = document.getElementById(`tg-icon-${idx}`);
    if(body.classList.contains('open')) {
        body.classList.remove('open'); icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    } else {
        body.classList.add('open'); icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    }
}

// --- FUNGSI MUNCULIN POPUP SAAT BACA AL-QURAN ---
window.showTajwidInfo = function(jenis, huruf) {
    // Cari data di database
    const tData = tajwidDatabase.find(t => t.id.includes(jenis) || jenis.includes(t.id));
    const desc = tData ? tData.desc : "Hukum tajwid Al-Quran.";

    document.getElementById('t-info-title').innerText = jenis;
    document.getElementById('t-info-desc').innerText = desc;
    document.getElementById('t-info-letters').innerText = huruf;
    
    document.getElementById('modal-tajwid-info').style.display = 'flex';
};

// --- FUNGSI REGEX TAJWID DARI APP.JS (DIPINDAH KE SINI) ---
window.applyTajwid = function(text) {
    // Gunakan class CSS yang ada di style.css, dan panggil showTajwidInfo onClick
    return text.replace(/([نم])[\u0651]/g, `<span class="t-rule tj-ghunnah" onclick="showTajwidInfo('Ghunnah', '$&')">$&</span>`)
            .replace(/([بجدطق])\u0652/g, `<span class="t-rule tj-qalqalah" onclick="showTajwidInfo('Qalqalah', '$&')">$&</span>`)
            .replace(/[\u0653]/g, `<span class="t-rule tj-mad" onclick="showTajwidInfo('Madd', '$&')">$&</span>`)
            .replace(/[\u06E2]/g, `<span class="t-rule tj-iqlab" onclick="showTajwidInfo('Iqlab', '$&')">$&</span>`)
            .replace(/[\u064B\u064C\u064D]/g, `<span class="t-rule tj-ikhfa" onclick="showTajwidInfo('Ikhfa', '$&')">$&</span>`);
};

window.openTajwidGuide = function() {
    document.getElementById('modal-lainnya').style.display = 'none';
    document.getElementById('modal-tajwid-guide').style.display = 'flex';
};
