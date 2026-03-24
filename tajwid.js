/* ==============================================================
   TAJWID.JS - 14 HUKUM LENGKAP & AMAN (MESIN TEROPTIMALISASI)
   ============================================================== */

const tajwidDatabase =;

window.applyTajwid = function(text) {
    if (!text) return "";
    
    // Optimisasi variabel Skip dan Space menggunakan logika lookahead untuk perlindungan struktural DOM
    // Mencakup dukungan komprehensif untuk rentang Unicode diakritik, tanwin berurutan (08F0-08F2), anotasi mikro al-Qur'an, serta zero-width modifiers.
    const skip = "(?:*|<[^>]+>)*";
    const space = "*";

    return text
        // 1. Marka Karakter Independen yang terisolasi secara tipografis
       .replace(/([\u0653])/g, `<span class="t-rule tj-mad" onclick="window.showTajwidInfo(event, 'Madd', '$&')">$&</span>`)
       .replace(/()/g, `<span class="t-rule tj-saktah" onclick="window.showTajwidInfo(event, 'Saktah', '$&')">$&</span>`)
        
        // 2. Kombinatorika Spesifik Kontekstual Awal Kata
       .replace(/([\u0671ٱ])/g, `<span class="t-rule tj-hamzah" onclick="window.showTajwidInfo(event, 'Hamzah Wasl', '$&')">$&</span>`)
       .replace(new RegExp(`((?:ال|ٱل|اَل|اَۨل|اۨل))(?=${skip}${space}[تثدذرزسشصضطظلن][\u0651])`, 'g'), `<span class="t-rule tj-idgham-syam" onclick="window.showTajwidInfo(event, 'Idgham Syamsiyah', '$&')">$&</span>`)
        
        // 3. Modifikasi Tingkat Lanjut Asimilasi Berbasis Kedekatan Makhraj
       .replace(new RegExp(`(ق(?:${skip})?)(?=${skip}${space}ك)|(ل(?:${skip})?)(?=${skip}${space}ر)`, 'g'), `<span class="t-rule tj-mutaqaribain" onclick="window.showTajwidInfo(event, 'Idgham Mutaqaribain', '$&')">$&</span>`)
       .replace(new RegExp(`(م(?:${skip})?)(?=${skip}${space}م)`, 'g'), `<span class="t-rule tj-mutamatsilain" onclick="window.showTajwidInfo(event, 'Idgham Mutamatsilain', '$&')">$&</span>`)
        
        // 4. Peraturan Eksklusif Fusi Mim Bersukun
       .replace(new RegExp(`(م(?:${skip})?)(?=${skip}${space}ب)`, 'g'), `<span class="t-rule tj-ikhfa-syaf" onclick="window.showTajwidInfo(event, 'Ikhfa Syafawi', '$&')">$&</span>`)
        
        // 5. Resolusi Aturan Kaskade Nun Bersukun dan Tanwin Multi-Unicode
       .replace(new RegExp(`(ن(?:${skip})?|[ًٌٍ\u08F0-\u08F2])(?=${skip}${space}ب)`, 'g'), `<span class="t-rule tj-iqlab" onclick="window.showTajwidInfo(event, 'Iqlab', '$&')">$&</span>`)
       .replace(new RegExp(`(ن(?:${skip})?|[ًٌٍ\u08F0-\u08F2])(?=${skip}${space}[ينمو])`, 'g'), `<span class="t-rule tj-idgham" onclick="window.showTajwidInfo(event, 'Idgham Bighunnah', '$&')">$&</span>`)
       .replace(new RegExp(`(ن(?:${skip})?|[ًٌٍ\u08F0-\u08F2])(?=${skip}${space}[لر])`, 'g'), `<span class="t-rule tj-idgham" onclick="window.showTajwidInfo(event, 'Idgham Bilaghunnah', '$&')">$&</span>`)
       .replace(new RegExp(`(ن(?:${skip})?|[ًٌٍ\u08F0-\u08F2])(?=${skip}${space}[تثجدذزسشصضطظفقك])`, 'g'), `<span class="t-rule tj-ikhfa" onclick="window.showTajwidInfo(event, 'Ikhfa', '$&')">$&</span>`)
       .replace(new RegExp(`(ن(?:${skip})?|[ًٌٍ\u08F0-\u08F2])(?=${skip}${space}[ءأإؤئهاعحغخ])`, 'g'), `<span class="t-rule tj-idzhar" onclick="window.showTajwidInfo(event, 'Izhar', '$&')">$&</span>`)
        
        // 6. Pembersihan Modifikator Sekunder Pendeteksian Dinamika Sukun dan Tasydid (Ghunnah & Qalqalah)
       .replace(new RegExp(`([نم](?:${skip})?[\u0651])`, 'g'), `<span class="t-rule tj-ghunnah" onclick="window.showTajwidInfo(event, 'Ghunnah', '$&')">$&</span>`)
       .replace(new RegExp(`([بجدطق])(?=${skip})`, 'g'), `<span class="t-rule tj-qalqalah" onclick="window.showTajwidInfo(event, 'Qalqalah', '$&')">$&</span>`);
};

