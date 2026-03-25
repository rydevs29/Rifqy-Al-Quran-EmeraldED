/* ==============================================================
   GAME.JS - LOGIKA GAME ISLAMI (ONLINE SAJA)
   ============================================================== */

window.checkGameOnlineStatus = function() {
    const warning = document.getElementById('game-online-warning');
    const content = document.getElementById('game-content-area');
    
    if(!navigator.onLine) {
        warning.classList.remove('hidden');
        content.classList.add('hidden');
    } else {
        warning.classList.add('hidden');
        content.classList.remove('hidden');
    }
};

window.startGame = function(gameMode) {
    if(!navigator.onLine) { alert("Game ini hanya dapat dimainkan dalam mode Online (Internet Aktif)."); return; }
    
    if(gameMode === 'tebak-ayat') {
        alert("🎮 Fitur Tebak Ayat sedang mengambil data dari server... \n(Sistem Poin & Leaderboard akan segera hadir!)");
    } else if(gameMode === 'sambung-ayat') {
        alert("🎮 Fitur Sambung Ayat sedang mengambil data dari server... \n(Pilih ayat selanjutnya dengan tepat!)");
    } else if(gameMode === 'hafalan-suara') {
        alert("🎙️ Hafalan Suara (Beta) membutuhkan izin mikrofon dari browser/HP Anda.");
    } else {
        alert("Game mode dalam pengembangan.");
    }
};
