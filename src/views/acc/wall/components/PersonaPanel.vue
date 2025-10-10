
<template>
  <div>
    <div class="panel-title">人员通行画像</div>
    <div class="cards">
      <div class="stat">
        <div class="label">在校人数</div>
        <div class="val">{{ stat.onCampus }}</div>
      </div>
      <div class="stat">
        <div class="label">访客</div>
        <div class="val">{{ stat.visitors }}</div>
      </div>
      <div class="stat">
        <div class="label">学生/教职</div>
        <div class="val">{{ stat.stu }}/{{ stat.staff }}</div>
      </div>
    </div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();
const stat = ref<any>({ onCampus: 9211, visitors: 83, stu: 8120, staff: 1091 });
const refEl = ref<HTMLDivElement|null>(null);
let chart: echarts.ECharts | null = null;

function init(){
  if(!refEl.value) return;
  chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip:{ trigger:'item' },
    series:[{
      type:'pie', radius:['38%','70%'],
      data:[ { name:'学生', value: stat.value.stu }, { name:'教职工', value: stat.value.staff }, { name:'访客', value: stat.value.visitors } ]
    }]
  });
}
async function load(){
  // const res = await defHttp.get({ url:'/api/acc/persona', params: props.filters });
  chart?.setOption({ series:[{ data:[
    { name:'学生', value: stat.value.stu },
    { name:'教职工', value: stat.value.staff },
    { name:'访客', value: stat.value.visitors },
  ]}]});
}
onMounted(()=>{ init(); load(); });
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; }
.cards{ display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:12px; }
.stat{ padding:12px; border-radius:10px; background: rgba(20,26,40,.7); border:1px solid rgba(255,255,255,.08); }
.stat .label{ font-size:12px; opacity:.8; }
.stat .val{ font-size:24px; margin-top:6px; }
.chart{ height: 220px; }
</style>
