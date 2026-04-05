// ============================================================
//  IntraNet RedCW v3 — Configuración global
// ============================================================

const SB_URL = 'https://cuhjrilsecynksohtuyz.supabase.co';
const SB_ANON = 'sb_publishable_AWjrYn_OnpLJ5UTV8jmT3w_Qi8aoCEU';

// Cloudinary — único storage (imágenes, audio, video, docs)
const CLD = {
  cloud : 'dlxy4yl5t',
  preset: 'ml_default'
};

const PAGES = {
  login     : 'login.html',
  dashboard : 'dashboard.html',
  loginre: 'pages/login.html',
  dashboardre:'pages/dashboard.html',
  chat      : 'chat.html',
  biblioteca: 'biblioteca.html',
  upload    : 'upload.html',
  perfil    : 'perfil.html',
  admin     : 'admin.html',
  encuestas : 'encuestas.html',
  llamadas  : 'llamadas.html',
};

const CAN_UPLOAD = ['admin', 'editor'];
const CAN_ADMIN  = ['admin'];
const CAN_POLL   = ['admin', 'moderador'];

const sb = supabase.createClient(SB_URL, SB_ANON, {
  auth: {
    persistSession    : true,
    autoRefreshToken  : true,
    detectSessionInUrl: false,
    storageKey        : 'redcw_session'
  },
  realtime: { params: { eventsPerSecond: 10 } }
});

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = PAGES.login; return null; }
  const { data: perfil } = await sb.from('perfiles').select('*').eq('id', session.user.id).single();
  if (!perfil || perfil.activo === false) {
    await sb.auth.signOut();
    window.location.href = PAGES.login;
    return null;
  }
  return { user: session.user, perfil };
}

// ── Helpers ───────────────────────────────────────────────────
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

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

function fmtFecha(iso) { if (!iso) return ''; return new Date(iso).toLocaleDateString('es',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtHora(iso)  { if (!iso) return ''; return new Date(iso).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}); }
function fmtSize(b)    { if(!b) return '0 B'; if(b>=1048576) return (b/1048576).toFixed(1)+' MB'; if(b>=1024) return Math.round(b/1024)+' KB'; return b+' B'; }
function fmtDur(s)     { s=s||0; return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); }

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
    pdf:'fi pdf fa-file-pdf', doc:'fi doc fa-file-word', docx:'fi doc fa-file-word',
    xls:'fi xls fa-file-excel', xlsx:'fi xls fa-file-excel',
    ppt:'fi ppt fa-file-powerpoint', pptx:'fi ppt fa-file-powerpoint',
    png:'fi img fa-file-image', jpg:'fi img fa-file-image', jpeg:'fi img fa-file-image',
    gif:'fi img fa-file-image', webp:'fi img fa-file-image',
    mp3:'fi audio fa-file-audio', wav:'fi audio fa-file-audio', ogg:'fi audio fa-file-audio',
    m4a:'fi audio fa-file-audio', aac:'fi audio fa-file-audio',
    mp4:'fi video fa-file-video', webm:'fi video fa-file-video',
    zip:'fi zip fa-file-zipper', rar:'fi zip fa-file-zipper', txt:'fi txt fa-file-lines'
  };
  const v = m[e] || 'fi other fa-file';
  const p = v.split(' ');
  return `<i class="fa-solid ${p[2]} ${p[0]} ${p[1]}"></i>`;
}

function toast(msg, tipo='info') {
  let w = document.getElementById('toasts');
  if (!w) { w = document.createElement('div'); w.id='toasts'; document.body.appendChild(w); }
  const t = document.createElement('div');
  t.className = `toast-msg toast-${tipo}`;
  t.innerHTML = `<i class="fa-solid fa-${tipo==='ok'?'circle-check':tipo==='err'?'circle-xmark':'circle-info'}"></i> ${esc(msg)}`;
  w.appendChild(t);
  setTimeout(() => t.classList.add('vis'), 10);
  setTimeout(() => { t.classList.remove('vis'); setTimeout(() => t.remove(), 400); }, 3500);
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
  sb.auth.getSession().then(({data:{session}}) => {
    if (session) sb.from('perfiles').update({tema:next}).eq('id',session.user.id).then(()=>{});
  });
}
window.toggleTema = toggleTema;
(function(){
  const t = localStorage.getItem('redcw_tema')||'system';
  if (t==='light') document.documentElement.setAttribute('data-theme','light');
  else if (t==='dark') document.documentElement.setAttribute('data-theme','dark');
})();

