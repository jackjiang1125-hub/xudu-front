<template>
  <div class="monitor-container">
    <!-- 左侧仪表盘 -->
    <div class="monitor-sidebar">
      <div class="sidebar-header">
        <div class="app-title">实时监控中心</div>
        <div class="update-time">更新于 {{ lastUpdated }}</div>
      </div>

      <div class="chart-card">
        <div ref="chartRef" class="status-chart" />
      </div>

      <div class="kpi-list">
        <div class="kpi-item total">
          <div class="kpi-icon"><span class="anticon">📊</span></div>
          <div class="kpi-info">
            <div class="kpi-label">设备总数</div>
            <div class="kpi-value">{{ total }}</div>
          </div>
        </div>
        <div class="kpi-item online">
          <div class="kpi-icon"><span class="anticon">🟢</span></div>
          <div class="kpi-info">
            <div class="kpi-label">在线设备</div>
            <div class="kpi-value">{{ online }}</div>
          </div>
        </div>
        <div class="kpi-item offline">
          <div class="kpi-icon"><span class="anticon">⚫</span></div>
          <div class="kpi-info">
            <div class="kpi-label">离线设备</div>
            <div class="kpi-value">{{ offline }}</div>
          </div>
        </div>
        <div class="kpi-item alarm">
          <div class="kpi-icon"><span class="anticon">🚨</span></div>
          <div class="kpi-info">
            <div class="kpi-label">当前报警</div>
            <div class="kpi-value">{{ alarmCount }}</div>
          </div>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-row">
          <span class="label">在线率</span>
          <span class="value">{{ onlineRate }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: onlineRate + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="monitor-content">
      <div class="content-panel">
        <div class="panel-tabs">
          <div :class="['tab-item', activeTab === 'device' ? 'active' : '']" @click="activeTab = 'device'">设备管理</div>
          <div :class="['tab-item', activeTab === 'alarm' ? 'active' : '']" @click="activeTab = 'alarm'">报警记录</div>
        </div>
        
        <div v-show="activeTab === 'device'" class="tab-content">
          <BasicTable @register="registerDeviceTable">
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
        </div>

        <div v-show="activeTab === 'alarm'" class="tab-content">
          <BasicTable @register="registerAlarm" />
        </div>
      </div>
    </div>
  </div>
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
const tableReady = ref(false);
const alarmReady = ref(false);
const activeTab = ref('device');

function registerDeviceTable(instance: any) { registerTable(instance); tableReady.value = true; }
function registerAlarm(instance: any) { registerAlarmTable(instance); alarmReady.value = true; }

const deviceList = computed(() => (tableReady.value ? (getDataSource?.() || []) : []));
const alarmList = computed(() => (alarmReady.value ? (getAlarmData?.() || []) : []));

const total = computed(() => deviceList.value.length);
const online = computed(() => deviceList.value.filter((r: any) => r?.online).length);
const offline = computed(() => Math.max(total.value - online.value, 0));
const alarmCount = computed(() => alarmList.value.length);
const onlineRate = computed(() => {
  const t = total.value || 0;
  const o = online.value || 0;
  return t > 0 ? Math.round((o / t) * 100) : 0;
});
const lastUpdated = ref<string>('');

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function renderChart() {
  const list = deviceList.value || [];
  const map: Record<string, number> = {};
  list.forEach((r: any) => {
    const k = String(r?.workStatus ?? '未知');
    map[k] = (map[k] || 0) + 1;
  });
  const data = Object.keys(map).map((k) => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value);
  if (!chart && chartRef.value) {
    chart = echarts.init(chartRef.value);
  }
  if (chart) {
    chart.setOption({
      backgroundColor: 'transparent',
      color: ['#00D1FF', '#00FFA3', '#FFD500', '#FF5D5D', '#A077FF', '#FF9AE6', '#64B5F6', '#FF8A65'],
      title: {
        text: '工况分布',
        left: 'center',
        top: '0%',
        textStyle: { color: '#E6F1FF', fontWeight: 600, fontSize: 14 },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17,25,40,0.85)',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#E6F1FF' },
        formatter: '{b}<br/>数量：{c}',
      },
      legend: {
        show: true,
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#C8D6E5' },
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '48%',
          style: {
            text: `在线率\n${onlineRate.value}%`,
            fill: '#E6F1FF',
            fontSize: 16,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 22,
          },
        },
      ],
      series: [
        {
          type: 'pie',
          radius: ['50%', '72%'],
          center: ['50%', '52%'],
          avoidLabelOverlap: true,
          label: { show: true, position: 'outside', color: '#E6F1FF', formatter: '{b}: {c}' },
          labelLine: { show: true, lineStyle: { color: 'rgba(230,241,255,0.5)' } },
          itemStyle: {
            borderColor: 'rgba(255,255,255,0.18)',
            borderWidth: 2,
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.35)',
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            itemStyle: { shadowBlur: 18, shadowColor: 'rgba(0,0,0,0.55)' },
          },
          data,
        },
      ],
      animationDurationUpdate: 500,
      animationEasingUpdate: 'quadraticOut',
    });
  }
}

