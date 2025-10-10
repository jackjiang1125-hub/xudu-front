
<template>
  <div>
    <div class="panel-title">
      校园/楼宇态势地图
      <span class="legend">
        <i class="dot open"></i>开
        <i class="dot close"></i>关
        <i class="dot locked"></i>常闭/锁
        <i class="dot alarm"></i>告警/胁迫
      </span>
    </div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';
import { defHttp } from '/@/utils/http/axios';

type GatePoint = {
  gateId: string;
  gateName: string;
  x: number; // 0-100
  y: number; // 0-100
  state: 'OPEN'|'CLOSE'|'LOCKED'|'ALARM'|'DURESS';
  crowdIdx?: number;
};

const props = defineProps<{ filters: Record<string, any> }>();
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;
let points: GatePoint[] = [];

function groupByState(list: GatePoint[]){
  const grp: Record<string, GatePoint[]> = { OPEN:[], CLOSE:[], LOCKED:[], ALARM:[], DURESS:[] };
  list.forEach(p=> (grp[p.state] || (grp[p.state]=[])).push(p));
  return grp;
}

function toSeries(name:string, data: GatePoint[], symbol:string, ripple=false){
  const series: any = ripple ? {
    type:'effectScatter', rippleEffect:{ scale: 2.2, brushType: 'stroke' }, showEffectOn:'render',
    symbol, symbolSize: 16, zlevel: 2,
    data: data.map(d=>({ name: d.gateName, value:[d.x, d.y, d.crowdIdx ?? 0], gate:d })),
    tooltip:{ formatter:(p:any)=> `${p.data.gate.gateName}<br/>状态：${p.data.gate.state}` }
  } : {
    type:'scatter', symbol, symbolSize: 14, zlevel: 1,
    data: data.map(d=>({ name: d.gateName, value:[d.x, d.y, d.crowdIdx ?? 0], gate:d })),
    tooltip:{ formatter:(p:any)=> `${p.data.gate.gateName}<br/>状态：${p.data.gate.state}` }
  };
  series.name = name;
  return series;
}

function render(){
  if(!chart || !refEl.value) return;
  const grp = groupByState(points);
  chart.setOption({
    tooltip: { trigger:'item' },
    xAxis: { type:'value', show:false, min:0, max:100 },
    yAxis: { type:'value', show:false, min:0, max:100 },
    grid: { left:0, right:0, top:0, bottom:0 },
    series: [
      toSeries('CLOSE', grp.CLOSE, 'rect'),
      toSeries('LOCKED', grp.LOCKED, 'diamond'),
      toSeries('OPEN', grp.OPEN, 'circle'),
      toSeries('ALARM', grp.ALARM, 'pin', true),
      toSeries('DURESS', grp.DURESS, 'triangle', true),
    ],
    // State color mapping
    color: ['#9aa5b1','#7C4DFF','#00D48A','#FF4D4F','#ff7875'],
  });
}

function fallbackMock(): GatePoint[]{
  // 生成一些随机点位
  const ids = Array.from({length: 24}, (_,i)=> `G-${i+1}`);
  return ids.map((id, i)=> ({
    gateId: id,
    gateName: `门点-${i+1}`,
    x: Math.round(Math.random()*100),
    y: Math.round(Math.random()*100),
    state: (['OPEN','CLOSE','LOCKED','ALARM','DURESS'])[Math.floor(Math.random()*5)] as any,
    crowdIdx: Math.random(),
  }));
}

async function load(){
  try{
    // 真实接口: x,y 为 0-100 相对坐标（或改为地图经纬度+geo）
    // points = await defHttp.get({ url:'/api/acc/map/gates', params: props.filters });
    points = fallbackMock();
  }catch(e){
    points = fallbackMock();
  }
  render();
}

onMounted(()=>{
  if(!refEl.value) return;
  chart = echarts.init(refEl.value, 'dark');
  load();
  window.addEventListener('resize', ()=> chart && chart.resize());
});
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; display:flex; align-items:center; gap:12px; }
.legend{ font-size:12px; opacity:.85; display:flex; gap:10px; align-items:center; }
.legend .dot{ display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:4px; }
.legend .dot.open{ background:#00d48a; }
.legend .dot.close{ background:#9aa5b1; }
.legend .dot.locked{ background:#7C4DFF; }
.legend .dot.alarm{ background:#ff4d4f; }
.chart{ height: 320px; width:100%; border-radius:12px; overflow:hidden; }
</style>
