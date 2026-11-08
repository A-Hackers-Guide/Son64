// Shared helpers used by every console. Can be inlined when exporting a single console.
export const $ = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => [...r.querySelectorAll(s)];
export const now = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
export function clock(el){ const tick=()=>{ el.textContent = now(); setTimeout(tick, 15000); }; tick(); }
export function toast(msg, ms=1800){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('on'), ms);
}
// Audio engine, synthesized — no sampled copyrighted sounds.
let ACTX=null;
export const audio = {
  muted: localStorage.getItem('son64:muted')==='1',
  ctx(){ if(!ACTX) ACTX = new (window.AudioContext||window.webkitAudioContext)(); if(ACTX.state==='suspended') ACTX.resume(); return ACTX; },
  toneAt(opts){
    if(this.muted) return;
    const c = this.ctx();
    const o = c.createOscillator(); o.type = opts.type||'sine'; o.frequency.value = opts.f||440;
    if(opts.slide) o.frequency.linearRampToValueAtTime(opts.f + opts.slide, c.currentTime+(opts.dur||.2));
    const g = c.createGain(); g.gain.value = 0;
    o.connect(g).connect(c.destination);
    const t = c.currentTime, peak = opts.peak||.12, dur = opts.dur||.2;
    g.gain.linearRampToValueAtTime(peak, t+.005);
    g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    o.start(); o.stop(t+dur+.05);
  },
  tick(){     this.toneAt({f:1600,type:'triangle',dur:.06,peak:.07}); },
  hover(){    this.toneAt({f:900, type:'triangle',dur:.05,peak:.04}); },
  confirm(){  this.toneAt({f:520, type:'sine',    dur:.1, peak:.15, slide:260}); setTimeout(()=>this.toneAt({f:880,type:'sine',dur:.22,peak:.14}),60); },
  back(){     this.toneAt({f:520, type:'sine',    dur:.1, peak:.12, slide:-200}); },
  error(){    this.toneAt({f:220, type:'square',  dur:.28,peak:.1}); },
  startup(){
    if(this.muted) return;
    const c = this.ctx(), t = c.currentTime;
    const o = c.createOscillator(); o.type='sawtooth'; o.frequency.value=70;
    const f = c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=180;
    const g = c.createGain(); g.gain.value=0;
    o.connect(f).connect(g).connect(c.destination);
    g.gain.linearRampToValueAtTime(.2, t+1.0); g.gain.linearRampToValueAtTime(0, t+2.4);
    f.frequency.linearRampToValueAtTime(1600, t+1.8); o.frequency.linearRampToValueAtTime(240, t+1.8);
    o.start(); o.stop(t+2.6);
    setTimeout(()=>{ this.toneAt({f:660,dur:.6,peak:.15}); setTimeout(()=>this.toneAt({f:990,dur:.9,peak:.12}), 120); }, 800);
  },
  toggle(){ this.muted = !this.muted; localStorage.setItem('son64:muted', this.muted?'1':'0'); }
};
// Unlock audio on first gesture
addEventListener('pointerdown', ()=>audio.ctx(), {once:true});
addEventListener('keydown',     ()=>audio.ctx(), {once:true});
// Mute hotkey
addEventListener('keydown', e => { if(e.key==='m'||e.key==='M'){ audio.toggle(); toast(audio.muted?'Muted':'Unmuted'); }});

export function capability(){
  try { return JSON.parse(localStorage.getItem('son64:caps') || '{}'); } catch { return {}; }
}
export function supportsHeavy(){
  const c = capability();
  return (c.cores||2) >= 4 && (c.memory==null || c.memory >= 4) && c.gl && c.gl.ok;
}

// ROM / disc upload. We hold the file in memory only; nothing is uploaded.
export function pickFile(accept='.iso,.bin,.cue,.rom,.img,.pbp,.chd,.zip,.7z'){
  return new Promise(res => {
    const inp = document.createElement('input');
    inp.type='file'; inp.accept = accept;
    inp.onchange = () => res(inp.files[0] || null);
    inp.click();
  });
}
