
<template>
  <div>
    <div class="panel-title">时段通行热力</div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{ filters: Record<string, any> }>();
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;

function genHeatmapMock(){
  const arr: [number, number, number][] = [];
  for(let h=0; h<24; h++) for(let d=0; d<7; d++) arr.push([h, d, Math.round(Math.random()*200)]);
  return arr;
}

function init(){
  if(!refEl.value) return;
  chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip: { trigger:'item' },
    grid: { top: 24, left: 28, right: 12, bottom: 28 },
    xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`) },
    yAxis: { type: 'category', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    visualMap: { min: 0, max: 200, calculable: true, orient: 'horizontal', left: 'center', bottom: 0,
      inRange:{ color:['#001529','#003a8c','#096dd9','#40a9ff','#69c0ff','#e6f7ff'] } },
    series: [{ type: 'heatmap', data: genHeatmapMock(), progressive: 1e5 }],
  });
}
function load(){
  chart?.setOption({ series:[{ data: genHeatmapMock() }] });
}
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.chart{ height: 280px; width:100%; }
</style>
