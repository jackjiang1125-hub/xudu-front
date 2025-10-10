
<template>
  <NeoBackground />
  <div class="acc-dashboard">
    <a-card :bordered="false" class="glass-card" style="margin-bottom:12px;">
      <BasicForm @register="registerFilterForm" @submit="onSubmit" />
    </a-card>

    <TickerBar />

    <a-row :gutter="12">
      <a-col :span="24">
        <KpiCards :filters="filters" />
      </a-col>
    </a-row>


    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <KpiGauges />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <!-- 如项目已引入 AMap 脚本，则该面板自动渲染： -->
          <MapPanelAMap />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="16">
        <a-card :bordered="false" class="glass-card" style="margin-bottom:12px;">
          <HeatmapPanel :filters="filters" />
        </a-card>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-card :bordered="false" class="glass-card">
              <ReasonPie :filters="filters" />
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card :bordered="false" class="glass-card">
              <QualityPanel :filters="filters" />
            </a-card>
          </a-col>
        </a-row>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" class="glass-card">
          <EventStream :filters="filters" />
        </a-card>
        <a-card :bordered="false" class="glass-card" style="margin-top:12px;">
          <DeviceHealth :filters="filters" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <TopBoards :filters="filters" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <AlarmTimeline :filters="filters" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <LinkageMatrix :filters="filters" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <PersonaPanel :filters="filters" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <Occupancy :filters="filters" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false" class="glass-card">
          <QuickActions :filters="filters" @executed="onActionExecuted" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="24">
        <a-card :bordered="false" class="glass-card">
          <WorkOrders :filters="filters" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="12" style="margin-top:12px;">
      <a-col :span="24">
        <a-card :bordered="false" class="glass-card">
          <Integrations :filters="filters" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
const USE_MOCK = true;

import { reactive } from 'vue';
import { BasicForm, useForm, type FormSchema } from '/@/components/Form';
import { defHttp } from '/@/utils/http/axios';
import { Card as ACard, Row as ARow, Col as ACol, message } from 'ant-design-vue';

import KpiCards from './components/KpiCards.vue';
import EventStream from './components/EventStream.vue';
import MapPanel from './components/MapPanel.vue';
import HeatmapPanel from './components/HeatmapPanel.vue';
import TopBoards from './components/TopBoards.vue';
import ReasonPie from './components/ReasonPie.vue';
import QualityPanel from './components/QualityPanel.vue';
import DeviceHealth from './components/DeviceHealth.vue';
import LinkageMatrix from './components/LinkageMatrix.vue';
import AlarmTimeline from './components/AlarmTimeline.vue';
import PersonaPanel from './components/PersonaPanel.vue';
import Occupancy from './components/Occupancy.vue';
import WorkOrders from './components/WorkOrders.vue';
import QuickActions from './components/QuickActions.vue';
import Integrations from './components/Integrations.vue';
import KpiGauges from './components/KpiGauges.vue';
import TickerBar from './components/TickerBar.vue';
import MapPanelAMap from './components/MapPanelAMap.vue';
import NeoBackground from './components/NeoBackground.vue';

const filters = reactive<Record<string, any>>({});

const schemas: FormSchema[] = [
  { field: 'campusId', label: '校区', component: 'ApiSelect', colProps: { span: 6 },
    componentProps: {
      api: () => USE_MOCK ? Promise.resolve([{id:'C1',name:'主校区'},{id:'C2',name:'南校区'}]) : defHttp.get({ url: '/api/meta/campus' }),
      labelField: 'name', valueField: 'id', showSearch: true, allowClear: true, placeholder: '选择校区',
    } },
  { field: 'buildingId', label: '楼宇', component: 'ApiSelect', colProps: { span: 6 },
    componentProps: {
      api: (p:any) => USE_MOCK ? Promise.resolve([{id:'B1',name:'一教'},{id:'B2',name:'图书馆'}]) : defHttp.get({ url: '/api/meta/buildings', params: p }),
      labelField: 'name', valueField: 'id', showSearch: true, allowClear: true, placeholder: '选择楼宇',
    } },
  { field: 'gateId', label: '门/区域', component: 'Input', colProps: { span: 6 },
    componentProps: { placeholder: '支持门ID或关键词' } },
  { field: 'time', label: '时间窗', component: 'RangePicker', colProps: { span: 6 }, componentProps: { showTime: true } },
  { field: 'result', label: '结果', component: 'Select', colProps: { span: 6 },
    componentProps: { options: [
      { label:'全部', value: '' },
      { label:'通过', value:'PASS' },
      { label:'拒绝', value:'DENY' },
      { label:'胁迫', value:'DURESS' },
    ] } },
  { field: 'reason', label: '拒绝原因', component: 'Select', colProps: { span: 6 },
    componentProps: { options: [
      { label:'权限过期', value:'EXPIRED' },
      { label:'黑名单', value:'BLACKLIST' },
      { label:'反潜回', value:'ANTI_PASSBACK' },
      { label:'时间窗外', value:'TIME_WINDOW' },
    ] } },
];
const [registerFilterForm, { getFieldsValue }] = useForm({
  labelWidth: 80,
  showResetButton: true,
  submitButtonOptions: { text: '应用筛选' },
  schemas,
  actionColOptions: { span: 6 },
});

function onSubmit() {
  const vals = getFieldsValue();
  Object.assign(filters, vals);
  message.success('筛选条件已应用');
}
function onActionExecuted(payload:any){
  // 根据执行动作刷新对应模块
}
</script>

<style scoped>
.acc-dashboard{ position: relative; z-index: 1; padding:12px; background: radial-gradient(1200px 600px at 80% -20%, rgba(0,229,255,0.08), transparent 70%), #0b0f1a; color:#f8fbff; }
.glass-card{ background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03)); backdrop-filter: blur(10px); border-radius: 12px; border:1px solid rgba(255,255,255,0.12); color:#f8fbff; }

/* Force high-contrast white text inside Ant/Jeecg components */
:deep(.ant-card), :deep(.ant-descriptions), :deep(.ant-typography), :deep(.ant-table), :deep(.ant-tabs), :deep(.ant-modal), :deep(.ant-form), :deep(.ant-progress){
  color:#f8fbff;
}
:deep(.ant-table-thead > tr > th){
  color:#f8fbff; background: rgba(255,255,255,0.06);
}
:deep(.ant-descriptions-bordered .ant-descriptions-item-label),
:deep(.ant-descriptions-bordered .ant-descriptions-item-content){
  background: rgba(255,255,255,0.03);
  color:#f8fbff;
}
:deep(.ant-tabs-tab-btn), :deep(.ant-tabs-ink-bar){ color:#f8fbff !important; }
:deep(.ant-modal-content){
  background: rgba(20,26,40,.92); color:#f8fbff;
  border:1px solid rgba(0,229,255,.18);
  box-shadow: 0 0 24px rgba(124,77,255,.16) inset, 0 0 8px rgba(0,229,255,.25);
}
:deep(.ant-progress-text){ color:#f8fbff; }
:deep(.ant-select-selector), :deep(.ant-picker){
  background: rgba(255,255,255,0.08) !important; color:#f8fbff !important; border-color: rgba(255,255,255,0.3) !important;
}
:deep(.ant-input), :deep(textarea.ant-input){
  background: rgba(255,255,255,0.08) !important; color:#f8fbff !important; border: 1px solid rgba(255,255,255,0.3) !important;
}
:deep(.ant-btn-primary){ box-shadow: 0 0 12px rgba(0,229,255,0.45); }
:deep(.ant-btn-dangerous){ box-shadow: 0 0 12px rgba(255,77,79,0.45); }
</style>
