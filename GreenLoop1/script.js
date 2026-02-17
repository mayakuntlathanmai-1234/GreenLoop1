(function(){
	const STORAGE_KEY = 'greenloop_admin_profile_v1';

	const elements = {
		avatarInput: document.getElementById('avatarInput'),
		avatarPreview: document.getElementById('avatarPreview'),
		removeAvatar: document.getElementById('removeAvatar'),
		profileForm: document.getElementById('profileForm'),
		name: document.getElementById('name'),
		email: document.getElementById('email'),
		role: document.getElementById('role'),
		bio: document.getElementById('bio'),
		saveBtn: document.getElementById('saveBtn'),
		resetBtn: document.getElementById('resetBtn'),
		lastSaved: document.getElementById('lastSaved'),
		pwdModal: document.getElementById('pwdModal'),
		changePwdBtn: document.getElementById('changePwdBtn'),
		cancelPwd: document.getElementById('cancelPwd'),
		pwdForm: document.getElementById('pwdForm'),
		newPwd: document.getElementById('newPwd'),
		confirmPwd: document.getElementById('confirmPwd')
	};

	function defaultProfile(){
		return {
			name: 'Admin User',
			email: 'admin@example.com',
			role: 'Super Admin',
			bio: '',
			avatarDataUrl: '' // data URL
		};
	}

	function loadProfile(){
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultProfile();
		try { return JSON.parse(raw); } catch(e){ return defaultProfile(); }
	}

	function saveProfile(profile){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
		const ts = new Date().toLocaleString();
		elements.lastSaved.textContent = ts;
	}

	function populate(profile){
		elements.name.value = profile.name || '';
		elements.email.value = profile.email || '';
		elements.role.value = profile.role || 'Admin';
		elements.bio.value = profile.bio || '';
		if (profile.avatarDataUrl){
			elements.avatarPreview.src = profile.avatarDataUrl;
		} else {
			elements.avatarPreview.src = 'assets/default-avatar.png';
		}
	}

	// init
	const profile = loadProfile();
	populate(profile);
	const saved = localStorage.getItem(STORAGE_KEY + '_saved_at');
	if (saved) elements.lastSaved.textContent = saved;

	// avatar upload preview
	elements.avatarInput.addEventListener('change', function(){
		const file = this.files && this.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function(ev){
			elements.avatarPreview.src = ev.target.result;
		};
		reader.readAsDataURL(file);
	});

	// remove avatar
	elements.removeAvatar.addEventListener('click', function(){
		elements.avatarPreview.src = 'assets/default-avatar.png';
		// clear file input
		elements.avatarInput.value = '';
	});

	// save
	elements.profileForm.addEventListener('submit', function(e){
		e.preventDefault();
		// If avatar input has a file, read it; otherwise keep existing preview image
		function commit(profileData){
			saveProfile(profileData);
			localStorage.setItem(STORAGE_KEY + '_saved_at', new Date().toLocaleString());
			alert('Profile saved (local demo).');
		}

		const p = loadProfile();
		p.name = elements.name.value.trim();
		p.email = elements.email.value.trim();
		p.role = elements.role.value;
		p.bio = elements.bio.value.trim();

		const file = elements.avatarInput.files && elements.avatarInput.files[0];
		if (file){
			const reader = new FileReader();
			reader.onload = function(ev){
				p.avatarDataUrl = ev.target.result;
				populate(p);
				commit(p);
			};
			reader.readAsDataURL(file);
		} else {
			// if preview is default, clear avatarDataUrl
			if (elements.avatarPreview.src.endsWith('default-avatar.png')) p.avatarDataUrl = '';
			commit(p);
		}
	});

	// reset to stored profile
	elements.resetBtn.addEventListener('click', function(){
		const p = loadProfile();
		populate(p);
		elements.avatarInput.value = '';
	});

	// password modal
	elements.changePwdBtn.addEventListener('click', function(){
		elements.pwdModal.classList.remove('hidden');
		elements.pwdModal.setAttribute('aria-hidden', 'false');
		elements.newPwd.focus();
	});

	elements.cancelPwd.addEventListener('click', function(){
		elements.pwdModal.classList.add('hidden');
		elements.pwdModal.setAttribute('aria-hidden', 'true');
		elements.pwdForm.reset();
	});

	elements.pwdForm.addEventListener('submit', function(e){
		e.preventDefault();
		if (elements.newPwd.value !== elements.confirmPwd.value){
			alert('Passwords do not match.');
			return;
		}
		// Demo: do not store real passwords. Show success and close modal.
		alert('Password updated (demo only).');
		elements.pwdModal.classList.add('hidden');
		elements.pwdModal.setAttribute('aria-hidden', 'true');
		elements.pwdForm.reset();
	});

	// keyboard: close modal on ESC
	document.addEventListener('keydown', function(e){
		if (e.key === 'Escape' && !elements.pwdModal.classList.contains('hidden')){
			elements.cancelPwd.click();
		}
	});
})();
