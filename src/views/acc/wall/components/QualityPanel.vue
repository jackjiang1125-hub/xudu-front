
<template>
  <div>
    <div class="panel-title">识别质量与性能</div>
    <div ref="refEl" class="chart"></div>
    <div class="progresses">
      <div class="prog">
        <span>抓拍质量通过率</span>
        <a-progress :percent="86" :showInfo="false" />
      </div>
      <div class="prog">
        <span>1:N 成功率</span>
        <a-progress :percent="94" :showInfo="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';
import { Progress as AProgress } from 'ant-design-vue';

const props = defineProps<{ filters: Record<string, any> }>();
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;

function genLineMock(n:number, min:number, max:number){
  return Array.from({length:n}, ()=> Math.round(min + Math.random()*(max-min)));
}
function init(){
  if(!refEl.value) return;
  chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip:{ trigger:'axis' },
    grid:{ top:24, left:28, right:12, bottom:24 },
    xAxis:{ type:'category', data:Array.from({length:24}, (_,i)=>`${i}:00`) },
    yAxis:{ type:'value', name:'ms' },
    series:[
      { type:'line', name:'P50', smooth:true, data:genLineMock(24,120,200), areaStyle:{} },
      { type:'line', name:'P95', smooth:true, data:genLineMock(24,180,420), areaStyle:{} },
    ]
  });
}
function load(){
  // TODO: 拉接口数据并更新
  chart?.setOption({});
}
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; }
.chart{ height: 220px; width:100%; }
.progresses{ margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.prog span{ display:block; font-size:12px; opacity:.8; margin-bottom:4px; }
</style>
