    // improved dropdown + account menu handling
    document.addEventListener('DOMContentLoaded', function() {
      // Courses dropdown (preserve existing behavior)
      const coursesLink = document.getElementById('courses-link');
      const dropdownMenu = document.getElementById('dropdown-menu');
      if (coursesLink && dropdownMenu) {
        coursesLink.addEventListener('click', function(e) {
          e.preventDefault();
          dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', function(e){
          if (!coursesLink.contains(e.target) && !dropdownMenu.contains(e.target)){
            dropdownMenu.style.display = 'none';
          }
        });
      }

      // Account dropdown
      const toggle = document.getElementById('profile-toggle');
      const menu = document.getElementById('accountMenu');
      const menuCoins = document.getElementById('menuCoins');
      const menuUserEmail = document.getElementById('menuUserEmail');
      const accountMenuList = document.getElementById('accountMenuList');
      const accountLabel = document.getElementById('accountLabel');

      function isSignedIn(){ return sessionStorage.getItem('user_signed_in') === '1'; }
      function getUserEmail(){ return sessionStorage.getItem('user_email') || 'Guest'; }
      function updateMenuCoins(){
        const coins = Number(localStorage.getItem('coins') || 0);
        menuCoins.textContent = coins;
      }

      function renderMenuItems(){
        const signed = isSignedIn();
        accountMenuList.innerHTML = '';
        if (!signed){
          accountLabel.textContent = 'Not signed in';
          menuUserEmail.textContent = 'Guest';
          accountMenuList.innerHTML = `
            <li style="margin:6px 0"><a href="loginpage.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f172a;font-weight:600">Sign in</a></li>
            <li style="margin:6px 0"><a href="report.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f172a;font-weight:600">Report an issue</a></li>
            <li style="margin:6px 0"><a href="Home.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f172a;font-weight:600">Continue as guest</a></li>
          `;
          return;
        }

        accountLabel.textContent = 'Signed in as';
        menuUserEmail.textContent = getUserEmail();

        accountMenuList.innerHTML = `
          <li style="margin:6px 0"><a href="coins.html" style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;text-decoration:none;color:#0f1720;font-weight:600">View Coins <span style="color:#6b7280">⇢</span></a></li>
          <li style="margin:6px 0"><a href="user_reports.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f1720;font-weight:600">My Reports</a></li>
          <li style="margin:6px 0"><a href="bookings.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f1720;font-weight:600">Booked Slots</a></li>
          <li style="margin:6px 0"><a href="my_feedbacks.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f1720;font-weight:600">My Feedbacks</a></li>
          <li style="margin:6px 0"><a href="certificates.html" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#0f1720;font-weight:600">Certificates</a></li>
          <li style="margin:6px 0"><a href="#" id="menuLogout" style="display:block;padding:8px;border-radius:8px;text-decoration:none;color:#ef4444;font-weight:700">Logout</a></li>
        `;

        // wire logout
        const logoutLink = document.getElementById('menuLogout');
        if (logoutLink){
          logoutLink.addEventListener('click', function(e){
            e.preventDefault();
            try{
              sessionStorage.removeItem('user_signed_in');
              sessionStorage.removeItem('user_email');
            }catch(err){}
            closeMenu();
            // optionally redirect to login
            window.location.href = 'loginpage.html';
          });
        }
      }

      function openMenu(){
        if (!menu) return;
        menu.classList.remove('hidden');
        menu.setAttribute('aria-hidden','false');
        toggle.setAttribute('aria-expanded','true');
        updateMenuCoins();
        renderMenuItems();
      }
      function closeMenu(){
        if (!menu) return;
        menu.classList.add('hidden');
        menu.setAttribute('aria-hidden','true');
        toggle.setAttribute('aria-expanded','false');
      }

      // toggle behavior
      if (toggle){
        toggle.addEventListener('click', function(e){
          e.preventDefault();
          if (menu.classList.contains('hidden')) openMenu(); else closeMenu();
          e.stopPropagation();
        });
      }

      // close on outside click
      document.addEventListener('click', function(e){
        if (!menu) return;
        if (!menu.contains(e.target) && e.target !== toggle) closeMenu();
      });

      // keyboard close (Esc)
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closeMenu();
      });

      // update coins and menu when storage changes (other tabs)
      window.addEventListener('storage', function(e){
        if (!e.key || e.key === 'coins') updateMenuCoins();
        if (!e.key || e.key === 'user_signed_in' || e.key === 'user_email') renderMenuItems();
      });

      // initial
      updateMenuCoins();
      renderMenuItems();
    });

    // Add browser navigation support for forward/back
    window.addEventListener('popstate', function() {
      location.reload();
    });
    (function(){
      const RKEY = 'greenloop_reports_v1';
      const FKEY = 'greenloop_feedbacks_v1';
      const lastId = sessionStorage.getItem('my_last_report_id');
      if (!lastId) return;

      function loadReports(){ try{ return JSON.parse(localStorage.getItem(RKEY)||'[]'); }catch(e){return[]} }
      function saveFeedback(f){ try{ const list = JSON.parse(localStorage.getItem(FKEY)||'[]'); list.unshift(f); localStorage.setItem(FKEY, JSON.stringify(list)); }catch(e){} }

      function findReport(id){
        const list = loadReports();
        return list.find(r=>r.id === id);
      }

      function updateReportFlag(id){
        try{
          const list = loadReports();
          const idx = list.findIndex(r=>r.id===id);
          if (idx >= 0){ list[idx].feedbackGiven = true; localStorage.setItem(RKEY, JSON.stringify(list)); }
        }catch(e){}
      }

      function showBanner(report){
        const b = document.getElementById('reportFeedbackBanner');
        if (!b) return;
        b.style.display = 'block';
        document.getElementById('rbTitle').textContent = `Report ${report.id} completed`;
        document.getElementById('rbInfo').textContent = 'Your report was marked resolved. Tell us how it went.';
      }

      function hideBanner(){ document.getElementById('reportFeedbackBanner').style.display = 'none'; }

      function tryShow(){
        const r = findReport(lastId);
        if (!r) return;
        if (r.status === 'Resolved' && !r.feedbackGiven){
          showBanner(r);
        }
      }

      // wire buttons
      document.getElementById('fbCancel').addEventListener('click', hideBanner);
      document.getElementById('fbSend').addEventListener('click', function(){
        const name = document.getElementById('fbName').value.trim();
        const msg = document.getElementById('fbMsg').value.trim();
        if (!msg){ alert('Please enter feedback.'); return; }
        const f = { reportId: lastId, name: name || 'Anonymous', message: msg, createdAt: new Date().toISOString() };
        saveFeedback(f);
        updateReportFlag(lastId);
        hideBanner();
        alert('Thanks for your feedback!');
      });

      // listen for storage changes (admin resolves in another tab)
      window.addEventListener('storage', function(e){
        if (!e.key || e.key === RKEY) tryShow();
      });

      // initial check
      tryShow();
    })();