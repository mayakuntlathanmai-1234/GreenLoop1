function getLocation() {
  const loc = document.getElementById('location');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      loc.value = `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
    }, () => {
      loc.value = "Location access denied.";
    });
  } else {
    loc.value = "Geolocation not supported.";
  }
}

function updateCoinDisplay() {
  const coins = Number(localStorage.getItem('coins') || 0);
  document.getElementById('coin-value').textContent = coins;
}

document.addEventListener('DOMContentLoaded', function() {
  updateCoinDisplay();

  document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Show custom dialog
    showThankYouDialog();
  });

  // Dropdown for coin info
  const coinCounter = document.getElementById('coin-counter');
  coinCounter.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleCoinDropdown();
  });

  document.addEventListener('click', function() {
    hideCoinDropdown();
  });

  window.getLocation = getLocation;
});

// Custom dialog logic
function showThankYouDialog() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'custom-dialog-overlay';

  // Create dialog box
  const dialog = document.createElement('div');
  dialog.className = 'custom-dialog-box';
  dialog.innerHTML = `
    <div class="custom-dialog-content">
      <div class="custom-dialog-icon">✅</div>
      <div class="custom-dialog-title">Thank you!</div>
      <div class="custom-dialog-message">Your report has been submitted.<br>1 coin added to your account.</div>
      <button class="custom-dialog-btn" id="customDialogOk">OK</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById('customDialogOk').onclick = function() {
    // Add 1 coin
    let coins = Number(localStorage.getItem('coins') || 0);
    coins += 1;
    localStorage.setItem('coins', coins);
    updateCoinDisplay();

    // Remove dialog
    document.body.removeChild(overlay);

    // Redirect to Home.html
    window.location.href = 'Home.html';
  };
}

function toggleCoinDropdown() {
  let dropdown = document.getElementById('coin-dropdown');
  if (dropdown) {
    dropdown.remove();
    return;
  }
  const coins = Number(localStorage.getItem('coins') || 0);

  dropdown = document.createElement('div');
  dropdown.id = 'coin-dropdown';
  dropdown.className = 'coin-dropdown-menu';

  let html = '';
  for (let c = 0; c <= 100; c += 20) {
    const rupees = (c * 0.1).toFixed(2);
    html += `
      <div class="coin-dropdown-row${c === coins ? ' coin-current' : ''}">
        <span>${c} coins</span>
        <span>= ₹${rupees}</span>
      </div>
    `;
  }
  // If user's coins > 100, show their value at the end
  if (coins > 100) {
    html += `
      <div class="coin-dropdown-row coin-current">
        <span>${coins} coins</span>
        <span>= ₹${(coins * 0.1).toFixed(2)}</span>
      </div>
    `;
  }

  dropdown.innerHTML = html;

  // Position dropdown below coin counter
  const counter = document.getElementById('coin-counter');
  counter.appendChild(dropdown);
}

function hideCoinDropdown() {
  const dropdown = document.getElementById('coin-dropdown');
  if (dropdown) dropdown.remove();
}

(function(){
	const KEY = 'greenloop_reports_v1';

	function genId(){
		const d = new Date();
		const y = d.getFullYear();
		const m = String(d.getMonth()+1).padStart(2,'0');
		const day = String(d.getDate()).padStart(2,'0');
		const t = String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0') + String(d.getSeconds()).padStart(2,'0');
		return `REP-${y}${m}${day}-${t}-${Math.floor(Math.random()*900+100)}`;
	}

	function load(){
		try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; }
	}
	function save(list){
		try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
		// storage event fired on other tabs automatically
	}

	function showSuccess(id){
		const el = document.getElementById('successMsg');
		if (!el) return;
		el.style.display = 'block';
		el.querySelector('.alert').innerHTML = `✅ Thank you! Your report has been submitted. ID: <strong>${id}</strong>`;
		// keep ID in session so Home.html can show feedback prompt later
		try{ sessionStorage.setItem('my_last_report_id', id); }catch(e){}
	}

	// file input to base64 optional (preview not required)
	document.addEventListener('DOMContentLoaded', function(){
		const form = document.getElementById('reportForm');
		if (!form) return;

		form.addEventListener('submit', async function(e){
			e.preventDefault();
			const wasteType = form.querySelector('select').value;
			const photoInput = document.getElementById('photo');
			const location = document.getElementById('location').value || '';
			const desc = form.querySelector('textarea').value || '';

			let photoData = '';
			if (photoInput && photoInput.files && photoInput.files[0]){
				// try to store small preview as data URL (optional)
				const file = photoInput.files[0];
				try{
					photoData = await (new Promise((res, rej)=>{
						const r = new FileReader();
						r.onload = ()=> res(r.result);
						r.onerror = rej;
						r.readAsDataURL(file);
					}));
				}catch(err){ photoData = ''; }
			}

			const id = genId();
			const newReport = {
				id,
				wasteType,
				location,
				desc,
				photo: photoData,
				status: 'Pending',
				createdAt: new Date().toISOString(),
				feedbackGiven: false
			};

			const list = load();
			list.unshift(newReport);
			save(list);
			showSuccess(id);
			form.reset();
		});
	});
})();
