
<template>
  <div>
    <div class="panel-title">设备健康（在线/离线/维护）</div>
    <BasicTable @register="register" />
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { watch } from 'vue';
import { BasicTable, type BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();

const columns: BasicColumn[] = [
  { title:'设备', dataIndex:'deviceName', width:160, ellipsis:true },
  { title:'状态', dataIndex:'state', width:80 },
  { title:'心跳(ms)', dataIndex:'hb', width:90 },
  { title:'固件', dataIndex:'fw', width:100 },
];

function mockDevices(n=16){
  const list = [];
  const fw = ['1.2.8','1.2.7','1.2.6'];
  for(let i=0;i<n;i++){
    list.push({
      deviceId: 'D-'+(i+1),
      deviceName: '门禁控制器-'+(i+1),
      state: ['ONLINE','OFFLINE','MAINT'][i%3],
      hb: 50 + Math.round(Math.random()*400),
      fw: fw[i%fw.length],
    });
  }
  return list;
}

const { tableContext } = useListPage({
  designScope: 'acc-dashboard-health',
  tableProps: {
    rowKey:'deviceId',
    size:'small',
    striped:true,
    columns,
    api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockDevices(), total: 16 }) : defHttp.get({ url:'/api/acc/devices/health', params:{...p, ...props.filters} }),
    pagination:false,
  }
});
const [register, { reload }] = tableContext;
watch(()=>props.filters, ()=>reload(), { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
</style>
