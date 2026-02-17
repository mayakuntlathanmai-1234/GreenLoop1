(function(){
  // Demo admin credentials (replace with secure check against backend in production)
  const DEMO_ADMIN_EMAIL = 'admin@greenloop.com';
  const DEMO_ADMIN_PASSWORD = 'Admin@123';
  const AUTH_KEY = 'greenloop_admin_authenticated';

  // UI elements
  const adminAccess = document.getElementById('adminAccess');
  const modal = document.getElementById('adminModal');
  const adminForm = document.getElementById('adminForm');
  const adminCancel = document.getElementById('adminCancel');
  const adminError = document.getElementById('adminError');

  if (!adminAccess || !modal || !adminForm) return;

  function openModal(){
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.getElementById('adminEmail').focus();
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    adminError.textContent = '';
    adminForm.reset();
  }

  adminAccess.addEventListener('click', function(e){
    e.preventDefault();
    openModal();
  });

  adminCancel.addEventListener('click', function(){
    closeModal();
  });

  // close when clicking backdrop
  modal.addEventListener('click', function(e){
    if (e.target === modal) closeModal();
  });

  // keyboard support
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  adminForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = (document.getElementById('adminEmail').value || '').trim();
    const pwd = (document.getElementById('adminPassword').value || '').trim();

    // simple client-side check for demo — replace with secure server-side auth
    if (email.toLowerCase() === DEMO_ADMIN_EMAIL && pwd === DEMO_ADMIN_PASSWORD){
      // mark as authenticated and redirect to admin area
      try{ localStorage.setItem(AUTH_KEY, '1'); }catch(e){}
      window.location.href = 'admin_events.html';
      return;
    }

    // invalid
    adminError.textContent = 'Invalid admin credentials.';
    // small shake effect
    const card = modal.querySelector('.modal-card');
    card && (card.style.transform = 'translateX(-6px)');
    setTimeout(()=>{ card && (card.style.transform = 'translateX(6px)'); }, 80);
    setTimeout(()=>{ card && (card.style.transform = ''); }, 200);
  });

  // helper: if already authenticated, quick link to admin area
  try{
    if (localStorage.getItem(AUTH_KEY) === '1'){
      // reveal a small admin hint on the page (non-invasive)
      const hint = document.createElement('div');
      hint.style.fontSize = '13px';
      hint.style.marginTop = '10px';
      hint.style.color = '#155724';
      hint.textContent = 'Admin: signed in — ';
      const a = document.createElement('a');
      a.href = 'admin_events.html';
      a.textContent = 'Open admin events';
      a.style.color = '#0f5132';
      a.style.fontWeight = '700';
      hint.appendChild(a);
      const container = document.querySelector('.login-container');
      container && container.appendChild(hint);
    }
  }catch(e){}
})();
