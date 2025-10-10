
<template>
  <div>
    <div class="panel-title">工单与 SLA</div>
    <BasicTable @register="register">
      <template #action="{ record }">
        <TableAction :actions="getRowActions(record)" />
      </template>
    </BasicTable>

    <BasicModal v-model:visible="modalVisible" title="工单详情" width="680">
      <a-descriptions :column="2" bordered size="small" v-if="current">
        <a-descriptions-item label="工单号">{{ current.id }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ current.status }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ current.type }}</a-descriptions-item>
        <a-descriptions-item label="SLA">{{ current.sla }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ current.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ current.owner }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ current.desc }}</a-descriptions-item>
      </a-descriptions>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { ref, watch } from 'vue';
import { BasicTable, TableAction, type BasicColumn } from '/@/components/Table';
import { BasicModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();

const columns: BasicColumn[] = [
  { title:'工单号', dataIndex:'id', width:140 },
  { title:'状态', dataIndex:'status', width:100 },
  { title:'类型', dataIndex:'type', width:100 },
  { title:'SLA', dataIndex:'sla', width:80 },
  { title:'创建时间', dataIndex:'createdAt', width:160 },
  { title:'负责人', dataIndex:'owner', width:120 },
];
const { tableContext } = useListPage({
  designScope: 'acc-dashboard-workorders',
  tableProps:{
    rowKey:'id',
    columns,
    size:'small',
    striped:true,
    api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockWorkOrders(), total: 12 }) : defHttp.get({ url:'/api/ops/workorders/page', params:{...p, ...props.filters} }),
    actionColumn:{ width:80 },
  }
});
const [register, { reload }] = tableContext;
watch(()=>props.filters, ()=>reload(), { deep:true });

const modalVisible = ref(false);
const current = ref<any>(null);
function getRowActions(record:any){
  return [
    { label:'详情', onClick:()=>{ current.value = record; modalVisible.value = true; } },
  ];
}

function mockWorkOrders(n=12){
  const status=['OPEN','IN_PROGRESS','RESOLVED'];
  const type=['硬件','网络','软件'];
  const list:any[]=[];
  const now = Date.now();
  for(let i=0;i<n;i++){
    list.push({
      id:'WO'+String(1000+i),
      status: status[i%status.length],
      type: type[i%type.length],
      sla: ['4h','8h','24h'][i%3],
      createdAt: new Date(now - i*3600*1000).toISOString().replace('T',' ').slice(0,19),
      owner: ['张三','李四','王五','赵六'][i%4],
      desc:'示例工单描述：设备离线/心跳异常/网络抖动等',
    });
  }
  return list;
}
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
</style>
