
<template>
  <a-row :gutter="12">
    <a-col v-for="card in data" :key="card.key" :span="4">
      <a-card :bordered="false" class="kpi-card">
        <div class="kpi-title">{{ card.title }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div class="kpi-sub" v-if="card.dod !== undefined">日环比 {{ card.dod }}</div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
const USE_MOCK = true;
import { onMounted, watch, ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { Card as ACard, Row as ARow, Col as ACol } from 'ant-design-vue';

const props = defineProps<{ filters: Record<string, any> }>();
const data = ref<any[]>([
  { key: 'pass', title: '当日通行', value: 12876, dod: '+12%' },
  { key: 'uniq', title: '唯一人数', value: 5943, dod: '+6%' },
  { key: 'deny', title: '拒绝率', value: '3.1%', dod: '-0.4%' },
  { key: 'online', title: '在线设备', value: 482, dod: '+1%' },
  { key: 'alarm', title: '告警数', value: 14, dod: '+2' },
  { key: 'lat', title: '平均时延', value: '182ms', dod: '-8ms' },
]);

async function load(){
  try{
    if(!USE_MOCK){
      const res = await defHttp.get({ url: '/api/acc/kpi', params: props.filters });
      data.value = res;
    }
  }catch(e){}
}
onMounted(load);
watch(() => props.filters, load, { deep: true });
</script>

<style scoped>
.kpi-card{ background: rgba(20,26,40,.72); border: 1px solid rgba(0,229,255,.28); box-shadow: 0 0 24px rgba(124,77,255,.18) inset, 0 0 10px rgba(0,229,255,.35); color:#f8fbff; }
.kpi-title{ font-size: 12px; opacity:.9; color:#eaf6ff; }
.kpi-value{ font-size: 30px; line-height: 34px; margin-top: 6px; color:#ffffff; text-shadow:0 0 10px rgba(0,229,255,0.6); letter-spacing:.5px; }
.kpi-sub{ font-size: 12px; opacity:.9; color:#eaf6ff; }
</style>
