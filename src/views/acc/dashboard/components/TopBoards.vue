
<template>
  <div>
    <div class="panel-title">门/区域 Top 榜</div>
    <a-tabs v-model:activeKey="tabKey" size="small">
      <a-tab-pane key="pass" tab="通行量 Top10">
        <BasicTable @register="registerPass" />
      </a-tab-pane>
      <a-tab-pane key="deny" tab="拒绝率 Top10">
        <BasicTable @register="registerDeny" />
      </a-tab-pane>
      <a-tab-pane key="alarm" tab="告警 Top10">
        <BasicTable @register="registerAlarm" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { ref, watch } from 'vue';
import { Tabs as ATabs, TabPane as ATabPane } from 'ant-design-vue';
import { BasicTable, type BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();
const tabKey = ref('pass');

const baseColumns: BasicColumn[] = [
  { title:'门/区域', dataIndex:'name', width:200, ellipsis: true },
  { title:'数值', dataIndex:'value', width:120 },
  { title:'占比/趋势', dataIndex:'extra', width:160, ellipsis:true },
];

function mockTop(name:string){
  const arr = [];
  for(let i=0;i<10;i++){
    arr.push({ id: name + '-' + (i+1), name: `${name}-门-${i+1}`, value: Math.round(500+Math.random()*2000), extra: (10+Math.random()*90).toFixed(1)+'%' });
  }
  return arr;
}

const { tableContext: passCtx } = useListPage({ tableProps:{
  rowKey:'id', columns: baseColumns, size:'small', striped:true, pagination:false,
  api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockTop('通行量'), total: 10 }) : defHttp.get({ url:'/api/acc/top/pass', params:{...p, ...props.filters}}),
}});
const [registerPass, { reload: reloadPass }] = passCtx;

const { tableContext: denyCtx } = useListPage({ tableProps:{
  rowKey:'id', columns: baseColumns, size:'small', striped:true, pagination:false,
  api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockTop('拒绝率'), total: 10 }) : defHttp.get({ url:'/api/acc/top/deny', params:{...p, ...props.filters}}),
}});
const [registerDeny, { reload: reloadDeny }] = denyCtx;

const { tableContext: alarmCtx } = useListPage({ tableProps:{
  rowKey:'id', columns: baseColumns, size:'small', striped:true, pagination:false,
  api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockTop('告警'), total: 10 }) : defHttp.get({ url:'/api/acc/top/alarm', params:{...p, ...props.filters}}),
}});
const [registerAlarm, { reload: reloadAlarm }] = alarmCtx;

watch(()=>props.filters, ()=>{ reloadPass(); reloadDeny(); reloadAlarm(); }, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
</style>
