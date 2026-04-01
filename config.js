// ============================================================
//  IntraNet RedCW v3 — Configuración global
//  Edita SOLO este archivo para cambiar credenciales
// ============================================================

const SB_URL = 'https://cuhjrilsecynksohtuyz.supabase.co';
const SB_ANON = 'sb_publishable_AWjrYn_OnpLJ5UTV8jmT3w_Qi8aoCEU';

// Cloudinary — único storage (imágenes, audio, video, docs)
const CLD = {
  cloud : 'dlxy4yl5t',
  preset: 'ml_default'
};

// Páginas internas (rutas reales en el servidor)
const PAGES = {
  login     : 'login.html',
  dashboard : 'dashboard.html',
  chat      : 'chat.html',
  biblioteca: 'biblioteca.html',
  upload    : 'upload.html',
  perfil    : 'perfil.html',
  admin     : 'admin.html',
  encuestas : 'encuestas.html',
  llamadas  : 'llamadas.html',
};

// Roles
const CAN_UPLOAD = ['admin', 'editor'];
const CAN_ADMIN  = ['admin'];
const CAN_POLL   = ['admin', 'moderador'];

// ── Supabase client ───────────────────────────────────────────
// CRÍTICO: detectSessionInUrl:false evita el bucle infinito al recargar
const sb = supabase.createClient(SB_URL, SB_ANON, {
  auth: {
    persistSession    : true,
    autoRefreshToken  : true,
    detectSessionInUrl: false,
    storageKey        : 'redcw_session'
  },
  realtime: { params: { eventsPerSecond: 10 } }
});

// ── Auth guard: llama esto al inicio de cada página protegida ─
// Retorna { user, perfil } o redirige a login
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = PAGES.login;
    return null;
  }
  const { data: perfil } = await sb.from('perfiles')
    .select('*').eq('id', session.user.id).single();
  if (!perfil || perfil.activo === false) {
    await sb.auth.signOut();
    window.location.href = PAGES.login;
    return null;
  }
  return { user: session.user, perfil };
}

// ── Helpers ───────────────────────────────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function avatarSrc(url, n, a) {
  if (url && (url.startsWith('http') || url.startsWith('data'))) return url;
  const i  = ((n||'?')[0] + (a||'')[0]).toUpperCase();
  const bg = ['#1a5cad','#1e7e34','#c47a00','#8e44ad','#c0392b'];
  const c  = bg[(i.charCodeAt(0) + (i.charCodeAt(1)||0)) % bg.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
     <rect width="40" height="40" rx="20" fill="${c}"/>
     <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle"
           fill="white" font-size="15" font-family="sans-serif" font-weight="700">${i}</text></svg>`
  )}`;
}

function fmtFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es',{day:'2-digit',month:'short',year:'numeric'});
}
function fmtHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
}
function fmtSize(b) {
  if (!b) return '0 B';
  if (b >= 1048576) return (b/1048576).toFixed(1)+' MB';
  if (b >= 1024)    return Math.round(b/1024)+' KB';
  return b+' B';
}
function extCarpeta(ext) {
  const m = {
    png:'imagenes',jpg:'imagenes',jpeg:'imagenes',gif:'imagenes',webp:'imagenes',
    mp3:'musica',wav:'musica',ogg:'musica',m4a:'musica',aac:'musica',flac:'musica',
    mp4:'videos',webm:'videos',
    pdf:'documentos',doc:'documentos',docx:'documentos',
    xls:'documentos',xlsx:'documentos',ppt:'documentos',pptx:'documentos',txt:'documentos',
    zip:'comprimidos',rar:'comprimidos'
  };
  return m[(ext||'').toLowerCase()] || 'otros';
}
function extIcon(ext) {
  const e = (ext||'').toLowerCase();
  const m = {
    pdf:'fi pdf fa-file-pdf',doc:'fi doc fa-file-word',docx:'fi doc fa-file-word',
    xls:'fi xls fa-file-excel',xlsx:'fi xls fa-file-excel',
    ppt:'fi ppt fa-file-powerpoint',pptx:'fi ppt fa-file-powerpoint',
    png:'fi img fa-file-image',jpg:'fi img fa-file-image',jpeg:'fi img fa-file-image',
    gif:'fi img fa-file-image',webp:'fi img fa-file-image',
    mp3:'fi audio fa-file-audio',wav:'fi audio fa-file-audio',ogg:'fi audio fa-file-audio',
    m4a:'fi audio fa-file-audio',aac:'fi audio fa-file-audio',
    mp4:'fi video fa-file-video',webm:'fi video fa-file-video',
    zip:'fi zip fa-file-zipper',rar:'fi zip fa-file-zipper',txt:'fi txt fa-file-lines'
  };
  const v = m[e] || 'fi other fa-file';
  const p = v.split(' ');
  return `<i class="fa-solid ${p[2]} ${p[0]} ${p[1]}"></i>`;
}

