/* ==============================================================
   DIARY.JS - LOGIKA CATATAN ISLAMI
   ============================================================== */

window.diaryNotes = [];

window.loadNotes = function() {
    let raw = window.syncStorage.getItem('rDiaryNotes');
    if(raw) { window.diaryNotes = JSON.parse(raw); }
    window.renderNotes(window.diaryNotes);
};

window.renderNotes = function(dataToRender) {
    const list = document.getElementById('diary-list'); if(!list) return;
    
    if(dataToRender.length === 0) {
        list.innerHTML = `<div class="text-center text-muted mt-5"><i class="fas fa-file-alt" style="font-size: 50px; opacity: 0.2; margin-bottom: 15px;"></i><h4 class="font-bold text-dark">Belum ada catatan</h4><p class="small">Mulai tulis catatan pertama Anda</p></div>`;
        return;
    }
    
    list.innerHTML = dataToRender.map(note => `
        <div class="tool-card mb-3 p-3 border-radius bg-light">
            <div class="flex-between mb-2">
                <span class="badge bg-primary text-white small p-1 border-radius">${note.tag}</span>
                <small class="text-muted" style="font-size:10px;">${new Date(note.date).toLocaleDateString('id-ID')}</small>
            </div>
            <h4 class="font-bold text-dark mb-1" style="font-size:16px;">${note.title}</h4>
            <p class="small text-muted mb-3" style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${note.content}</p>
            <div class="flex-end gap-10">
                <button class="btn-icon text-primary" onclick="window.editNote('${note.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon text-danger" onclick="window.deleteNote('${note.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `).join('');
};

window.generateRandomId = function() { return Math.random().toString(36).substring(2, 10) + Date.now().toString(36); };

window.openDiaryEditor = function() {
    document.getElementById('diary-id').value = '';
    document.getElementById('diary-title').value = '';
    document.getElementById('diary-tag').value = 'Umum';
    document.getElementById('diary-content').value = '';
    
    const btnShare = document.getElementById('btn-share-diary');
    if(!navigator.onLine) { btnShare.style.display = 'none'; } else { btnShare.style.display = 'block'; }
    window.openModal('modal-diary-editor');
};

window.editNote = function(id) {
    const note = window.diaryNotes.find(n => n.id === id); if(!note) return;
    document.getElementById('diary-id').value = note.id;
    document.getElementById('diary-title').value = note.title;
    document.getElementById('diary-tag').value = note.tag;
    document.getElementById('diary-content').value = note.content;
    
    const btnShare = document.getElementById('btn-share-diary');
    if(!navigator.onLine) btnShare.style.display = 'none'; else btnShare.style.display = 'block';
    window.openModal('modal-diary-editor');
};

window.saveNote = function(isFromShare = false) {
    const idInput = document.getElementById('diary-id').value;
    const title = document.getElementById('diary-title').value.trim() || 'Catatan Tanpa Judul';
    const tag = document.getElementById('diary-tag').value;
    const content = document.getElementById('diary-content').value.trim();
    
    if(content === '') { alert('Isi catatan tidak boleh kosong!'); return null; }
    
    let targetId = idInput || window.generateRandomId();
    
    if(idInput) {
        const idx = window.diaryNotes.findIndex(n => n.id === idInput);
        if(idx > -1) { window.diaryNotes[idx].title = title; window.diaryNotes[idx].tag = tag; window.diaryNotes[idx].content = content; window.diaryNotes[idx].date = new Date().getTime(); }
    } else {
        window.diaryNotes.unshift({ id: targetId, title: title, tag: tag, content: content, date: new Date().getTime() });
    }
    
    window.syncStorage.setItem('rDiaryNotes', JSON.stringify(window.diaryNotes)); window.renderNotes(window.diaryNotes);
    if(!isFromShare) { window.closeModal('modal-diary-editor'); }
    return targetId;
};

window.deleteNote = function(id) {
    if(confirm('Yakin ingin menghapus catatan ini?')) { window.diaryNotes = window.diaryNotes.filter(n => n.id !== id); window.syncStorage.setItem('rDiaryNotes', JSON.stringify(window.diaryNotes)); window.renderNotes(window.diaryNotes); }
};

window.filterDiary = function() {
    const q = document.getElementById('search-diary').value.toLowerCase();
    const filtered = window.diaryNotes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)); window.renderNotes(filtered);
};
window.filterDiaryTag = function(tag) { if(tag === '') window.renderNotes(window.diaryNotes); else window.renderNotes(window.diaryNotes.filter(n => n.tag === tag)); };

window.shareNoteOnline = function() {
    if(!navigator.onLine) { alert('Fitur bagikan butuh koneksi internet!'); return; }
    const savedId = window.saveNote(true); if(!savedId) return;
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = baseUrl + "?note=" + savedId;
    
    if (navigator.share) { navigator.share({ title: 'Catatan Islami Rifqy', text: 'Baca catatan Islami saya di Rifqy Quran', url: shareLink }).then(() => { window.closeModal('modal-diary-editor'); }).catch(console.error); } 
    else { navigator.clipboard.writeText(shareLink).then(() => { alert("Berhasil! Link acak berhasil disalin:\n" + shareLink); window.closeModal('modal-diary-editor'); }).catch(err => { alert("Gagal menyalin link: " + err); }); }
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(window.loadNotes, 1000); });
