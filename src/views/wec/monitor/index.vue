<template>
  <div class="monitor-dashboard">
    <div class="kpi-grid">
      <div class="kpi-card total">
        <div class="kpi-value">{{ total }}</div>
        <div class="kpi-label">设备总数</div>
      </div>
      <div class="kpi-card online">
        <div class="kpi-value">{{ online }}</div>
        <div class="kpi-label">在线</div>
      </div>
      <div class="kpi-card offline">
        <div class="kpi-value">{{ offline }}</div>
        <div class="kpi-label">离线</div>
      </div>
      <div class="kpi-card alarm">
        <div class="kpi-value">{{ alarmCount }}</div>
        <div class="kpi-label">报警</div>
      </div>
    </div>
    <div ref="chartRef" class="status-chart" />
  </div>

  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" preIcon="ant-design:setting-outlined" :loading="operating">远程控制</a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="start">设备启用</a-menu-item>
            <a-menu-item key="stop">设备停用</a-menu-item>
            <a-menu-item key="restart">设备重启</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </BasicTable>
  <BasicTable @register="registerAlarmTable" />
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './monitor.data';
import { listDeviceStatus, listAlarms, startDevice, stopDevice, restartDevice } from './monitor.api';
import * as echarts from 'echarts';

const { createMessage } = useMessage();

const [registerTable, { getSelectRows, getDataSource, reload }] = useTable({
  api: listDeviceStatus,
  rowKey: 'id',
  columns,
  rowSelection: { type: 'checkbox', preserveSelectedRowKeys: true },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const [registerAlarmTable, { getDataSource: getAlarmData, reload: reloadAlarm }] = useTable({
  api: listAlarms,
  rowKey: 'id',
  columns: [
    { title: '设备', dataIndex: 'deviceName', width: 160 },
    { title: '机号', dataIndex: 'sn', width: 140 },
    { title: '报警类型', dataIndex: 'type', width: 140 },
    { title: '内容', dataIndex: 'content', width: 240 },
    { title: '时间', dataIndex: 'time', width: 160 },
  ],
});

const operating = ref(false);

const total = computed(() => (getDataSource?.() || []).length);
const online = computed(() => (getDataSource?.() || []).filter((r: any) => r?.online).length);
const offline = computed(() => Math.max(total.value - online.value, 0));
const alarmCount = computed(() => (getAlarmData?.() || []).length);

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function renderChart() {
  const list = getDataSource?.() || [];
  const map: Record<string, number> = {};
  list.forEach((r: any) => {
    const k = String(r?.workStatus ?? '未知');
    map[k] = (map[k] || 0) + 1;
  });
  const data = Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  if (!chart && chartRef.value) {
    chart = echarts.init(chartRef.value);
  }
  if (chart) {
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          label: { show: true, position: 'outside', color: '#fff' },
          labelLine: { show: true },
          itemStyle: {
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 2,
          },
          data,
        },
      ],
    });
  }
}

let timer: any = null;
onMounted(() => {
  nextTick(() => renderChart());
  timer = setInterval(() => { reload(); reloadAlarm(); nextTick(() => renderChart()); }, 10000);
});

watch(() => getDataSource?.(), () => nextTick(() => renderChart()), { deep: true });
onUnmounted(() => { if (timer) clearInterval(timer); if (chart) { chart.dispose(); chart = null; } });

async function onOperationSelect({ key }: any) {
  const rows = getSelectRows?.() || [];
  const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
  if (sns.length === 0) { createMessage.warning('请选择设备'); return; }
  try {
    operating.value = true;
    if (key === 'start') await startDevice(sns);
    if (key === 'stop') await stopDevice(sns);
    if (key === 'restart') await restartDevice(sns);
    createMessage.success('操作已下发');
  } catch (e) {
    createMessage.error('操作失败');
  } finally {
    operating.value = false;
  }
}
</script>

<style scoped>
.monitor-dashboard {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.kpi-card {
  padding: 16px;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);
}
.kpi-card .kpi-value { font-size: 28px; font-weight: 700; }
.kpi-card .kpi-label { font-size: 13px; opacity: 0.85; margin-top: 6px; }
.kpi-card.total { background: linear-gradient(135deg,#4158D0 0%,#C850C0 100%); }
.kpi-card.online { background: linear-gradient(135deg,#00b09b 0%,#96c93d 100%); }
.kpi-card.offline { background: linear-gradient(135deg,#3a1c71 0%,#d76d77 50%,#ffaf7b 100%); }
.kpi-card.alarm { background: linear-gradient(135deg,#ff416c 0%,#ff4b2b 100%); }
.status-chart { height: 220px; border-radius: 12px; overflow: hidden; }
</style>