window.showTajwidInfo = function(event, jenis, huruf) {
    if (event) event.stopPropagation();
    const tData = tajwidDatabase.find(t => t.id === jenis |

| t.id.includes(jenis)) |
| tajwidDatabase;
    
    document.getElementById('t-info-icon').innerText = tData.id.charAt(0);
    document.getElementById('t-info-icon').style.backgroundColor = tData.color;
    document.getElementById('t-info-title').innerText = tData.id;
    document.getElementById('t-info-arab').innerText = tData.arab;
    document.getElementById('t-info-desc').innerText = tData.penjelasan;
    document.getElementById('t-info-cara').innerText = tData.cara;
    document.getElementById('t-info-contoh').innerText = tData.contoh;
    document.getElementById('t-info-letters').innerText = huruf;
    
    document.getElementById('modal-tajwid-info').style.display = 'flex';
};

window.renderTajwidGuide = function() {
    const list = document.getElementById('tajwid-guide-list');
    if(!list) return;
    list.innerHTML = tajwidDatabase.map((t, i) => `
        <div class="tg-item">
            <div class="tg-header" onclick="window.toggleTG(${i})">
                <div class="tg-color-box" style="background-color: ${t.color};">${t.id.charAt(0)}</div>
                <div style="flex:1;"><div style="font-weight:bold; font-size:15px;">${t.id}</div><div class="font-arab" style="font-size:14px; color:#94a3b8;">${t.arab}</div></div>
                <i class="fas fa-chevron-down" id="tg-icon-${i}"></i>
            </div>
            <div class="tg-body" id="tg-body-${i}" style="max-height:0; overflow:hidden; transition:0.3s; background:#0f172a;">
                <div style="padding:15px;">
                    <div class="t-section-title" style="color:#60a5fa;">Penjelasan</div><p class="small mb-3">${t.penjelasan}</p>
                    <div class="t-section-title" style="color:#fbbf24;">Cara Membaca</div><p class="small mb-3">${t.cara}</p>
                    <div class="t-section-title" style="color:#34d399;">Contoh</div><p class="font-arab" style="font-size:20px;">${t.contoh}</p>
                </div>
            </div>
        </div>`).join('');
};

window.openTajwidGuide = function() {
    document.getElementById('modal-tajwid-guide').style.display = 'flex';
};

window.toggleTG = function(idx) {
    const b = document.getElementById(`tg-body-${idx}`); const icon = document.getElementById(`tg-icon-${idx}`);
    if(b.style.maxHeight === '0px' |

| b.style.maxHeight === '') { b.style.maxHeight = '500px'; icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); } 
    else { b.style.maxHeight = '0px'; icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); }
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(window.renderTajwidGuide, 500); });
