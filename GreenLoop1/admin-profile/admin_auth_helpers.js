(function(){
	// simple client-side auth helper (demo only)
	const AUTH_KEY = 'greenloop_admin_authenticated';

	function isAdmin(){
		try { return localStorage.getItem(AUTH_KEY) === '1'; } catch(e){ return false; }
	}
	function requireAdmin(redirect = 'admin_login.html'){
		if (!isAdmin()) window.location.href = redirect;
	}
	function logout(noRedirect){
		try{
			localStorage.removeItem(AUTH_KEY);
			sessionStorage.removeItem('admin_pending');
		}catch(e){}
		if (!noRedirect) {
			// default redirect to user login
			window.location.href = 'loginpage.html';
		}
	}

	// expose
	window.adminAuth = { isAdmin, requireAdmin, logout };
})();
