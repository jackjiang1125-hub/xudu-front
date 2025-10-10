
<template>
  <div>
    <div class="panel-title">实时事件流</div>
    <BasicTable @register="register">
      <template #action="{ record }">
        <TableAction :actions="getRowActions(record)" />
      </template>
    </BasicTable>

    <BasicDrawer v-model:visible="drawerVisible" width="720">
      <template #title>
        事件详情 / 常开计划
      </template>
      <a-tabs v-model:activeKey="tabKey" size="small">
        <a-tab-pane key="detail" tab="详情">
          <a-descriptions :column="2" bordered size="small" v-if="current">
            <a-descriptions-item label="时间" :span="2">{{ current.ts }}</a-descriptions-item>
            <a-descriptions-item label="人员">{{ current.personName }}（{{ current.personType }}）</a-descriptions-item>
            <a-descriptions-item label="相似度">{{ current.similarity }}</a-descriptions-item>
            <a-descriptions-item label="门/区域" :span="2">{{ current.gateName }}</a-descriptions-item>
            <a-descriptions-item label="结果">{{ current.result }}</a-descriptions-item>
            <a-descriptions-item label="原因">{{ current.reason }}</a-descriptions-item>
            <a-descriptions-item label="抓拍" :span="2">
              <img v-if="current.snapshot" :src="current.snapshot" style="max-width:100%;" />
            </a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
        <a-tab-pane key="openplan" tab="常开计划">
          <div class="op-toolbar">
            <a-button type="primary" @click="openCreate">新建常开计划</a-button>
          </div>
          <BasicTable @register="registerPlans">
            <template #action="{ record }">
              <TableAction :actions="getPlanActions(record)" />
            </template>
          </BasicTable>
        </a-tab-pane>
      </a-tabs>
    </BasicDrawer>

    <BasicModal v-model:visible="planVisible" :title="planTitle" width="560" @ok="savePlan">
      <BasicForm @register="registerPlanForm" />
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { ref, watch } from 'vue';
import { Tabs as ATabs, TabPane as ATabPane, Button as AButton, message } from 'ant-design-vue';
import { BasicTable, TableAction, type BasicColumn } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { BasicModal } from '/@/components/Modal';
import { BasicForm, useForm, type FormSchema } from '/@/components/Form';
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();

function mockEvents(count=40){
  const reasons = ['EXPIRED','BLACKLIST','ANTI_PASSBACK','TIME_WINDOW','MULTI_FAIL','UNKNOWN'];
  const types = ['student','staff','visitor'];
  const gates = ['一教北门','一教南门','图书馆西门','宿舍A-1','宿舍A-2','体育馆'];
  const res:any[] = [];
  const now = Date.now();
  for(let i=0;i<count;i++){
    const ts = new Date(now - i*45*1000).toISOString().replace('T',' ').slice(0,19);
    res.push({
      eventId: 'evt_'+(100000+i),
      ts,
      personName: ['张三','李四','王五','赵六','陈诚','周震'][i%6],
      personType: types[i%3],
      gateName: gates[i%gates.length],
      gateId: 'G-'+(i%18+1),
      result: Math.random()<0.83 ? 'PASS' : 'DENY',
      reason: reasons[i%reasons.length],
      similarity: (70 + Math.random()*30).toFixed(1)+'%',
      snapshot: '',
    });
  }
  return res;
}

/** 事件流表 **/
const columns: BasicColumn[] = [
  { title: '时间', dataIndex: 'ts', width: 160 },
  { title: '人员', dataIndex: 'personName', width: 120, ellipsis: true },
  { title: '类型', dataIndex: 'personType', width: 80 },
  { title: '门/区域', dataIndex: 'gateName', width: 160, ellipsis: true },
  { title: '结果', dataIndex: 'result', width: 80 },
  { title: '原因', dataIndex: 'reason', width: 140, ellipsis: true },
  { title: '相似度', dataIndex: 'similarity', width: 90 },
];
const { tableContext } = useListPage({
  designScope: 'acc-dashboard-events',
  tableProps: {
    rowKey: 'eventId',
    title: '',
    size: 'small',
    striped: true,
    columns,
    api: (p:any) => USE_MOCK ? Promise.resolve({ records: mockEvents(), total: 40 }) : defHttp.get({ url:'/api/acc/events/page', params: { ...p, ...props.filters } }),
    pagination: { pageSize: 20 },
    showIndexColumn: false,
    actionColumn: { width: 120 },
  },
});
const [register, { reload }] = tableContext;
watch(() => props.filters, () => reload(), { deep: true });

