// Signature boot sequence that plays on first visit to a console per session.
// Entirely original visuals; no copyrighted logos or branding.
import { audio } from './shared.js';

const SEEN = sessionStorage;
const key = id => `son64:booted:${id}`;

export function playIfFresh(id, style){
  if(SEEN.getItem(key(id))) return Promise.resolve();
  SEEN.setItem(key(id), '1');
  return play(id, style);
}

export function play(id, style){
  return new Promise(res => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;inset:0;z-index:200;background:#000;display:grid;place-items:center;overflow:hidden;cursor:pointer`;
    const c = document.createElement('canvas');
    c.style.cssText = `position:absolute;inset:0;width:100%;height:100%`;
    c.width = innerWidth; c.height = innerHeight;
    el.appendChild(c);
    document.body.appendChild(el);
    const ctx = c.getContext('2d');
    const dur = style.dur || 2600;
    const t0 = performance.now();
    let raf;
    const skip = () => { cancelAnimationFrame(raf); el.style.transition='opacity .35s'; el.style.opacity='0'; setTimeout(()=>{ el.remove(); res(); }, 360); };
    el.addEventListener('click', skip);
    el.addEventListener('keydown', skip);
    audio.startup();
    function frame(now){
      const t = (now - t0) / dur;
      if(t >= 1){ skip(); return; }
      style.draw(ctx, c.width, c.height, t);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    // auto-dismiss at full duration
    setTimeout(skip, dur + 120);
  });
}

