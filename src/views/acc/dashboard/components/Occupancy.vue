
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
      { type:'line', name:'实时在场', areaStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(0,229,255,.35)'},{offset:1,color:'rgba(0,0,0,0)'}] } }, smooth:true, data: actual, lineStyle:{ width:2 } },
      { type:'line', name:'预测', areaStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(124,77,255,.35)'},{offset:1,color:'rgba(0,0,0,0)'}] } }, smooth:true, data: forecast, lineStyle:{ width:2 } },
    ],
    graphic:[{ type:'text', left:10, top:10, style:{ text:'Occupancy', fill:'#e6f7ff', font:'12px sans-serif' } }]
  });
}
function load(){ chart?.setOption({}); }
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.chart{ height: 240px; }
.legend{ display:flex; gap:16px; font-size:12px; opacity:.9; margin-top:8px; color:#f8fbff; }
</style>
