
<template>
  <div class="wall">
    <NeoBackground />
    <div class="wall-header">
      <div class="title">门禁态势大屏</div>
      <div class="clock">{{ now }}</div>
    </div>

    <TickerBar />
    <div class="wall-grid">
      <div class="cell kpi">
        <KpiCards :filters="filters" />
        <div style="margin-top:12px;"><KpiGauges /></div>
      </div>
      <div class="cell heat">
        <HeatmapPanel :filters="filters" />
      </div>
      <div class="cell pie">
        <ReasonPie :filters="filters" />
      </div>
      <div class="cell occ">
        <Occupancy :filters="filters" />
      </div>
      <div class="cell timeline">
        <AlarmTimeline :filters="filters" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, onBeforeUnmount, ref } from 'vue';
import KpiCards from './components/KpiCards.vue';
import HeatmapPanel from './components/HeatmapPanel.vue';
import ReasonPie from './components/ReasonPie.vue';
import AlarmTimeline from './components/AlarmTimeline.vue';
import Occupancy from './components/Occupancy.vue';
import TickerBar from './components/TickerBar.vue';
import KpiGauges from './components/KpiGauges.vue';
import NeoBackground from './components/NeoBackground.vue';

const filters = reactive<Record<string, any>>({});
const now = ref('');

let timer:any;
function tick(){
  const d = new Date();
  const pad = (n:number)=> String(n).padStart(2,'0');
  now.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
onMounted(()=>{ tick(); timer = setInterval(tick, 1000); });
onBeforeUnmount(()=> clearInterval(timer));
</script>

<style scoped>
.wall{ height:100vh; width:100vw; overflow:hidden; padding:16px; background: radial-gradient(1600px 800px at 80% -20%, rgba(0,229,255,0.08), transparent 70%), #0b0f1a; color:#f8fbff; position:relative; z-index:1; }
.wall-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.title{ font-size:24px; font-weight:700; letter-spacing:1px; color:#f8fbff; }
.clock{ font-size:16px; opacity:.95; color:#e6f7ff; }
.wall-grid{
  display:grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 240px 300px 1fr;
  gap:12px;
}
.cell{ background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03)); border-radius:12px; padding:8px; backdrop-filter: blur(10px); border:1px solid rgba(255,255,255,0.12); }
.kpi{ grid-column: 1 / span 2; }
.heat{ grid-row: 2; }
.pie{ grid-row: 2; }
.occ{ grid-row: 3; }
.timeline{ grid-row: 3; }
</style>