// Shared drawing primitives — each console passes a draw(t) for its signature.
export const styles = {
  // Son 1 — CRT power-up: single horizontal scan line opens vertically
  son1: {
    dur: 1800,
    draw(c,w,h,t){
      c.fillStyle='#000'; c.fillRect(0,0,w,h);
      const openT = Math.min(1, t*1.4);
      const half = h*.5 * Math.pow(openT, .7);
      // scanline glow at the edges
      const gradTop = c.createLinearGradient(0,h*.5-half,0,h*.5);
      gradTop.addColorStop(0,'rgba(0,0,0,1)'); gradTop.addColorStop(1,'rgba(10,30,50,1)');
      c.fillStyle = gradTop; c.fillRect(0,h*.5-half,w,half);
      const gradBot = c.createLinearGradient(0,h*.5,0,h*.5+half);
      gradBot.addColorStop(0,'rgba(10,30,50,1)'); gradBot.addColorStop(1,'rgba(0,0,0,1)');
      c.fillStyle = gradBot; c.fillRect(0,h*.5,w,half);
      // bright center scanline
      if(openT < .95){
        const beamA = (1-openT)*.9+.1;
        c.fillStyle = `rgba(200,240,255,${beamA})`;
        c.fillRect(0,h*.5-1,w,2);
      }
      // text fades in
      if(t > .4){
        const a = Math.min(1, (t-.4)/.4);
        c.fillStyle = `rgba(200,240,255,${a})`;
        c.textAlign='center'; c.font = `300 ${Math.min(w*.04,28)}px system-ui`;
        c.fillText('S  O  N     1', w/2, h/2 + 8);
        // scanlines
        c.fillStyle = `rgba(0,0,0,${a*.4})`;
        for(let y=0;y<h;y+=3) c.fillRect(0,y,w,1);
      }
    }
  },
  // Son 2 — ink drops / cubes assemble
  son2: {
    dur: 2200,
    draw(c,w,h,t){
      c.fillStyle='#030820'; c.fillRect(0,0,w,h);
      // central glow blooms
      const r = Math.pow(t, .5) * Math.max(w,h) * .6;
      const g = c.createRadialGradient(w/2,h/2,0,w/2,h/2,r);
      g.addColorStop(0,`rgba(80,160,255,${.4*(1-t)+.1})`);
      g.addColorStop(1,'rgba(3,8,32,0)');
      c.fillStyle=g; c.fillRect(0,0,w,h);
      // orbiting cubes
      const N = 14, a = t*Math.PI*2;
      for(let i=0;i<N;i++){
        const ang = a + i*(Math.PI*2/N);
        const dist = (1-Math.pow(1-t,2))* Math.min(w,h) * .3;
        const px = w/2 + Math.cos(ang)*dist;
        const py = h/2 + Math.sin(ang)*dist;
        const s = 8 + 6*Math.sin(t*6 + i);
        c.save(); c.translate(px,py); c.rotate(ang);
        c.strokeStyle=`rgba(180,220,255,${.3+t*.6})`; c.lineWidth=1.3;
        c.strokeRect(-s/2,-s/2,s,s); c.strokeRect(-s/2+3,-s/2+3,s,s);
        c.restore();
      }
      if(t > .6){
        const a2 = Math.min(1, (t-.6)/.3);
        c.fillStyle=`rgba(230,240,255,${a2})`; c.textAlign='center'; c.font=`300 ${Math.min(w*.045,34)}px system-ui`;
        c.fillText('S O N   2', w/2, h/2+8);
      }
    }
  },
  // Son Portable — bars sweep
  sonp: {
    dur: 2000,
    draw(c,w,h,t){
      c.fillStyle='#0e1a2b'; c.fillRect(0,0,w,h);
      const N = 36;
      for(let i=0;i<N;i++){
        const x = (i/N)*w;
        const d = Math.max(0, 1 - Math.abs((i/N) - t)*2.2);
        c.fillStyle = `rgba(140,220,255,${.1 + d*.6})`;
        c.fillRect(x,0,w/N*.8,h);
      }
      if(t > .5){
        const a = Math.min(1, (t-.5)/.4);
        c.fillStyle = `rgba(230,240,255,${a})`;
        c.textAlign='center'; c.font=`300 ${Math.min(w*.045,30)}px system-ui`;
        c.fillText('S O N   P O R T A B L E', w/2, h/2+8);
      }
    }
  },
  // Son 3 — the wave rises
  son3: {
    dur: 2600,
    draw(c,w,h,t){
      const g = c.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#021425'); g.addColorStop(1,'#000208');
      c.fillStyle=g; c.fillRect(0,0,w,h);
      for(let layer=0; layer<4; layer++){
        c.beginPath();
        for(let px=-10; px<=w+10; px+=5){
          const y = h*.6 + Math.sin(px*.012 + t*6 + layer)*30*(1-Math.pow(1-t,2))
                  + Math.sin(px*.003 - t*4)*50*(1-Math.pow(1-t,2))
                  + layer*20;
          if(px===-10) c.moveTo(px,y); else c.lineTo(px,y);
        }
        c.lineTo(w+10,h); c.lineTo(-10,h); c.closePath();
        c.fillStyle = `rgba(80,160,230,${(.18 - layer*.034)*t})`;
        c.fill();
      }
      if(t > .4){
        const a = Math.min(1,(t-.4)/.4);
        c.fillStyle=`rgba(230,240,255,${a})`; c.textAlign='center'; c.font=`200 ${Math.min(w*.05,42)}px system-ui`;
        c.fillText('S O N   3', w/2, h*.48);
      }
    }
  },
  // Son Vita — bubbles rise
  sonv: {
    dur: 2000,
    draw(c,w,h,t){
      const g = c.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#1a0d3a'); g.addColorStop(1,'#060214');
      c.fillStyle=g; c.fillRect(0,0,w,h);
      const cols = ['#ff6cc1','#ffd36b','#6bd1ff','#b0ff8b','#c38bff','#66ffe4'];
      for(let i=0;i<24;i++){
        const px = (i*73)%w;
        const py = h - h*t*(.6 + (i%5)*.1) + Math.sin(t*6 + i)*16;
        const r = 10 + (i%4)*4;
        c.fillStyle = cols[i%cols.length] + '88';
        c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(255,255,255,.3)'; c.stroke();
      }
      if(t > .5){
        const a = Math.min(1, (t-.5)/.4);
        c.fillStyle=`rgba(255,240,250,${a})`; c.textAlign='center'; c.font=`300 ${Math.min(w*.05,34)}px system-ui`;
        c.fillText('S O N   V I T A', w/2, h/2);
      }
    }
  },
  // Son 4 — angled blue sweep
  son4: {
    dur: 2200,
    draw(c,w,h,t){
      const k = (Math.sin(t*4)+1)/2;
      const g = c.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#000208'); g.addColorStop(.5,`rgba(${30+k*30},${80+k*50},${200-k*40},1)`); g.addColorStop(1,'#000208');
      c.fillStyle=g; c.fillRect(0,0,w,h);
      // sweep
      c.strokeStyle='rgba(180,220,255,.15)'; c.lineWidth=1;
      for(let i=0;i<30;i++){
        const off = ((i/30)*w*1.5 + t*w)%w;
        c.beginPath(); c.moveTo(off,0); c.lineTo(off-80,h); c.stroke();
      }
      if(t > .4){
        const a = Math.min(1,(t-.4)/.4);
        c.fillStyle=`rgba(240,250,255,${a})`; c.textAlign='center'; c.font=`700 ${Math.min(w*.07,54)}px system-ui`;
        c.fillText('SON 4', w/2, h/2+10);
      }
    }
  },
  // Son 5 — particle burst to sheen
  son5: {
    dur: 2800,
    draw(c,w,h,t){
      c.fillStyle='#000'; c.fillRect(0,0,w,h);
      const g = c.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*(.3+t*.6));
      g.addColorStop(0,'#0a1230'); g.addColorStop(1,'#000106');
      c.fillStyle=g; c.fillRect(0,0,w,h);
      for(let i=0;i<180;i++){
        const ang = (i/180)*Math.PI*2;
        const r = Math.pow(t,.6) * Math.min(w,h)*.5 + Math.sin(i*1.3 + t*10)*8;
        const px = w/2 + Math.cos(ang)*r;
        const py = h/2 + Math.sin(ang)*r;
        const a = (1-t)*.8 + .2;
        c.fillStyle=`rgba(180,220,255,${a})`;
        c.beginPath(); c.arc(px,py,.6+Math.abs(Math.sin(i))*1.6,0,Math.PI*2); c.fill();
      }
      // sheen band
      const sw = w*.3, sx = t*(w+sw*2)-sw;
      const sg = c.createLinearGradient(sx,0,sx+sw,0);
      sg.addColorStop(0,'transparent'); sg.addColorStop(.5,'rgba(255,255,255,.08)'); sg.addColorStop(1,'transparent');
      c.fillStyle=sg; c.fillRect(sx,0,sw,h);
      if(t > .55){
        const a = Math.min(1,(t-.55)/.3);
        c.fillStyle=`rgba(255,255,255,${a})`; c.textAlign='center'; c.font=`800 ${Math.min(w*.07,56)}px system-ui`;
        c.fillText('SON 5', w/2, h/2+10);
      }
    }
  }
};
