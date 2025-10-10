
<template>
  <div>
    <div class="panel-title">拒绝原因分布</div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{ filters: Record<string, any> }>();
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;

function init(){
  if(!refEl.value) return;
  chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip:{ trigger:'item' },
    series:[{
      label:{ color:'#f8fbff' },
      itemStyle:{ shadowBlur:12, shadowColor:'rgba(0,229,255,0.35)' },
      type:'pie', radius:['40%','70%'], roseType:'area',
      data:[
        { name:'权限过期', value:120 },
        { name:'黑名单', value:60 },
        { name:'反潜回', value:42 },
        { name:'时间窗外', value:31 },
        { name:'其它', value:18 }
      ]
    }]
  });
}
function load(){
  chart?.setOption({});
}
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.chart{ height: 280px; width:100%; }
</style>
