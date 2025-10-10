
<template>
  <div>
    <div class="panel-title">集成状态</div>
    <a-row :gutter="12">
      <a-col :span="8" v-for="it in items" :key="it.key">
        <a-card :bordered="false" class="stat-card">
          <div class="name">{{ it.name }}</div>
          <div class="lat">延迟：{{ it.latency }} ms</div>
          <div class="state" :class="it.state.toLowerCase()">{{ it.state }}</div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { Row as ARow, Col as ACol, Card as ACard } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();
const items = ref<any[]>([
  { key:'wanrd', name:'万傲瑞达', latency: 132, state:'OK' },
  { key:'sxla', name:'上学啦', latency: 98, state:'OK' },
  { key:'dorm', name:'宿管', latency: 220, state:'WARN' },
  { key:'oa', name:'OA系统', latency: 155, state:'OK' },
  { key:'hr', name:'人事系统', latency: 310, state:'WARN' },
  { key:'lib', name:'图书馆', latency: 480, state:'ERROR' },
]);

async function load(){
  // const res = await defHttp.get({ url:'/api/integration/state', params: props.filters });
  // items.value = res;
}
onMounted(load);
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.stat-card{ background: rgba(20,26,40,.7); border:1px solid rgba(255,255,255,.12); color:#f8fbff; }
.name{ font-size:14px; font-weight:600; color:#ffffff; text-shadow:0 0 6px rgba(0,229,255,0.5); }
.lat{ font-size:12px; opacity:.95; color:#e6f7ff; }
.state{ margin-top:6px; font-weight:700; color:#ffffff; text-shadow:0 0 6px rgba(255,255,255,0.3); }
.state.ok{ color:#00fff0; }
.state.warn{ color:#ffd666; }
.state.error{ color:#ff7875; }
</style>
