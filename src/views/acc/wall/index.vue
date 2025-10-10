<template>
  <div class="wall">
    <div class="wall-header">
      <div class="title">门禁态势大屏</div>
      <div class="clock">{{ now }}</div>
    </div>

    <div class="wall-grid">
      <div class="cell kpi">
        <KpiCards :filters="filters" />
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
import { kpiMock, heatmapMock, reasonMock, occupancyMock, alarmMock } from './mock';

const filters = reactive({
  kpi: kpiMock,
  heatmap: heatmapMock,
  reasons: reasonMock,
  occupancy: occupancyMock,
  alarms: alarmMock,
});

const now = ref('');
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  now.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.wall {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  padding: 16px;
  background: radial-gradient(1600px 800px at 80% -20%, rgba(0, 229, 255, 0.18), transparent 70%), #0b0f1a;
  color: #f7fbff;
}
.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
}
.clock {
  font-size: 16px;
  color: #d9ecff;
  font-family: 'Roboto Condensed', sans-serif;
}
.wall-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 240px 300px 1fr;
  gap: 14px;
}
.cell {
  background: rgba(18, 26, 48, 0.82);
  border-radius: 16px;
  padding: 12px;
  backdrop-filter: blur(14px);
  border: 1px solid rgba(0, 229, 255, 0.12);
  box-shadow: 0 12px 24px rgba(0, 229, 255, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}
.kpi {
  grid-column: 1 / span 2;
}
.heat {
  grid-row: 2;
}
.pie {
  grid-row: 2;
}
.occ {
  grid-row: 3;
}
.timeline {
  grid-row: 3;
}
</style>