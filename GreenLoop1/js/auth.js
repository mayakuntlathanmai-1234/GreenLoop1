(function(){
  const USERS_KEY = 'greenloop_users_v1';
  const SESSION_KEY = 'greenloop_user_session_v1';
  const REPORTS_KEY = 'greenloop_reports_v1';

  // minimal CSS injected for modal & dropdown
  const css = `
    .gl-modal-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.45);display:flex;align-items:center;justify-content:center;z-index:9999}
    .gl-modal{background:#fff;padding:18px;border-radius:10px;max-width:420px;width:92%;box-shadow:0 12px 40px rgba(2,6,23,0.18)}
    .gl-input{width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef;margin-top:8px}
    .gl-btn{padding:8px 12px;border-radius:8px;border:0;cursor:pointer;font-weight:700}
    .gl-btn.primary{background:#16a34a;color:#fff}
    .gl-btn.ghost{background:#fff;border:1px solid #e6e9ef}
    .gl-dropdown{position:absolute;background:#fff;border:1px solid #e6f3ea;border-radius:8px;padding:10px;min-width:220px;box-shadow:0 12px 30px rgba(2,6,23,0.12);z-index:9998}
    .gl-row{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px dashed #f1f5f3}
    .gl-row:last-child{border-bottom:0}
    .gl-small{font-size:13px;color:#6b7280}
    .gl-link{color:#0f5132;font-weight:700;text-decoration:none;cursor:pointer}
  `;
  const s = document.createElement('style'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s);

  // utilities
  async function sha256hex(str){
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){return[];} }
  function saveUsers(list){ try{ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }catch(e){} }
  function loadSession(){ try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }catch(e){return null;} }
  function saveSession(obj){ try{ localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); }catch(e){} }
  function clearSession(){ try{ localStorage.removeItem(SESSION_KEY); }catch(e){} }

  // seed demo user
  (async function seed(){
    const users = loadUsers();
    if (!users.length){
      const pwdHash = await sha256hex('User@123');
      users.push({ email:'user@example.com', name:'Demo User', pwdHash, coins:5, bookings:[{id:'SLOT-01', when:'2025-06-10 10:00' }], certificates: ['Recycling 101'] });
      saveUsers(users);
    }
  })();

  // create login modal & dropdown root (only once)
  let modalRoot, dropdownRoot;
  function ensureRoots(){
    if (!modalRoot){
      modalRoot = document.createElement('div'); modalRoot.id = 'gl-login-modal-root'; document.body.appendChild(modalRoot);
    }
    if (!dropdownRoot){
      dropdownRoot = document.createElement('div'); dropdownRoot.id = 'gl-account-dropdown-root'; document.body.appendChild(dropdownRoot);
    }
  }

  // Render login modal
  function showLoginModal(){
    ensureRoots();
    modalRoot.innerHTML = '';
    const backdrop = document.createElement('div'); backdrop.className = 'gl-modal-backdrop';
    const card = document.createElement('div'); card.className = 'gl-modal';
    card.innerHTML = `
      <h3 style="margin:0 0 6px 0">Sign in</h3>
      <div class="gl-small" style="margin-bottom:8px">Use your account to access bookings and certificates.</div>
      <label class="gl-small">Email</label>
      <input id="gl_login_email" class="gl-input" type="email" placeholder="you@example.com"/>
      <label class="gl-small">Password</label>
      <input id="gl_login_pwd" class="gl-input" type="password" placeholder="Password"/>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
        <button id="glLoginCancel" class="gl-btn ghost">Cancel</button>
        <button id="glLoginSubmit" class="gl-btn primary">Sign in</button>
      </div>
      <div class="gl-small" style="margin-top:8px">Demo: user@example.com / User@123</div>
    `;
    backdrop.appendChild(card); modalRoot.appendChild(backdrop);

    document.getElementById('glLoginCancel').onclick = ()=> { modalRoot.innerHTML = ''; };
    document.getElementById('glLoginSubmit').onclick = async ()=>{
      const email = (document.getElementById('gl_login_email').value || '').trim().toLowerCase();
      const pwd = (document.getElementById('gl_login_pwd').value || '').trim();
      if (!email || !pwd){ alert('Email and password required'); return; }
      const users = loadUsers();
      const hash = await sha256hex(pwd);
      const u = users.find(x=> x.email === email && x.pwdHash === hash);
      if (!u){ alert('Invalid credentials'); return; }
      // save session (shallow)
      saveSession({ email: u.email, name: u.name });
      modalRoot.innerHTML = '';
      // notify other tabs
      localStorage.setItem('greenloop_auth_event','login-' + Date.now());
      renderAccountUI(); // update dropdown appearance if open
      alert('Signed in as ' + (u.name || u.email));
      auth.signIn(u.email); // notify auth helper
    };
  }

  // Render account dropdown near profile link
  function renderAccountDropdown(anchorEl){
    ensureRoots();
    dropdownRoot.innerHTML = '';
    const session = loadSession();
    if (!session) return;
    const users = loadUsers();
    const user = users.find(u=>u.email===session.email) || { email:session.email, name: session.name || 'User', coins:0, bookings:[], certificates:[] };

    const rect = anchorEl.getBoundingClientRect();
    const dd = document.createElement('div'); dd.className = 'gl-dropdown';
    dd.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    dd.style.left = (rect.right + window.scrollX - 260) + 'px';

    dd.innerHTML = `
      <div style="font-weight:700">${escapeHtml(user.name || user.email)}</div>
      <div class="gl-small">${escapeHtml(user.email)}</div>
      <div style="height:8px"></div>
      <div class="gl-row"><div class="gl-small">Coins</div><div>${Number(user.coins||0)}</div></div>
      <div class="gl-row"><div class="gl-small">Booked slots</div><div>${(user.bookings||[]).length}</div></div>
      <div class="gl-row"><div class="gl-small">Certificates</div><div>${(user.certificates||[]).length}</div></div>
      <div style="height:8px"></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <a class="gl-link" id="gl_view_reports">My reports</a>
        <a class="gl-link" id="gl_view_bookings">View bookings</a>
        <a class="gl-link" id="gl_view_certs">Certificates</a>
        <a class="gl-link" id="gl_logout">Sign out</a>
      </div>
    `;
    dropdownRoot.appendChild(dd);

    // handlers
    document.getElementById('gl_logout').onclick = ()=> {
      clearSession();
      dropdownRoot.innerHTML = '';
      localStorage.setItem('greenloop_auth_event','logout-' + Date.now());
      alert('Signed out');
      auth.signOut(); // notify auth helper
    };
    document.getElementById('gl_view_reports').onclick = ()=> {
      // open my reports on a simple filter view on Home (or admin)
      window.location.href = 'report.html';
    };
    document.getElementById('gl_view_bookings').onclick = ()=> {
      const list = user.bookings || [];
      alert('Booked slots:\\n' + (list.length ? list.map(b => (b.id + ' — ' + b.when)).join('\\n') : 'None'));
    };
    document.getElementById('gl_view_certs').onclick = ()=> {
      const list = user.certificates || [];
      alert('Certificates:\\n' + (list.length ? list.join('\\n') : 'None'));
    };

    // close on outside click
    setTimeout(()=> {
      const closeFn = (e)=>{
        if (!dd.contains(e.target) && e.target !== anchorEl){
          dropdownRoot.innerHTML = '';
          document.removeEventListener('click', closeFn);
        }
      };
      document.addEventListener('click', closeFn);
    }, 50);
  }

  // helper: escape
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Attach to the profile link(s)
  function attachProfileLinks(){
    const anchors = document.querySelectorAll('#profile-link, #profile-link-admin');
    anchors.forEach(a=>{
      a.style.cursor = 'pointer';
      a.addEventListener('click', function(e){
        e.preventDefault();
        const session = loadSession();
        if (session){
          // open dropdown
          renderAccountDropdown(a);
        } else {
          showLoginModal();
        }
      });
    });
  }

  // Render account UI changes (optional e.g. show user initials) — simple today
  function renderAccountUI(){
    const session = loadSession();
    const anchors = document.querySelectorAll('#profile-link, #profile-link-admin');
    anchors.forEach(a=>{
      if (session){
        a.title = (session.name || session.email);
      } else {
        a.title = 'Sign in';
      }
    });
  }

  // Public helpers: create account (for demo) and sign out programmatically
  window.GreenLoopAuth = {
    attachProfileLinks,
    renderAccountUI,
    createUser: async function(email, name, password){
      const users = loadUsers();
      if (users.find(u=>u.email === email)) throw new Error('Already exists');
      const hash = await sha256hex(password);
      users.push({ email, name, pwdHash:hash, coins:0, bookings:[], certificates:[] });
      saveUsers(users);
      return true;
    },
    signOut: function(){ clearSession(); localStorage.setItem('greenloop_auth_event','logout-' + Date.now()); renderAccountUI(); }
  };

  // init on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    attachProfileLinks();
    renderAccountUI();
    // react to cross-tab auth changes
    window.addEventListener('storage', function(e){
      if (e.key === 'greenloop_auth_event'){ renderAccountUI(); }
    });
  });
})();

