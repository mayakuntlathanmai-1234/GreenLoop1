(function(){
  const STORAGE_KEY = 'greenloop_admin_events_v1';

  const form = document.getElementById('evtForm');
  const titleEl = document.getElementById('evtTitle');
  const dateEl = document.getElementById('evtDate');
  const timeEl = document.getElementById('evtTime') || { value: '' };
  const locEl = document.getElementById('evtLocation');
  const capEl = document.getElementById('evtCapacity');
  const descEl = document.getElementById('evtDesc');
  const listEl = document.getElementById('eventsList');
  const countEl = document.getElementById('eventsCount');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEdit');
  const clearAllBtn = document.getElementById('clearAll');
  const formTitle = document.getElementById('formTitle');

  let editingIndex = -1;

  function load(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
  }
  function save(items){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    render();
  }

  function resetForm(){
    form.reset();
    editingIndex = -1;
    submitBtn.textContent = 'Add event';
    cancelEditBtn.classList.add('hidden');
    formTitle.textContent = 'Add new event';
  }

  function populateForm(evt){
    titleEl.value = evt.title || '';
    dateEl.value = evt.date || '';
    if (document.getElementById('evtTime')) document.getElementById('evtTime').value = evt.time || '';
    locEl.value = evt.location || '';
    capEl.value = evt.capacity || '';
    descEl.value = evt.desc || '';
  }

  function render(){
    const items = load();
    countEl.textContent = `${items.length} event${items.length !== 1 ? 's' : ''}`;
    listEl.innerHTML = '';
    if (!items.length){
      listEl.innerHTML = '<p class="muted">No events yet. Add one with the form.</p>';
      return;
    }
    items.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'event';
      row.innerHTML = `<div class="left">
          <strong>${escapeHtml(it.title)}</strong>
          <div class="meta">${escapeHtml(it.date || '—')} ${it.time ? '· ' + escapeHtml(it.time) : ''} · ${escapeHtml(it.location||'—')}</div>
          <div class="meta">${escapeHtml(it.desc||'')}</div>
          <div class="meta">Capacity: ${it.capacity || '—'}</div>
        </div>
        <div class="actions" style="flex-direction:column;align-items:flex-end">
          <div style="display:flex;flex-direction:column;gap:8px">
            <button data-action="toggle" data-idx="${idx}" class="ghost">${it.published ? 'Unpublish' : 'Publish'}</button>
            <button data-action="edit" data-idx="${idx}" class="ghost">Edit</button>
            <button data-action="delete" data-idx="${idx}" class="outline">Delete</button>
          </div>
        </div>`;
      listEl.appendChild(row);
    });

    // attach handlers
    listEl.querySelectorAll('button[data-action]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.getAttribute('data-idx'));
        const action = btn.getAttribute('data-action');
        const items = load();
        if (action === 'delete'){
          if (!confirm('Delete this event?')) return;
          items.splice(idx,1);
          save(items); // will remove from public page as well
        } else if (action === 'edit'){
          editingIndex = idx;
          populateForm(items[idx]);
          submitBtn.textContent = 'Save changes';
          cancelEditBtn.classList.remove('hidden');
          formTitle.textContent = 'Edit event';
          window.scrollTo({top:0,behavior:'smooth'});
        } else if (action === 'toggle'){
          items[idx].published = !items[idx].published;
          save(items); // public page reads same storage and updates
        }
      });
    });
  }

  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // form submit
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const items = load();
    const data = {
      title: titleEl.value.trim(),
      date: dateEl.value || '',
      time: (document.getElementById('evtTime') && document.getElementById('evtTime').value) || '',
      location: locEl.value.trim(),
      capacity: capEl.value ? Number(capEl.value) : null,
      desc: descEl.value.trim(),
      published: editingIndex >= 0 ? (items[editingIndex].published || false) : false,
      createdAt: editingIndex >= 0 ? items[editingIndex].createdAt : new Date().toISOString()
    };
    if (!data.title || !data.date){
      alert('Please provide a title and date.');
      return;
    }
    if (editingIndex >= 0){
      items[editingIndex] = Object.assign({}, items[editingIndex], data);
      save(items);
      resetForm();
      alert('Event updated.');
    } else {
      items.unshift(data);
      save(items);
      form.reset();
      alert('Event added.');
    }
  });

  cancelEditBtn.addEventListener('click', function(){ resetForm(); });

  clearAllBtn.addEventListener('click', function(){
    if (!confirm('Clear all events? This cannot be undone.')) return;
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    render();
  });

  // initial render
  render();

  // notify other windows (storage event is fired on other windows automatically when localStorage changes).
  // No extra broadcast needed here; saving to localStorage will trigger storage events for other tabs.
})();