function toast(msg, tipo='info') {
  let w = document.getElementById('toasts');
  if (!w) { w = document.createElement('div'); w.id='toasts'; document.body.appendChild(w); }
  const t   = document.createElement('div');
  t.className = `toast-msg toast-${tipo}`;
  const ico = tipo==='ok'?'circle-check':tipo==='err'?'circle-xmark':'circle-info';
  t.innerHTML = `<i class="fa-solid fa-${ico}"></i> ${esc(msg)}`;
  w.appendChild(t);
  setTimeout(()=>t.classList.add('vis'),10);
  setTimeout(()=>{t.classList.remove('vis');setTimeout(()=>t.remove(),400);},3500);
}

// ── Tema ──────────────────────────────────────────────────────
function applyTema(t) {
  const h   = document.documentElement;
  const ico = document.getElementById('icoTema');
  if (t==='light')     { h.setAttribute('data-theme','light');  if(ico) ico.className='fa-solid fa-sun'; }
  else if (t==='dark') { h.setAttribute('data-theme','dark');   if(ico) ico.className='fa-solid fa-moon'; }
  else                 { h.removeAttribute('data-theme');        if(ico) ico.className='fa-solid fa-circle-half-stroke'; }
  localStorage.setItem('redcw_tema', t);
}
function toggleTema() {
  const cur = document.documentElement.getAttribute('data-theme') || 'system';
  const next = cur==='system'?'light':cur==='light'?'dark':'system';
  applyTema(next);
  // Guardar en BD en background
  sb.auth.getSession().then(({data:{session}})=>{
    if (session) sb.from('perfiles').update({tema:next}).eq('id',session.user.id).then(()=>{});
  });
}
window.toggleTema = toggleTema;

// Aplicar tema guardado inmediatamente (llamar antes del render)
(function(){
  const t = localStorage.getItem('redcw_tema')||'system';
  const h = document.documentElement;
  if (t==='light') h.setAttribute('data-theme','light');
  else if (t==='dark') h.setAttribute('data-theme','dark');
})();

// ── Logout ────────────────────────────────────────────────────
async function doLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  await sb.auth.signOut();
  window.location.href = PAGES.login;
}
window.doLogout = doLogout;

// ── Cloudinary upload (todos los tipos) ───────────────────────
function cldResourceType(ext) {
  if (['png','jpg','jpeg','gif','webp'].includes(ext)) return 'image';
  if (['mp4','webm','mov','avi'].includes(ext))        return 'video';
  return 'raw'; // audio, docs, zips
}
async function uploadToCloudinary(file, folder) {
  const ext   = file.name.split('.').pop().toLowerCase();
  const rtype = cldResourceType(ext);
  const fd    = new FormData();
  fd.append('file',          file);
  fd.append('upload_preset', CLD.preset);
  fd.append('folder',        `intranet-redcw/${folder}`);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLD.cloud}/${rtype}/upload`,
    { method:'POST', body:fd }
  );
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return { publicId: d.public_id, resourceType: rtype, secureUrl: d.secure_url };
}
function cldPublicUrl(publicId, resourceType) {
  const base = `https://res.cloudinary.com/${CLD.cloud}`;
  if (resourceType==='image') return `${base}/image/upload/w_800,q_auto,f_auto/${publicId}`;
  if (resourceType==='video') return `${base}/video/upload/q_auto/${publicId}`;
  return `${base}/raw/upload/${publicId}`;
}
function cldAvatarUrl(publicId) {
  return `https://res.cloudinary.com/${CLD.cloud}/image/upload/w_200,h_200,c_fill,g_face,r_max,q_auto,f_auto/${publicId}`;
}

