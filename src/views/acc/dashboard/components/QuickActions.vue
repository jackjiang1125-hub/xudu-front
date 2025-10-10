
<template>
  <div>
    <div class="panel-title">快速指令</div>
    <div class="actions">
      <a-button type="primary" @click="openAction('楼宇解锁')">楼宇解锁</a-button>
      <a-button danger @click="openAction('楼宇锁定')">楼宇锁定</a-button>
      <a-button @click="openAction('设置常开计划')">设置常开计划</a-button>
      <a-button @click="openAction('紧急广播')">紧急广播</a-button>
    </div>

    <BasicModal v-model:visible="visible" :title="title" width="520" @ok="confirm">
      <BasicForm @register="registerForm" />
    </BasicModal>

    <div class="log-title">最近指令</div>
    <BasicTable @register="registerLog" />
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { ref } from 'vue';
import { Button as AButton, message } from 'ant-design-vue';
import { BasicModal } from '/@/components/Modal';
import { BasicForm, useForm, type FormSchema } from '/@/components/Form';
import { BasicTable, type BasicColumn } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';

const emits = defineEmits<{ (e:'executed', payload:any): void }>();
const props = defineProps<{ filters: Record<string, any> }>();

const visible = ref(false);
const title = ref('');
const action = ref('');

const schemas: FormSchema[] = [
  { field:'target', label:'目标', component:'Input', required:true, componentProps:{ placeholder:'楼宇/门/区域 ID' } },
  { field:'duration', label:'持续(分钟)', component:'InputNumber', componentProps:{ min:1, max:1440 }, ifShow: ()=> action.value.includes('常开') },
  { field:'remark', label:'备注', component:'InputTextArea' },
];
const [registerForm, { validate, resetFields }] = useForm({
  labelWidth:80,
  showResetButton:false,
  showSubmitButton:false,
  schemas,
});

function openAction(act:string){
  action.value = act;
  title.value = act;
  visible.value = true;
  resetFields();
}
async function confirm(){
  const vals = await validate();
  if(!USE_MOCK){ /* await defHttp.post({ url:'/api/acc/control/execute', params:{ action: action.value, ...vals } }); */ }
  visible.value = false;
  message.success(`${action.value} 已下发`);
  emits('executed', { action: action.value, ...vals });
  reloadLog();
}

function mockActionLog(n=10){
  const list:any[]=[];
  const now=Date.now();
  const acts=['楼宇解锁','楼宇锁定','设置常开计划','紧急广播'];
  for(let i=0;i<n;i++){
    list.push({
      id:'ACT'+(1000+i),
      ts:new Date(now - i*600*1000).toISOString().replace('T',' ').slice(0,19),
      action: acts[i%acts.length],
      target:'一教-'+(i%5+1),
      operator:['系统管理员','安保-张三','运维-李四'][i%3],
      result: Math.random()<0.95?'OK':'FAILED'
    });
  }
  return list;
}

const logColumns: BasicColumn[] = [
  { title:'时间', dataIndex:'ts', width:160 },
  { title:'动作', dataIndex:'action', width:160 },
  { title:'目标', dataIndex:'target', width:200, ellipsis:true },
  { title:'操作者', dataIndex:'operator', width:120 },
  { title:'结果', dataIndex:'result', width:100 },
];
const { tableContext: logCtx } = useListPage({
  designScope:'acc-dashboard-actionlog',
  tableProps:{
    rowKey:'id',
    columns:logColumns,
    size:'small',
    striped:true,
    pagination:{ pageSize:10 },
    api:(p:any)=> USE_MOCK ? Promise.resolve({ records: mockActionLog(), total: 10 }) : defHttp.get({ url:'/api/acc/control/log', params:{...p} }),
  }
});
const [registerLog, { reload: reloadLog }] = logCtx;
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.actions{ display:flex; gap:10px; flex-wrap: wrap; margin-bottom:12px; }
.log-title{ margin-top:12px; margin-bottom:4px; font-weight:600; color:#f8fbff; }
</style>
