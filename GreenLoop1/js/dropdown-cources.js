  (function(){
      const coursesLink = document.getElementById('courses-link');
      const dropdownMenu = document.getElementById('dropdown-menu');
      if (coursesLink && dropdownMenu) {
        coursesLink.addEventListener('click', function(e){ e.preventDefault(); dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', function(e){ if (!coursesLink.contains(e.target) && !dropdownMenu.contains(e.target)) dropdownMenu.style.display = 'none'; });
      }
    })();