// ── Navbar render (compartido por todas las páginas) ──────────
async function renderNav(perfil, paginaActual) {
  const ava = avatarSrc(perfil.avatar_url, perfil.nombre, perfil.apellido);
  const nom = `${perfil.nombre} ${perfil.apellido}`;

  const navLinks = [
    { p:'dashboard',  href:PAGES.dashboard,  icon:'fa-gauge-high',       label:'Dashboard' },
    { p:'chat',       href:PAGES.chat,        icon:'fa-comments',         label:'Chat' },
    { p:'biblioteca', href:PAGES.biblioteca,  icon:'fa-folder-open',      label:'Biblioteca' },
    { p:'encuestas',  href:PAGES.encuestas,   icon:'fa-chart-bar',        label:'Encuestas' },
    { p:'llamadas',   href:PAGES.llamadas,    icon:'fa-phone-volume',      label:'Llamadas' },
    ...(CAN_UPLOAD.includes(perfil.rol) ? [{ p:'upload', href:PAGES.upload, icon:'fa-cloud-arrow-up', label:'Subir' }] : []),
    ...(CAN_ADMIN.includes(perfil.rol)  ? [{ p:'admin',  href:PAGES.admin,  icon:'fa-shield-halved',  label:'Admin' }] : []),
  ];

  const linksHTML = navLinks.map(l => `
    <a class="nav-link ${paginaActual===l.p?'active':''}" href="${l.href}">
      <i class="fa-solid ${l.icon}"></i>${l.label}
    </a>`).join('');

  const hambHTML = navLinks.map(l => `
    <a class="nav-link d-block" href="${l.href}">
      <i class="fa-solid ${l.icon} me-2"></i>${l.label}
    </a>`).join('');

  document.getElementById('appNav').innerHTML = `
  <div class="ctn px-3">
    <div class="d-flex ai-center gap-2" style="height:50px">
      <a href="${PAGES.dashboard}" class="d-flex ai-center gap-2 me-3" style="text-decoration:none">
        <div class="brand-icon"><i class="fa-solid fa-building-columns"></i></div>
        <span class="brand-name">IntraNet RedCW</span>
      </a>
      <div class="d-flex ai-center gap-1" id="navDesktop">${linksHTML}</div>
      <div class="d-flex ai-center gap-2 ms-auto">
        <button onclick="toggleTema()" title="Tema" style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.88rem">
          <i id="icoTema" class="fa-solid fa-circle-half-stroke"></i>
        </button>
        <div style="position:relative" id="chipWrap">
          <button onclick="toggleChip()" style="display:inline-flex;align-items:center;gap:.45rem;background:#1e3d6e;border:1px solid rgba(255,255,255,.2);border-radius:22px;padding:.25rem .6rem .25rem .25rem;cursor:pointer;color:#dce8f5;font-family:inherit">
            <img src="${esc(ava)}" width="32" height="32" alt="" style="width:32px;height:32px;max-width:32px;max-height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.2)">
            <div style="line-height:1.25;text-align:left">
              <div style="font-size:.75rem;font-weight:600;color:#dce8f5;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis">${esc(nom)}</div>
              <div style="font-size:.61rem;color:#7a9ab8">${esc(perfil.rol)}</div>
            </div>
            <i class="fa-solid fa-chevron-down" id="chipArrow" style="font-size:.57rem;color:#4d6a84;transition:transform .2s;margin-left:.1rem"></i>
          </button>
          <div id="chipMenu" style="display:none;position:absolute;right:0;top:calc(100% + .4rem);background:#fff;border:1px solid rgba(26,92,173,.18);border-radius:14px;min-width:270px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.18);z-index:9998">
            <div style="display:flex;align-items:flex-start;gap:.8rem;padding:.85rem 1rem;background:linear-gradient(135deg,#152b47,#1a2744);border-bottom:1px solid rgba(74,127,193,.2)">
              <img src="${esc(ava)}" width="44" height="44" alt="" style="width:44px;height:44px;max-width:44px;max-height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.18)">
              <div style="min-width:0;flex:1">
                <div style="font-weight:700;font-size:.88rem;color:#dce8f5;overflow:hidden;text-overflow:ellipsis">${esc(nom)}</div>
                <span class="rol-badge rol-${esc(perfil.rol)}" style="margin-top:.3rem;display:inline-block">${esc(perfil.rol)}</span>
              </div>
            </div>
            <a href="${PAGES.perfil}" class="chip-row"><i class="fa-solid fa-circle-user" style="color:#1a5cad;width:15px;text-align:center"></i>Mi Perfil &amp; Avatar</a>
            <a href="#" onclick="doLogout();return false" class="chip-row chip-logout"><i class="fa-solid fa-right-from-bracket" style="color:#c0392b;width:15px;text-align:center"></i>Cerrar sesión</a>
          </div>
        </div>
        <button onclick="toggleHamb()" id="btnHamb" style="width:34px;height:34px;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;display:none;align-items:center;justify-content:center;font-size:.95rem"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
    <div id="hambMenu" style="display:none;padding:.4rem 0;border-top:1px solid rgba(255,255,255,.07)">${hambHTML}</div>
  </div>`;

  // Aplicar tema correcto al icono
  const tGuardado = localStorage.getItem('redcw_tema')||perfil.tema||'system';
  applyTema(tGuardado);

  document.addEventListener('click', e => {
    if (!e.target.closest('#chipWrap')) closeChip();
    if (!e.target.closest('#appNav'))   closeHamb();
  });
}

function toggleChip(){ const m=document.getElementById('chipMenu'); const open=m.style.display!=='none'; m.style.display=open?'none':'block'; document.getElementById('chipArrow').style.transform=open?'rotate(0)':'rotate(180deg)'; }
function closeChip() { const m=document.getElementById('chipMenu'); if(m) m.style.display='none'; const a=document.getElementById('chipArrow'); if(a) a.style.transform='rotate(0)'; }
function toggleHamb(){ const m=document.getElementById('hambMenu'); m.style.display=m.style.display==='none'?'block':'none'; }
function closeHamb() { const m=document.getElementById('hambMenu'); if(m) m.style.display='none'; }
