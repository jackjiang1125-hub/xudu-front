
<template>
  <div class="gauges">
    <div ref="g1" class="g"></div>
    <div ref="g2" class="g"></div>
    <div ref="g3" class="g"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';

const g1 = ref<HTMLDivElement|null>(null);
const g2 = ref<HTMLDivElement|null>(null);
const g3 = ref<HTMLDivElement|null>(null);

function makeGauge(title:string, value:number, max:number, unit:string){
  return {
    title: { text:title, left:'center', top:'70%', textStyle:{ color:'#e6f7ff', fontSize:12 } },
    series: [{
      type: 'gauge',
      startAngle: 210, endAngle: -30, min:0, max,
      progress: { show: true, roundCap: true, width: 10 },
      axisLine: { lineStyle: { width: 10, color: [[0.5,'#ff7875'],[0.8,'#ffd666'],[1,'#00fff0']] } },
      axisTick: { show:false }, splitLine:{ show:false }, axisLabel:{ color:'#f8fbff' },
      pointer: { show: true, length: '65%', width: 4 },
      anchor: { show: true, showAbove: true, size: 8, itemStyle: { color: '#fff' } },
      detail: { valueAnimation: true, formatter: (val:number) => `${Math.round(val)}${unit}`, color:'#fff', fontSize:18, offsetCenter:[0,'45%'] },
      data: [{ value }],
    }]
  };
}

onMounted(()=>{
  const c1 = echarts.init(g1.value!, 'dark');
  const c2 = echarts.init(g2.value!, 'dark');
  const c3 = echarts.init(g3.value!, 'dark');
  c1.setOption(makeGauge('在线率', 95, 100, '%'));
  c2.setOption(makeGauge('SLA 达标', 92, 100, '%'));
  c3.setOption(makeGauge('平均延迟', 182, 600, 'ms'));
  window.addEventListener('resize', () => { c1.resize(); c2.resize(); c3.resize(); });
});
</script>

<style scoped>
.gauges{ display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
.g{ height: 180px; background: rgba(255,255,255,.04); border-radius:12px; }
</style>