let timer: any = null;
let resizeHandler: any = null;
function updateTime() {
  try {
    lastUpdated.value = new Date().toLocaleString();
  } catch (e) {
    lastUpdated.value = '' + Date.now();
  }
}
onMounted(() => {
  updateTime();
  nextTick(() => renderChart());
  timer = setInterval(() => { reload(); reloadAlarm(); updateTime(); nextTick(() => renderChart()); }, 10000);
  resizeHandler = () => { if (chart) chart.resize(); };
  window.addEventListener('resize', resizeHandler);
});

watch(deviceList, () => nextTick(() => renderChart()), { deep: true });
onUnmounted(() => { if (timer) clearInterval(timer); if (chart) { chart.dispose(); chart = null; } if (resizeHandler) window.removeEventListener('resize', resizeHandler); });

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
.monitor-container {
  display: flex;
  height: calc(100vh - 120px);
  min-height: 600px;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  gap: 16px;
}

/* Sidebar */
.monitor-sidebar {
  width: 320px;
  flex-shrink: 0;
  background: radial-gradient(1200px 600px at 20% -10%, rgba(0, 208, 255, 0.12) 0%, transparent 60%),
              radial-gradient(800px 600px at 100% 0%, rgba(160, 119, 255, 0.14) 0%, transparent 60%),
              linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: #fff;
  box-shadow: 4px 0 16px rgba(0,0,0,0.1);
}
.sidebar-header {
  margin-bottom: 24px;
}
.app-title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(90deg, #fff, #b3e5fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 4px;
}
.update-time {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.chart-card {
  height: 260px;
  margin-bottom: 24px;
  position: relative;
}
.status-chart {
  height: 100%;
  width: 100%;
}

.kpi-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kpi-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.2s;
}
.kpi-item:hover {
  transform: translateX(5px);
  background: rgba(255,255,255,0.08);
}
.kpi-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  margin-right: 12px;
  font-size: 20px;
}
.kpi-info { flex: 1; }
.kpi-label { font-size: 12px; color: rgba(255,255,255,0.6); }
.kpi-value { font-size: 20px; font-weight: 700; color: #fff; }

.kpi-item.total .kpi-value { color: #fff; }
.kpi-item.online .kpi-value { color: #00FFA3; }
.kpi-item.offline .kpi-value { color: #FF8A65; }
.kpi-item.alarm .kpi-value { color: #FF5D5D; }

.summary-box {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: rgba(255,255,255,0.8); }
.progress-track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #00D1FF; border-radius: 3px; transition: width 0.5s ease; }

/* Content */
.monitor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.content-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}
.tab-item {
  padding: 16px 24px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-right: 1px solid #f0f0f0;
  transition: all 0.2s;
}
.tab-item:hover { color: #0960bd; background: #fff; }
.tab-item.active {
  color: #0960bd;
  background: #fff;
  box-shadow: inset 0 2px 0 #0960bd;
}
.tab-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

@media (max-width: 1200px) {
  .monitor-container { flex-direction: column; height: auto; }
  .monitor-sidebar { width: 100%; height: auto; }
  .kpi-list { display: grid; grid-template-columns: repeat(2, 1fr); }
  .summary-box { display: none; }
  .monitor-content { height: 600px; }
}
</style>
