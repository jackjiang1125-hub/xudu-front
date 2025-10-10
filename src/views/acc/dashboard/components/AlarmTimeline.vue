
<template>
  <div>
    <div class="panel-title">风险预警时间轴</div>
    <a-timeline mode="left">
      <a-timeline-item v-for="(it, idx) in items" :key="idx" :color="it.color">
        <div class="tl-title">{{ it.title }}</div>
        <div class="tl-sub">{{ it.time }} ・ {{ it.severity }} ・ {{ it.gate }}</div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { Timeline as ATimeline, TimelineItem as ATimelineItem } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();
const items = ref<any[]>([]);

function mock(){
  const sev = ['INFO','MINOR','MAJOR','CRITICAL'];
  const colorMap:any = { INFO:'gray', MINOR:'blue', MAJOR:'orange', CRITICAL:'red' };
  return Array.from({length:8}, (_,i)=>{
    const s = sev[Math.floor(Math.random()*sev.length)];
    return {
      title: ['强行开门','多次失败','胁迫','占用超时'][Math.floor(Math.random()*4)],
      time: `2025-10-06 1${i}:0${i}`,
      severity: s,
      color: colorMap[s],
      gate: `一教北门-${i+1}`,
    }
  });
}
async function load(){
  // const res = await defHttp.get({ url:'/api/acc/alarms/timeline', params: props.filters });
  items.value = mock();
}
onMounted(load);
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.tl-title{ font-weight:600; color:#f8fbff; }
.tl-sub{ font-size:12px; opacity:.9; color:#f8fbff; }
</style>
