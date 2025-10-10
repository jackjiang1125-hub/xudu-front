
<template>
  <canvas ref="cv" class="neo-bg"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const cv = ref<HTMLCanvasElement|null>(null);
let raf = 0;
let ctx: CanvasRenderingContext2D | null = null;
let w = 0, h = 0;
let pts: {x:number,y:number,vx:number,vy:number,r:number}[] = [];

function resize(){
  if(!cv.value) return;
  w = cv.value.width  = window.innerWidth;
  h = cv.value.height = window.innerHeight;
  pts = Array.from({length: 120}, ()=> ({
    x: Math.random()*w, y: Math.random()*h,
    vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6,
    r: Math.random()*1.8+0.4,
  }));
}

function loop(){
  if(!cv.value || !ctx) return;
  ctx.clearRect(0,0,w,h);
  // subtle gradient glow
  const g = ctx.createRadialGradient(w*0.8, -h*0.2, 0, w*0.8, -h*0.2, Math.max(w,h));
  g.addColorStop(0, 'rgba(0,229,255,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // particles
  pts.forEach(p=>{
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>w) p.vx*=-1;
    if(p.y<0||p.y>h) p.vy*=-1;
  });
  // links
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const a = pts[i], b = pts[j];
      const dx=a.x-b.x, dy=a.y-b.y; const d=Math.hypot(dx,dy);
      if(d<120){
        const alpha = 0.12*(1-d/120);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  // dots
  pts.forEach(p=>{
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });

  raf = requestAnimationFrame(loop);
}

onMounted(()=>{
  if(!cv.value) return;
  ctx = cv.value.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  loop();
});
onBeforeUnmount(()=>{
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', resize);
});
</script>

<style scoped>
.neo-bg{
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