(function(){
	// simple client-side auth helper (demo only)
	const SIGN_KEY = 'user_signed_in';
	const EMAIL_KEY = 'user_email';

	function emitChange() {
		// notify listeners in the same window (storage event fires only in other windows)
		const detail = { signed: isSignedIn(), email: getUserEmail() };
		window.dispatchEvent(new CustomEvent('auth-changed', { detail }));
	}

	function signIn(email){
		try{
			sessionStorage.setItem(SIGN_KEY, '1');
			sessionStorage.setItem(EMAIL_KEY, String(email || '').toLowerCase());
			// ensure coins exists
			if (localStorage.getItem('coins') === null) localStorage.setItem('coins','0');
		}catch(e){}
		emitChange();
	}

	function signOut(){
		try{
			sessionStorage.removeItem(SIGN_KEY);
			sessionStorage.removeItem(EMAIL_KEY);
		}catch(e){}
		emitChange();
	}

	function isSignedIn(){
		try{ return sessionStorage.getItem(SIGN_KEY) === '1'; }catch(e){ return false; }
	}

	function getUserEmail(){
		try{ return sessionStorage.getItem(EMAIL_KEY) || ''; }catch(e){ return ''; }
	}

	// expose API
	window.auth = { signIn, signOut, isSignedIn, getUserEmail };
})();
