// ============================================================
//  IntraNet RedCW — Configuración global
//  Edita solo este archivo para cambiar credenciales
// ============================================================

const SB_URL  = 'https://cuhjrilsecynksohtuyz.supabase.co';
const SB_ANON = 'sb_publishable_AWjrYn_OnpLJ5UTV8jmT3w_Qi8aoCEU';

// Cloudinary — usado para TODOS los archivos (imágenes, audio, video, docs)
const CLD = {
  cloud : 'dlxy4yl5t',
  preset: 'ml_default'   // Upload preset sin firmar (unsigned)
};

// Roles con permisos
const CAN_UPLOAD = ['admin', 'editor'];
const CAN_ADMIN  = ['admin'];
const CAN_POLL   = ['admin', 'moderador'];

// ── Inicializar Supabase ──────────────────────────────────────
const sb = supabase.createClient(SB_URL, SB_ANON, {
  auth: {
    persistSession  : true,
    autoRefreshToken: true,
    detectSessionInUrl: false   // ← evita bucle infinito al recargar
  },
  realtime: { params: { eventsPerSecond: 10 } }
});

// ── Estado global compartido ──────────────────────────────────
let AUTH  = null;   // supabase session.user
let ME    = null;   // fila de perfiles

// ── Helpers universales ───────────────────────────────────────
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function avatarSrc(url, n, a) {
  if (url && (url.startsWith('http') || url.startsWith('data'))) return url;
  const i = ((n || '?')[0] + (a || '')[0]).toUpperCase();
  const bg = ['#1a5cad','#1e7e34','#c47a00','#8e44ad','#c0392b'];
  const c  = bg[(i.charCodeAt(0) + (i.charCodeAt(1) || 0)) % bg.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
     <rect width="40" height="40" rx="20" fill="${c}"/>
     <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle"
           fill="white" font-size="15" font-family="sans-serif" font-weight="700">${i}</text></svg>`
  )}`;
}

function fmtFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
}
function fmtSize(b) {
  if (!b) return '0 B';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  if (b >= 1024)    return Math.round(b / 1024) + ' KB';
  return b + ' B';
}

function extCarpeta(ext) {
  const m = {
    png:'imagenes', jpg:'imagenes', jpeg:'imagenes', gif:'imagenes', webp:'imagenes',
    mp3:'musica',  wav:'musica',  ogg:'musica',  m4a:'musica',  aac:'musica',  flac:'musica',
    mp4:'videos',  webm:'videos',
    pdf:'documentos', doc:'documentos', docx:'documentos',
    xls:'documentos', xlsx:'documentos', ppt:'documentos', pptx:'documentos', txt:'documentos',
    zip:'comprimidos', rar:'comprimidos'
  };
  return m[(ext || '').toLowerCase()] || 'otros';
}

function extIcon(ext) {
  const e = (ext || '').toLowerCase();
  const m = {
    pdf:'fi pdf fa-file-pdf', doc:'fi doc fa-file-word', docx:'fi doc fa-file-word',
    xls:'fi xls fa-file-excel', xlsx:'fi xls fa-file-excel',
    ppt:'fi ppt fa-file-powerpoint', pptx:'fi ppt fa-file-powerpoint',
    png:'fi img fa-file-image', jpg:'fi img fa-file-image', jpeg:'fi img fa-file-image',
    gif:'fi img fa-file-image', webp:'fi img fa-file-image',
    mp3:'fi audio fa-file-audio', wav:'fi audio fa-file-audio', ogg:'fi audio fa-file-audio',
    m4a:'fi audio fa-file-audio', aac:'fi audio fa-file-audio',
    mp4:'fi video fa-file-video', webm:'fi video fa-file-video',
    zip:'fi zip fa-file-zipper', rar:'fi zip fa-file-zipper',
    txt:'fi txt fa-file-lines'
  };
  const v = m[e] || 'fi other fa-file';
  const parts = v.split(' ');
  return `<i class="fa-solid ${parts[2]} ${parts[0]} ${parts[1]}"></i>`;
}

function toast(msg, tipo = 'info') {
  const w = document.getElementById('toasts');
  if (!w) return;
  const t = document.createElement('div');
  t.className = `toast-msg toast-${tipo}`;
  const ico = tipo === 'ok' ? 'circle-check' : tipo === 'err' ? 'circle-xmark' : 'circle-info';
  t.innerHTML = `<i class="fa-solid fa-${ico}"></i> ${esc(msg)}`;
  w.appendChild(t);
  setTimeout(() => t.classList.add('vis'), 10);
  setTimeout(() => { t.classList.remove('vis'); setTimeout(() => t.remove(), 400); }, 3500);
}

// ── Tema ──────────────────────────────────────────────────────
function applyTema(t) {
  const h   = document.documentElement;
  const ico = document.getElementById('icoTema');
  if      (t === 'light')  { h.setAttribute('data-theme','light');  if (ico) ico.className = 'fa-solid fa-sun'; }
  else if (t === 'dark')   { h.setAttribute('data-theme','dark');   if (ico) ico.className = 'fa-solid fa-moon'; }
  else                     { h.removeAttribute('data-theme');        if (ico) ico.className = 'fa-solid fa-circle-half-stroke'; }
  localStorage.setItem('redcw_tema', t);
  if (ME) sb.from('perfiles').update({ tema: t }).eq('id', ME.id).then(() => {});
}
function toggleTema() {
  const cur = document.documentElement.getAttribute('data-theme') || 'system';
  applyTema(cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system');
}
window.setTema    = applyTema;
window.toggleTema = toggleTema;

// ── Upload a Cloudinary (TODO tipo de archivo) ────────────────
// resource_type: 'image' | 'video' | 'raw'
function cldResourceType(ext) {
  const img  = ['png','jpg','jpeg','gif','webp'];
  const vid  = ['mp4','webm','mov','avi'];
  if (img.includes(ext)) return 'image';
  if (vid.includes(ext)) return 'video';
  return 'raw';          // audio, docs, zips, etc.
}

async function uploadToCloudinary(file, folder) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const rtype = cldResourceType(ext);
  const fd   = new FormData();
  fd.append('file',           file);
  fd.append('upload_preset',  CLD.preset);
  fd.append('folder',         `intranet-redcw/${folder}`);

  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${CLD.cloud}/${rtype}/upload`,
    { method: 'POST', body: fd }
  );
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return { publicId: d.public_id, resourceType: rtype, secureUrl: d.secure_url };
}

// Genera URL de acceso público según tipo
function cldPublicUrl(publicId, resourceType) {
  const base = `https://res.cloudinary.com/${CLD.cloud}`;
  if (resourceType === 'image') {
    return `${base}/image/upload/w_800,q_auto,f_auto/${publicId}`;
  }
  if (resourceType === 'video') {
    return `${base}/video/upload/q_auto/${publicId}`;
  }
  // raw (audio, docs, etc.) — URL directa sin transformaciones
  return `${base}/raw/upload/${publicId}`;
}

function cldAvatarUrl(publicId) {
  return `https://res.cloudinary.com/${CLD.cloud}/image/upload/w_200,h_200,c_fill,g_face,r_max,q_auto,f_auto/${publicId}`;
}
