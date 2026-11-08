// Trophies — persisted in localStorage.
const KEY = 'son64:trophies';
export function unlock(id, title, desc){
  const bag = load();
  if(bag[id]) return false;
  bag[id] = { title, desc, at: Date.now() };
  save(bag);
  showPopup(title, desc);
  return true;
}
export function list(){ return Object.entries(load()).map(([id,v]) => ({id, ...v})); }
export function has(id){ return !!load()[id]; }
function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function save(b){ localStorage.setItem(KEY, JSON.stringify(b)); }

function showPopup(title, desc){
  const d = document.createElement('div');
  d.style.cssText = `position:fixed;right:24px;bottom:24px;z-index:100;max-width:320px;padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,#1a2a52,#0a1230);border:1px solid rgba(180,220,255,.35);box-shadow:0 20px 50px rgba(0,0,0,.6),0 0 40px rgba(95,212,255,.2);color:#e8f2ff;font:500 13px/1.35 system-ui,sans-serif;transform:translateY(20px);opacity:0;transition:all .35s cubic-bezier(.22,1,.36,1)`;
  d.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center">
      <div style="width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 30% 20%,#fff5c8,#f0a830);display:grid;place-items:center;color:#5c3800;font-weight:800">★</div>
      <div><div style="font-size:10px;letter-spacing:3px;color:#9ab6d9;text-transform:uppercase;margin-bottom:2px">Trophy unlocked</div>
      <div style="font-weight:700">${title}</div>
      <div style="font-size:11px;color:#9ab6d9;margin-top:2px">${desc}</div></div>
    </div>`;
  document.body.appendChild(d);
  requestAnimationFrame(() => { d.style.transform='translateY(0)'; d.style.opacity='1'; });
  setTimeout(() => { d.style.opacity='0'; d.style.transform='translateY(20px)'; }, 3600);
  setTimeout(() => d.remove(), 4100);
}
