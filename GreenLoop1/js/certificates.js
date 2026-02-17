(function(){
  const KEY = 'greenloop_certificates_v1';

  function loadCerts(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){return[]} }
  function saveCerts(list){ try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){} }

  function genId(){
    const d = new Date();
    return `CERT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;
  }

  // draw a simple certificate on canvas and return dataURL
  function drawCertificate(name, course){
    const w = 1200, h = 800;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');

    // background
    const g = ctx.createLinearGradient(0,0,w, h);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#f3fff4');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // border
    ctx.strokeStyle = '#d9f0dd';
    ctx.lineWidth = 16;
    ctx.strokeRect(16,16,w-32,h-32);

    // Title
    ctx.fillStyle = '#0f5132';
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', w/2, 160);

    // Subtitle
    ctx.fillStyle = '#264d36';
    ctx.font = '22px sans-serif';
    ctx.fillText(`This certifies that`, w/2, 230);

    // Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillText(name || 'Learner', w/2, 320);

    // Course
    ctx.fillStyle = '#374151';
    ctx.font = '20px sans-serif';
    ctx.fillText(`has successfully completed the course`, w/2, 370);
    ctx.font = '28px serif';
    ctx.fillText(course || 'Basic Waste Management', w/2, 420);

    // Date and ID
    const date = new Date().toLocaleDateString();
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Date: ${date}`, w/2, 520);

    // small logo (if present)
    const img = new Image();
    img.src = 'logo.png';
    // draw logo synchronously if cached; otherwise draw when loaded
    if (img.complete) {
      ctx.drawImage(img, w - 220, h - 160, 160, 80);
      return c.toDataURL('image/png');
    } else {
      // return a Promise if image not loaded yet
      return new Promise((res)=>{
        img.onload = function(){ ctx.drawImage(img, w - 220, h - 160, 160, 80); res(c.toDataURL('image/png')); };
        img.onerror = function(){ res(c.toDataURL('image/png')); };
      });
    }
  }

  async function createCertificate(opts){
    const name = opts.name || '';
    const course = opts.course || 'Basic Waste Management';
    const id = genId();
    const date = new Date().toISOString();
    const data = await drawCertificate(name, course);
    const entry = { id, name, course, date, dataUrl: data };
    const list = loadCerts();
    list.unshift(entry);
    saveCerts(list);
    // go to certificates page to view/download
    window.location.href = 'certificates.html';
  }

  // Wire button if present
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('getCertBtn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      // default name from auth or prompt
      const email = (sessionStorage.getItem('user_email') || '').trim();
      let name = sessionStorage.getItem('user_fullname') || '';
      if (!name) {
        // try to use email's local-part as name if available
        name = email ? email.split('@')[0].replace(/[._-]/g,' ') : '';
      }
      // ask for confirmation / allow editing
      const input = prompt('Enter name for certificate:', name || '');
      if (input === null) return; // cancelled
      const course = 'Basics of Waste Management';
      createCertificate({ name: input.trim() || 'Learner', course });
    });
  });

  // Expose for other pages if needed
  window.GreenLoopCertificates = { createCertificate, loadCerts, saveCerts };
})();
