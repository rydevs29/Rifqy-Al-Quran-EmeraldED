/* ==============================================================
   TAJWID.JS - DATABASE & PANDUAN TAJWID KOMPREHENSIF
   ============================================================== */

const tajwidDatabase = [
    { id: "Hamzah", color: "#9ca3af", class: "tj-hamzah", desc: "Tanda Hamzah Wasl atau Qatha'." },
    { id: "Idgham Syamsiyah", color: "#3b82f6", class: "tj-idgham_syam", desc: "Alif Lam Syamsiyah. Alif Lam tidak dibaca, masuk ke huruf tasydid." },
    { id: "Ghunnah", color: "#f97316", class: "tj-ghunnah", desc: "Dengung ditahan 2 harakat karena Nun bertasydid." },
    { id: "Ikhfa", color: "#ec4899", class: "tj-ikhfa", desc: "Disamarkan disertai dengung." },
    { id: "Madd", color: "#ef4444", class: "tj-mad", desc: "Dibaca panjang 4-6 harakat." },
    { id: "Qalqalah", color: "#10b981", class: "tj-qalqalah", desc: "Suara dipantulkan." },
    { id: "Iqlab", color: "#8b5cf6", class: "tj-iqlab", desc: "Tanwin diganti menjadi Mim, berdengung karena bertemu huruf Ba." },
    { id: "Idgham Bighunnah", color: "#06b6d4", class: "tj-idgham_bighun", desc: "Dilebur dengan dengung." },
    { id: "Ikhfa Syafawi", color: "#d946ef", class: "tj-ikhfa_syaf", desc: "Mim mati bertemu huruf Ba, dibaca samar disertai dengung." },
    { id: "Idzhar", color: "#eab308", class: "tj-idzhar", desc: "Dibaca Jelas tanpa dengung." }
];

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('tajwid-guide-list');
    if(!list) return;
    list.innerHTML = tajwidDatabase.map((t, i) => `
        <div class="tg-item">
            <div class="tg-header" onclick="toggleTG(${i})"><div class="tg-color-box" style="background-color: ${t.color};"></div><span>${t.id}</span><i class="fas fa-chevron-down" id="tg-icon-${i}"></i></div>
            <div class="tg-body" id="tg-body-${i}">${t.desc}</div>
        </div>`).join('');
});

function toggleTG(idx) {
    const b = document.getElementById(`tg-body-${idx}`); const c = document.getElementById(`tg-icon-${idx}`);
    if(b.classList.contains('open')) { b.classList.remove('open'); c.classList.replace('fa-chevron-up', 'fa-chevron-down'); } 
    else { b.classList.add('open'); c.classList.replace('fa-chevron-down', 'fa-chevron-up'); }
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

// --- REGEX TAJWID DARI KODE LAMA ---
window.applyTajwid = function(text) {
    return text.replace(/([نم])[\u0651]/g, `<span class="t-rule tj-ghunnah" onclick="showTajwidInfo('Ghunnah', '$&')">$&</span>`)
            .replace(/([بجدطق])\u0652/g, `<span class="t-rule tj-qalqalah" onclick="showTajwidInfo('Qalqalah', '$&')">$&</span>`)
            .replace(/[\u0653]/g, `<span class="t-rule tj-mad" onclick="showTajwidInfo('Madd', '$&')">$&</span>`)
            .replace(/[\u06E2]/g, `<span class="t-rule tj-iqlab" onclick="showTajwidInfo('Iqlab', '$&')">$&</span>`)
            .replace(/[\u064B\u064C\u064D]/g, `<span class="t-rule tj-ikhfa" onclick="showTajwidInfo('Ikhfa', '$&')">$&</span>`);
};
