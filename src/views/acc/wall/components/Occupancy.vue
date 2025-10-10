
<template>
  <div>
    <div class="panel-title">占用/容量监控</div>
    <div ref="refEl" class="chart"></div>
    <div class="legend">
      <span>实时在场人数</span>
      <span>30min 预测</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{ filters: Record<string, any> }>();
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;

function seriesData(){
  const base = 4000;
  const actual = Array.from({length: 24}, (_,i)=> Math.round(base + Math.sin(i/3)*800 + Math.random()*200));
  const forecast = actual.map((v,i)=> Math.round(v + (i>18? (i-18)*80 : 0)));
  return { actual, forecast };
}
function init(){
  if(!refEl.value) return;
  const { actual, forecast } = seriesData();
  chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip:{ trigger:'axis' },
    grid:{ top:24, left:28, right:12, bottom:24 },
    xAxis:{ type:'category', data:Array.from({length:24}, (_,i)=>`${i}:00`) },
    yAxis:{ type:'value' },
    series:[
      { type:'line', name:'实时在场', areaStyle:{}, smooth:true, data: actual },
      { type:'line', name:'预测', areaStyle:{}, smooth:true, data: forecast },
    ]
  });
}
function load(){ chart?.setOption({}); }
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; }
.chart{ height: 240px; }
.legend{ display:flex; gap:16px; font-size:12px; opacity:.85; margin-top:8px; }
</style>
