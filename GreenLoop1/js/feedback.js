(function(){
  const FKEY = 'greenloop_feedbacks_v1';
  const containerId = 'publicFeedbacks';

  function loadFeedbacks(){
    try{ return JSON.parse(localStorage.getItem(FKEY) || '[]'); }catch(e){ return []; }
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function render(){
    const el = document.getElementById(containerId);
    if (!el) return;
    const list = loadFeedbacks();
    if (!list.length){
      el.innerHTML = '<div style="color:#6b7280">No feedback yet.</div>';
      return;
    }
    // show latest first
    const items = list.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    el.innerHTML = items.map(f => {
      return `<div style="background:#fff;border:1px solid #eef6ee;padding:12px;border-radius:10px;box-shadow:0 8px 20px rgba(12,18,33,0.04)">
        <div style="font-weight:700;color:#0f5132">${escapeHtml(f.name || 'Anonymous')} <span style="font-weight:600;color:#6b7280;font-size:12px;margin-left:8px">${escapeHtml(f.reportId || '')}</span></div>
        <div style="color:#374151;margin-top:8px">${escapeHtml(f.message)}</div>
        <div style="color:#9aa3ad;font-size:12px;margin-top:8px">${new Date(f.createdAt).toLocaleString()}</div>
      </div>`;
    }).join('');
  }

  // init on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    render();
    // update on storage changes (other tabs)
    window.addEventListener('storage', function(e){
      if (!e.key || e.key === FKEY) render();
    });
  });
})();