async function doLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  await sb.auth.signOut();
  window.location.href = PAGES.login;
}
window.doLogout = doLogout;

// ── Cloudinary ────────────────────────────────────────────────
function cldResourceType(ext) {
  if (['png','jpg','jpeg','gif','webp'].includes(ext)) return 'image';
  if (['mp4','webm','mov','avi'].includes(ext))        return 'video';
  return 'raw';
}
async function uploadToCloudinary(file, folder) {
  const ext   = file.name.split('.').pop().toLowerCase();
  const rtype = cldResourceType(ext);
  const fd    = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLD.preset);
  fd.append('folder', `intranet-redcw/${folder}`);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD.cloud}/${rtype}/upload`, { method:'POST', body:fd });
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

// ══════════════════════════════════════════════════════════════
//  REPRODUCTOR GLOBAL (persiste en sessionStorage entre páginas)
// ══════════════════════════════════════════════════════════════
const MP = {
  audio  : new Audio(),
  tracks : [], filtered: [], idx: -1,
  shuffle: false, repeat: false, loaded: false,

  save() {
    try {
      sessionStorage.setItem('mp_tracks', JSON.stringify(this.tracks));
      sessionStorage.setItem('mp_idx',    String(this.idx));
    } catch(e) {}
  },
  restore() {
    try {
      const raw = sessionStorage.getItem('mp_tracks');
      if (!raw) return false;
      const t = JSON.parse(raw);
      if (!t?.length) return false;
      this.tracks   = t;
      this.filtered = t.slice();
      this.idx      = parseInt(sessionStorage.getItem('mp_idx') || '-1');
      this.loaded   = true;
      return true;
    } catch(e) { return false; }
  },

  async fetch() {
    const ref = document.getElementById('mpBtnRef');
    if (ref) ref.querySelector('i').style.animation = 'spin .6s linear infinite';
    try {
      const { data } = await sb.from('archivos')
        .select('id,titulo,url_publica,extension,tamano')
        .eq('activo', true)
        .in('extension', ['mp3','wav','ogg','m4a','aac','flac'])
        .order('titulo', { ascending: true })
        .limit(300);
      this.tracks   = (data||[]).map(r => ({ id:r.id, titulo:r.titulo, url:r.url_publica, ext:r.extension, size:fmtSize(r.tamano) }));
      this.filtered = this.tracks.slice();
      this.loaded   = true;
      this.save();
    } catch(e) { console.warn('MP fetch', e); }
    if (ref) ref.querySelector('i').style.animation = '';
    this.renderList();
    this._updateCount();
    this.syncUI();
  },

  play(i) {
    if (i < 0 || i >= this.filtered.length) return;
    this.idx = i;
    const t  = this.filtered[i];
    this.audio.src = t.url;
    this.audio.load();
    this.audio.play().catch(() => {});
    this._updateBar(t);
    this.save();
    this.renderList();
  },
  next() {
    if (!this.filtered.length) return;
    if (this.repeat)  { this.play(this.idx); return; }
    if (this.shuffle) { this.play(Math.floor(Math.random()*this.filtered.length)); return; }
    this.play((this.idx + 1) % this.filtered.length);
  },
  prev() {
    if (!this.filtered.length) return;
    this.play(this.idx <= 0 ? this.filtered.length - 1 : this.idx - 1);
  },
  filter(q) {
    q = (q||'').toLowerCase().trim();
    this.filtered = q ? this.tracks.filter(t => t.titulo.toLowerCase().includes(q)) : this.tracks.slice();
    this.renderList();
  },

  syncUI() {
    const playing = !this.audio.paused && !this.audio.ended;
    const pp  = document.getElementById('mpBtnPause');
    const pl  = document.getElementById('mpBtnPlay');
    const ico = document.getElementById('mpNavIco');
    if (pp)  pp.style.display  = playing ? 'flex' : 'none';
    if (pl)  pl.style.display  = playing ? 'none' : 'flex';
    if (ico) ico.className     = playing ? 'fa-solid fa-music fa-beat' : 'fa-solid fa-music';
    if (this.idx >= 0 && this.filtered[this.idx]) this._updateBar(this.filtered[this.idx]);
  },

  _updateBar(t) {
    const bar = document.getElementById('mpBar');
    const tit = document.getElementById('mpTitle');
    const ext = document.getElementById('mpExt');
    if (bar) bar.style.display = 'flex';
    if (tit) tit.textContent   = t.titulo;
    if (ext) ext.textContent   = (t.ext||'').toUpperCase() + (t.size ? ' · '+t.size : '');
  },
  _updateCount() {
    const el = document.getElementById('mpCount');
    if (el) el.textContent = this.tracks.length + ' canción(es)';
  },

  renderList() {
    const c = document.getElementById('mpList');
    if (!c) return;
    if (!this.filtered.length) {
      c.innerHTML = `<div style="text-align:center;padding:2rem 1rem;color:var(--text-dim);font-size:.82rem">
        <i class="fa-solid fa-music" style="font-size:1.6rem;display:block;margin-bottom:.5rem;opacity:.4"></i>
        No hay canciones.
      </div>`; return;
    }
    c.innerHTML = this.filtered.map((t, i) => {
      const active  = this.idx === i;
      const playing = active && !this.audio.paused && !this.audio.ended;
      return `<div class="mp-row${active?' mp-active':''}" data-i="${i}" title="${esc(t.titulo)}">
        <div class="mp-ico"><i class="fa-solid ${playing?'fa-volume-high fa-beat':'fa-play'}"></i></div>
        <div class="mp-info">
          <div class="mp-title">${esc(t.titulo)}</div>
          <div class="mp-meta">${esc((t.ext||'').toUpperCase())} · ${esc(t.size)}</div>
        </div>
      </div>`;
    }).join('');
    c.querySelectorAll('.mp-row').forEach(el =>
      el.addEventListener('click', () => MP.play(parseInt(el.dataset.i)))
    );
    // Scroll to active
    const active = c.querySelector('.mp-active');
    if (active) active.scrollIntoView({ block:'nearest' });
  }
};

// Audio events
MP.audio.addEventListener('ended',      () => MP.next());
MP.audio.addEventListener('playing',    () => MP.syncUI());
MP.audio.addEventListener('pause',      () => { if (!MP.audio.ended) MP.syncUI(); });
MP.audio.addEventListener('timeupdate', () => {
  if (!MP.audio.duration) return;
  const pct  = MP.audio.currentTime / MP.audio.duration;
  const prog = document.getElementById('mpProgress');
  const cur  = document.getElementById('mpTimeCur');
  const tot  = document.getElementById('mpTimeTot');
  if (prog) prog.style.width = Math.round(pct*100) + '%';
  if (cur)  cur.textContent  = fmtDur(MP.audio.currentTime);
  if (tot)  tot.textContent  = fmtDur(MP.audio.duration);
});

// Public controls
function mpPause()   { MP.audio.pause(); }
function mpResume()  { MP.audio.play(); }
function mpNext()    { MP.next(); }
function mpPrev()    { MP.prev(); }
function mpSeek(p)   { if (MP.audio.duration) MP.audio.currentTime = MP.audio.duration * p; }
function mpFilter(q) { MP.filter(q); }
function mpRefresh() { try{sessionStorage.removeItem('mp_tracks');}catch(e){} MP.loaded=false; MP.fetch(); }
function mpToggleShuffle() {
  MP.shuffle = !MP.shuffle;
  const b = document.getElementById('mpBtnShu');
  if (b) b.style.color = MP.shuffle ? 'var(--primary-light)' : 'var(--text-dim)';
}
function mpToggleRepeat() {
  MP.repeat = !MP.repeat;
  const b = document.getElementById('mpBtnRep');
  if (b) b.style.color = MP.repeat ? 'var(--primary-light)' : 'var(--text-dim)';
}
// Llamado desde biblioteca para reproducir un track específico
function mpPlayUrl(url, titulo, ext) {
  const ex = MP.tracks.findIndex(t => t.url === url);
  if (ex >= 0) { MP.filtered = MP.tracks.slice(); MP.play(ex); }
  else { MP.tracks.unshift({id:0,titulo,url,ext,size:''}); MP.filtered=MP.tracks.slice(); MP.play(0); }
  openMP();
}

function openMP() {
  const panel = document.getElementById('mpPanel');
  if (!panel) return;
  _positionMpPanel();
  panel.style.display = 'block';
  if (!MP.loaded) MP.fetch();
  else { MP.renderList(); MP._updateCount(); MP.syncUI(); }
}
function closeMP() {
  const p = document.getElementById('mpPanel'); if(p) p.style.display='none';
}
function toggleMP() {
  const p = document.getElementById('mpPanel'); if(!p) return;
  p.style.display === 'none' ? openMP() : closeMP();
}
window.toggleMP = toggleMP;

function _positionMpPanel() {
  const btn   = document.getElementById('mpNavBtn');
  const panel = document.getElementById('mpPanel');
  if (!btn || !panel) return;
  const r = btn.getBoundingClientRect();
  panel.style.top = (r.bottom + 6) + 'px';
  if (window.innerWidth < 420) {
    panel.style.left  = '8px';
    panel.style.right = '8px';
    panel.style.width = 'auto';
  } else {
    panel.style.right = (window.innerWidth - r.right - 4) + 'px';
    panel.style.left  = 'auto';
    panel.style.width = '320px';
  }
}
window.addEventListener('resize', () => {
  if (document.getElementById('mpPanel')?.style.display !== 'none') _positionMpPanel();
});

// ══════════════════════════════════════════════════════════════
//  NAVBAR
// ══════════════════════════════════════════════════════════════
async function renderNav(perfil, paginaActual) {
  const ava = avatarSrc(perfil.avatar_url, perfil.nombre, perfil.apellido);
  const nom = `${perfil.nombre} ${perfil.apellido}`;

  const navLinks = [
    { p:'dashboard',  href:PAGES.dashboard,  icon:'fa-gauge-high',   label:'Dashboard' },
    { p:'chat',       href:PAGES.chat,        icon:'fa-comments',     label:'Chat' },
    { p:'biblioteca', href:PAGES.biblioteca,  icon:'fa-folder-open',  label:'Biblioteca' },
    { p:'encuestas',  href:PAGES.encuestas,   icon:'fa-chart-bar',    label:'Encuestas' },
    { p:'llamadas',   href:PAGES.llamadas,    icon:'fa-phone-volume', label:'Llamadas' },
    { p:'RedCW',   href:"https://redcw.vercel.app/pages-control.html",    icon:'fa-solid fa-building-columns', label:'RedCW' },
 
    ...(CAN_UPLOAD.includes(perfil.rol) ? [{ p:'upload', href:PAGES.upload, icon:'fa-cloud-arrow-up', label:'Subir' }] : []),
    ...(CAN_ADMIN.includes(perfil.rol)  ? [{ p:'admin',  href:PAGES.admin,  icon:'fa-shield-halved', label:'Admin' }] : []),
  ];

  const linksHTML = navLinks.map(l =>
    `<a class="nav-link ${paginaActual===l.p?'active':''}" href="${l.href}"><i class="fa-solid ${l.icon}"></i>${l.label}</a>`
  ).join('');
  const hambHTML = navLinks.map(l =>
    `<a class="nav-link d-block" href="${l.href}"><i class="fa-solid ${l.icon} me-2"></i>${l.label}</a>`
  ).join('');

  document.getElementById('appNav').innerHTML = `
  <div class="ctn px-3">
    <div class="d-flex ai-center gap-2" style="height:50px">
      <a href="${PAGES.dashboard}" class="d-flex ai-center gap-2 me-3" style="text-decoration:none">

        <span class="brand-name">IntraNet RedCW</span>
      </a>
      <div class="d-flex ai-center gap-1" id="navDesktop">${linksHTML}</div>

      <div class="d-flex ai-center gap-2 ms-auto">

        <!-- Tema -->
        <button onclick="toggleTema()" title="Cambiar tema"
          style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.88rem;flex-shrink:0">
          <i id="icoTema" class="fa-solid fa-circle-half-stroke"></i>
        </button>

        <!-- 🎵 Música -->
        <div style="flex-shrink:0" id="mpWrap">
          <button onclick="toggleMP()" id="mpNavBtn" title="Reproductor de música"
            style="width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.88rem">
            <i id="mpNavIco" class="fa-solid fa-music"></i>
          </button>
        </div>

        <!-- Chip usuario -->
        <div style="position:relative;flex-shrink:0" id="chipWrap">
          <button onclick="toggleChip()"
            style="display:inline-flex;align-items:center;gap:.45rem;background:#1e3d6e;border:1px solid rgba(255,255,255,.2);border-radius:22px;padding:.25rem .6rem .25rem .25rem;cursor:pointer;color:#dce8f5;font-family:inherit">
            <img src="${esc(ava)}" width="32" height="32" alt=""
              style="width:32px;height:32px;max-width:32px;max-height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.2)">
            <div style="line-height:1.25;text-align:left">
              <div style="font-size:.75rem;font-weight:600;color:#dce8f5;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis">${esc(nom)}</div>
              <div style="font-size:.61rem;color:#7a9ab8">${esc(perfil.rol)}</div>
            </div>
            <i class="fa-solid fa-chevron-down" id="chipArrow" style="font-size:.57rem;color:#4d6a84;transition:transform .2s;margin-left:.1rem"></i>
          </button>
          <div id="chipMenu" style="display:none;position:absolute;right:0;top:calc(100% + .4rem);background:var(--bg-card);border:1px solid var(--border-accent);border-radius:14px;min-width:270px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.22);z-index:9998">
            <div style="display:flex;align-items:flex-start;gap:.8rem;padding:.85rem 1rem;background:linear-gradient(135deg,#152b47,#1a2744);border-bottom:1px solid rgba(74,127,193,.2)">
              <img src="${esc(ava)}" width="44" height="44" alt=""
                style="width:44px;height:44px;max-width:44px;max-height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.18)">
              <div style="min-width:0;flex:1">
                <div style="font-weight:700;font-size:.88rem;color:#dce8f5;overflow:hidden;text-overflow:ellipsis">${esc(nom)}</div>
                <span class="rol-badge rol-${esc(perfil.rol)}" style="margin-top:.3rem;display:inline-block">${esc(perfil.rol)}</span>
              </div>
            </div>
            <a href="${PAGES.perfil}" class="chip-row"><i class="fa-solid fa-circle-user" style="color:var(--accent);width:15px;text-align:center"></i>Mi Perfil &amp; Avatar</a>
            <a href="#" onclick="doLogout();return false" class="chip-row chip-logout"><i class="fa-solid fa-right-from-bracket" style="color:#c0392b;width:15px;text-align:center"></i>Cerrar sesión</a>
          </div>
        </div>

        <!-- Hamburguesa -->
        <button onclick="toggleHamb()" id="btnHamb"
          style="width:34px;height:34px;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;display:none;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
    <div id="hambMenu" style="display:none;padding:.4rem 0;border-top:1px solid rgba(255,255,255,.07)">${hambHTML}</div>
  </div>

  <!-- Panel del reproductor — fuera del nav para no quedar clippado -->
  <div id="mpPanel" style="display:none;position:fixed;z-index:9997;width:320px;
    background:var(--bg-card);border:1px solid var(--border-accent);border-radius:16px;
    box-shadow:0 16px 48px rgba(0,0,0,.26);overflow:hidden">

    <!-- Header del panel -->
    <div style="display:flex;align-items:center;gap:.6rem;padding:.7rem 1rem;background:var(--bg-nav)">
      <i class="fa-solid fa-headphones" style="color:#4a9fff"></i>
      <span style="font-weight:700;font-size:.88rem;color:#dce8f5">Reproductor</span>
      <a href="${PAGES.biblioteca}?carpeta=musica" onclick="closeMP()"
        style="font-size:.71rem;color:#7a9ab8;text-decoration:none;margin-left:auto">Ver todos</a>
      <button onclick="closeMP()"
        style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:.95rem;line-height:1;padding:0 0 0 .5rem">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Buscador -->
    <div style="padding:.5rem .8rem;border-bottom:1px solid var(--border)">
      <div style="position:relative">
        <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:.65rem;top:50%;transform:translateY(-50%);color:var(--text-dim);font-size:.72rem;pointer-events:none"></i>
        <input id="mpSearch" type="text" placeholder="Buscar canción…" oninput="mpFilter(this.value)"
          style="width:100%;background:var(--bg-card2);border:1px solid var(--border);border-radius:20px;
                 padding:.32rem .8rem .32rem 2rem;font-size:.78rem;color:var(--text-main);outline:none;font-family:inherit">
      </div>
    </div>

    <!-- Barra NOW PLAYING -->
    <div id="mpBar" style="display:none;padding:.65rem 1rem;background:var(--accent-soft);border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:.55rem;margin-bottom:.5rem">
        <button onclick="mpPrev()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:.9rem;padding:2px 4px"><i class="fa-solid fa-backward-step"></i></button>
        <button id="mpBtnPause" onclick="mpPause()"
          style="display:none;width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;font-size:.9rem;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-solid fa-pause"></i>
        </button>
        <button id="mpBtnPlay" onclick="mpResume()"
          style="display:flex;width:34px;height:34px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;font-size:.9rem;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-solid fa-play" style="margin-left:2px"></i>
        </button>
        <button onclick="mpNext()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:.9rem;padding:2px 4px"><i class="fa-solid fa-forward-step"></i></button>
        <div style="flex:1;min-width:0">
          <div id="mpTitle" style="font-size:.82rem;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
          <div id="mpExt" style="font-size:.67rem;color:var(--text-dim)"></div>
        </div>
      </div>
      <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:.28rem;cursor:pointer"
        onclick="mpSeek((event.clientX-this.getBoundingClientRect().left)/this.offsetWidth)">
        <div id="mpProgress" style="height:100%;width:0;background:var(--primary);border-radius:2px;transition:width .4s linear;pointer-events:none"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.63rem;color:var(--text-dim)">
        <span id="mpTimeCur">0:00</span><span id="mpTimeTot">0:00</span>
      </div>
    </div>

    <!-- Lista -->
    <div id="mpList" style="max-height:270px;overflow-y:auto;padding:.2rem 0">
      <div style="text-align:center;padding:2rem;color:var(--text-dim);font-size:.82rem">
        <i class="fa-solid fa-spinner fa-spin me-1"></i>Cargando…
      </div>
    </div>

    <!-- Pie -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:.45rem .9rem;border-top:1px solid var(--border)">
      <span id="mpCount" style="font-size:.68rem;color:var(--text-dim)">— canciones</span>
      <div style="display:flex;gap:.2rem">
        <button onclick="mpRefresh()" id="mpBtnRef" title="Recargar lista"
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:.82rem;padding:3px 6px">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button onclick="mpToggleShuffle()" id="mpBtnShu" title="Aleatorio"
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:.82rem;padding:3px 6px">
          <i class="fa-solid fa-shuffle"></i>
        </button>
        <button onclick="mpToggleRepeat()" id="mpBtnRep" title="Repetir"
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:.82rem;padding:3px 6px">
          <i class="fa-solid fa-repeat"></i>
        </button>
      </div>
    </div>
  </div>`;

  const tGuardado = localStorage.getItem('redcw_tema') || perfil.tema || 'system';
  applyTema(tGuardado);

  document.addEventListener('click', e => {
    if (!e.target.closest('#chipWrap'))                closeChip();
    if (!e.target.closest('#mpWrap') && !e.target.closest('#mpPanel')) closeMP();
    if (!e.target.closest('#appNav'))                  closeHamb();
  });

  if (!MP.loaded) MP.restore();
}

function toggleChip() {
  const m = document.getElementById('chipMenu'); const open = m.style.display !== 'none';
  m.style.display = open ? 'none' : 'block';
  document.getElementById('chipArrow').style.transform = open ? 'rotate(0)' : 'rotate(180deg)';
}
function closeChip() { const m=document.getElementById('chipMenu'); if(m) m.style.display='none'; const a=document.getElementById('chipArrow'); if(a) a.style.transform='rotate(0)'; }
function toggleHamb() { const m=document.getElementById('hambMenu'); m.style.display=m.style.display==='none'?'block':'none'; }
function closeHamb()  { const m=document.getElementById('hambMenu'); if(m) m.style.display='none'; }