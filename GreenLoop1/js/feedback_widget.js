(function(){
  const FKEY = 'greenloop_feedbacks_v1';
  const RKEY = 'greenloop_reports_v1';

  // inject minimal styles for star rating and feedback cards
  (function injectStyles(){
    const css = `
      .gl-stars{display:inline-flex;gap:6px;align-items:center}
      .gl-star{font-size:20px;cursor:pointer;color:#d1d5db}
      .gl-star.filled{color:#f59e0b}
      .gl-feedback-card{background:#fff;border:1px solid #eef6ee;padding:12px;border-radius:10px;box-shadow:0 8px 20px rgba(12,18,33,0.04)}
      .gl-feedback-meta{font-size:12px;color:#6b7280;margin-top:8px}
      .gl-feedback-rating{margin-top:6px}
      .gl-admin-actions{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap}
      .gl-btn{padding:6px 10px;border-radius:8px;border:0;cursor:pointer;font-weight:600}
      .gl-btn.ghost{background:#fff;border:1px solid #e6eef0;color:#374151}
      .gl-btn.danger{background:#ef4444;color:#fff}
    `;
    const s = document.createElement('style'); s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  })();

  function loadFeedbacks(){ try{ return JSON.parse(localStorage.getItem(FKEY)||'[]'); }catch(e){ return []; } }
  function saveFeedbacks(list){ try{ localStorage.setItem(FKEY, JSON.stringify(list)); }catch(e){} }
  function loadReports(){ try{ return JSON.parse(localStorage.getItem(RKEY)||'[]'); }catch(e){ return []; } }
  function saveReports(list){ try{ localStorage.setItem(RKEY, JSON.stringify(list)); }catch(e){} }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // render public feedbacks into #publicFeedbacks
  function renderPublicFeedbacks(){
    const container = document.getElementById('publicFeedbacks');
    if (!container) return;
    const list = loadFeedbacks();
    if (!list.length){
      container.innerHTML = '<div style="color:#6b7280">No feedback yet.</div>';
      return;
    }
    const items = list.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    container.innerHTML = items.map(f => {
      const stars = renderStarsStatic(f.rating || 0);
      return `<div class="gl-feedback-card">
        <div style="font-weight:700;color:#0f5132">${escapeHtml(f.name || 'Anonymous')}</div>
        <div style="color:#374151;margin-top:6px">${escapeHtml(f.message)}</div>
        <div class="gl-feedback-meta">${escapeHtml(f.reportId||'')} · ${new Date(f.createdAt).toLocaleString()}</div>
        <div class="gl-feedback-rating">${stars}</div>
      </div>`;
    }).join('');
  }

  // render admin feedback list into #feedbackList (if exists)
  function renderAdminFeedbackList(){
    const container = document.getElementById('feedbackList');
    if (!container) return;
    const list = loadFeedbacks();
    if (!list.length){
      container.innerHTML = '<div class="muted">No feedback yet.</div>';
      return;
    }
    container.innerHTML = list.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).map((f,idx)=>{
      const stars = renderStarsStatic(f.rating || 0);
      return `<div style="margin-bottom:8px" data-idx="${idx}" class="gl-feedback-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${escapeHtml(f.reportId || '')} — ${escapeHtml(f.name || 'Anonymous')}</div>
          <div style="font-size:12px;color:#9aa3ad">${new Date(f.createdAt).toLocaleString()}</div>
        </div>
        <div style="color:#374151;margin-top:8px">${escapeHtml(f.message)}</div>
        <div class="gl-feedback-rating" style="margin-top:8px">${stars}</div>
        <div class="gl-admin-actions">
          <button class="gl-btn ghost" data-act="view" data-id="${f.reportId}">View Report</button>
          <button class="gl-btn ghost" data-act="delete" data-idx="${idx}">Delete</button>
        </div>
      </div>`;
    }).join('');

    // attach handlers
    container.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', function(){
        const act = btn.getAttribute('data-act');
        if (act === 'delete'){
          const idx = Number(btn.getAttribute('data-idx'));
          const list = loadFeedbacks();
          if (!confirm('Delete this feedback?')) return;
          list.splice(idx,1);
          saveFeedbacks(list);
          renderAdminFeedbackList();
          renderPublicFeedbacks();
        } else if (act === 'view'){
          const id = btn.getAttribute('data-id');
          // try to find report and scroll to it or open admin reports table filter
          const reports = loadReports();
          const r = reports.find(rr=>rr.id===id);
          if (r) {
            alert(`Report ${id}\nStatus: ${r.status}\nLocation: ${r.location}\nDetails: ${r.desc}`);
          } else {
            alert('Report not found in storage.');
          }
        }
      });
    });
  }

  // static stars HTML for display only
  function renderStarsStatic(rating){
    let out = '';
    for(let i=1;i<=5;i++){
      out += `<span class="gl-star ${i<=rating ? 'filled' : ''}">&#9733;</span>`;
    }
    return out;
  }

  // enhance the report feedback banner (id reportFeedbackBanner) to include star UI
  function enhanceFeedbackBanner(){
    const banner = document.getElementById('reportFeedbackBanner');
    if (!banner) return;
    // avoid double-init
    if (banner.dataset.glInit === '1') return;
    banner.dataset.glInit = '1';

    // create star widget
    const starWrap = document.createElement('div');
    starWrap.className = 'gl-stars';
    starWrap.style.marginTop = '8px';
    for(let i=1;i<=5;i++){
      const s = document.createElement('span');
      s.className = 'gl-star';
      s.innerHTML = '&#9733;';
      s.tabIndex = 0;
      s.dataset.value = i;
      s.addEventListener('click', onStarClick);
      s.addEventListener('keydown', function(e){ if (e.key === 'Enter') onStarClick.call(this,e); });
      starWrap.appendChild(s);
    }
    // insert above buttons
    const existingButtons = banner.querySelector('div[style*="display:flex"]') || banner.querySelector('.modal-actions') || null;
    if (existingButtons) existingButtons.parentNode.insertBefore(starWrap, existingButtons);

    // keep selected rating in dataset
    banner.dataset.selectedRating = '5'; // default 5

    function onStarClick(e){
      const v = Number(this.dataset.value || 0);
      banner.dataset.selectedRating = String(v);
      Array.from(starWrap.children).forEach(ch => {
        ch.classList.toggle('filled', Number(ch.dataset.value) <= v);
      });
    }

    // override existing send handler (if present)
    const sendBtn = document.getElementById('fbSend');
    if (sendBtn){
      sendBtn.addEventListener('click', function(){
        const lastId = sessionStorage.getItem('my_last_report_id');
        if (!lastId){ alert('No recent report found.'); return; }
        const name = (document.getElementById('fbName')||{value:''}).value.trim();
        const msg = (document.getElementById('fbMsg')||{value:''}).value.trim();
        if (!msg){ alert('Please enter feedback.'); return; }
        const rating = Number(banner.dataset.selectedRating || 5);
        const feedback = { reportId: lastId, name: name || 'Anonymous', message: msg, rating, createdAt: new Date().toISOString() };
        const list = loadFeedbacks();
        list.unshift(feedback);
        saveFeedbacks(list);
        // mark report flag
        try{
          const reports = loadReports();
          const idx = reports.findIndex(r=>r.id === lastId);
          if (idx >=0 ){ reports[idx].feedbackGiven = true; localStorage.setItem(RKEY, JSON.stringify(reports)); }
        }catch(e){}
        // hide banner and notify
        if (typeof hideBanner === 'function') hideBanner(); // if page has hideBanner
        alert('Thanks for your feedback!');
        // rerender public and admin lists if present
        renderPublicFeedbacks();
        renderAdminFeedbackList();
      }, { once:true });
    }
  }

  // allow pages to call hideBanner if they defined earlier; provide fallback
  function hideBannerFallback(){ const b = document.getElementById('reportFeedbackBanner'); if (b) b.style.display='none'; }

  // Expose a helper globally for other scripts
  window.GreenLoopFeedback = {
    renderPublicFeedbacks,
    renderAdminFeedbackList,
    saveFeedbacks,
    loadFeedbacks
  };

  // Auto-init when DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    // enhance banner if present
    enhanceFeedbackBanner();

    // render public feedbacks if container exists
    renderPublicFeedbacks();

    // render admin feedbacks if admin container exists
    renderAdminFeedbackList();

    // add listener to storage changes
    window.addEventListener('storage', function(e){
      if (!e.key || e.key === FKEY){
        renderPublicFeedbacks();
        renderAdminFeedbackList();
      }
      if (!e.key || e.key === RKEY){
        // if report status changed, maybe show banner (other scripts handle that)
      }
    });

    // ensure global hideBanner reference for compatibility with existing inline code
    if (typeof window.hideBanner === 'undefined') window.hideBanner = hideBannerFallback;
  });
})();