/** 抽屉与详情 **/
const drawerVisible = ref(false);
const current = ref<any>(null);
const tabKey = ref('detail');

function getRowActions(record:any){
  return [
    { label:'详情/计划', onClick:() => { current.value = record; drawerVisible.value = true; tabKey.value='detail'; reloadPlans(); } },
  ];
}

/** 常开计划列表 **/
function mockPlans(){
  const rep = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return Array.from({length:6}, (_,i)=>({
    id:'OP'+(100+i),
    name:'计划-'+(i+1),
    gateName: current.value?.gateName || '一教北门',
    timeWin:`0${8+i}:00 - 1${2+i}:30`,
    repeat: rep.slice(0,5).join('/'),
    status: i%2? 'ENABLED':'DISABLED',
  }));
}

import type { BasicTableProps } from '/@/components/Table';
const planColumns: BasicColumn[] = [
  { title:'计划名', dataIndex:'name', width:160 },
  { title:'门/区域', dataIndex:'gateName', width:160, ellipsis:true },
  { title:'时间窗', dataIndex:'timeWin', width:220 },
  { title:'重复', dataIndex:'repeat', width:140 },
  { title:'状态', dataIndex:'status', width:100 },
];
const { tableContext: plansCtx } = useListPage({
  designScope: 'acc-dashboard-openplans',
  tableProps: {
    rowKey:'id',
    size:'small',
    striped:true,
    columns:planColumns,
    api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockPlans(), total: 6 }) : defHttp.get({ url:'/api/acc/open-plan/list', params:{ ...p, gateId: current.value?.gateId } }),
    actionColumn:{ width:160 },
    pagination:false,
  }
});
const [registerPlans, { reload: reloadPlans }] = plansCtx;

function getPlanActions(record:any){
  const enabled = record.status === 'ENABLED';
  return [
    { label: enabled ? '停用' : '启用', onClick: async () => {
        if(!USE_MOCK){ /* await defHttp.post({ url:'/api/acc/open-plan/toggle', params:{ id: record.id } }); */ }
        message.success(`${enabled ? '已停用' : '已启用'}`);
        reloadPlans();
      } },
    { label:'删除', color:'error', onClick: async () => {
        if(!USE_MOCK){ /* await defHttp.delete({ url:'/api/acc/open-plan/delete', params:{ id: record.id } }); */ }
        message.success('已删除');
        reloadPlans();
      } },
  ];
}

/** 新建/编辑计划 **/
const planVisible = ref(false);
const planTitle = ref('新建常开计划');

const planSchemas: FormSchema[] = [
  { field:'name', label:'计划名', component:'Input', required:true },
  { field:'gateId', label:'门/区域', component:'Input', required:true, dynamicDisabled:true },
  { field:'range', label:'时间窗', component:'RangePicker', required:true, componentProps:{ showTime: true } },
  { field:'repeat', label:'重复', component:'CheckboxGroup', defaultValue:['Mon','Tue','Wed','Thu','Fri'],
    componentProps:{ options:[
      {label:'周一', value:'Mon'}, {label:'周二', value:'Tue'}, {label:'周三', value:'Wed'},
      {label:'周四', value:'Thu'}, {label:'周五', value:'Fri'}, {label:'周六', value:'Sat'}, {label:'周日', value:'Sun'},
    ] } },
  { field:'remark', label:'备注', component:'InputTextArea' },
];
const [registerPlanForm, { setFieldsValue, validate, resetFields }] = useForm({
  labelWidth: 80,
  showResetButton: false,
  showSubmitButton: false,
  schemas: planSchemas,
});

function openCreate(){
  planTitle.value = '新建常开计划';
  planVisible.value = true;
  resetFields();
  setFieldsValue({
    gateId: current.value?.gateId,
    name: `${current.value?.gateName || '某门'}-常开`,
  });
}
async function savePlan(){
  const vals = await validate();
  if(!USE_MOCK){ /* await defHttp.post({ url:'/api/acc/open-plan/save', params: vals }); */ }
  planVisible.value = false;
  reloadPlans();
  reload();
}
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.op-toolbar{ margin-bottom:8px; display:flex; gap:8px; }
</style>
