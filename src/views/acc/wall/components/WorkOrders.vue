
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
    api:(p:any)=>defHttp.get({ url:'/api/ops/workorders/page', params:{...p, ...props.filters} }),
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
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; }
</style>
