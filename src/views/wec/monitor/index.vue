<template>
  <div class="usage-stats-container">
    <div class="stats-header">
      <div class="header-content">
        <div class="title-section">
          <span class="icon-wrapper">
            <span class="anticon">📊</span>
          </span>
          <div class="text-wrapper">
            <h1 class="page-title">设备使用统计监控</h1>
            <p class="sub-title">实时监控所有水控设备的总使用时长、流量及金额数据</p>
          </div>
        </div>
        <div class="action-section">
          <a-button type="primary" size="large" preIcon="ant-design:sync-outlined" :loading="operating" @click="handleRefresh">
            {{ operating ? '指令下发中...' : '同步最新数据' }}
          </a-button>
        </div>
      </div>
      
      <!-- 汇总卡片 -->
      <div class="summary-cards">
        <div class="card-item blue">
          <div class="card-icon">⏱️</div>
          <div class="card-info">
            <div class="label">累计总时长</div>
            <div class="value">{{ totalStats.time }} <span class="unit">小时</span></div>
          </div>
        </div>
        <div class="card-item green">
          <div class="card-icon">💧</div>
          <div class="card-info">
            <div class="label">累计总流量</div>
            <div class="value">{{ totalStats.flow }} <span class="unit">升</span></div>
          </div>
        </div>
        <div class="card-item orange">
          <div class="card-icon">💰</div>
          <div class="card-info">
            <div class="label">累计总金额</div>
            <div class="value">{{ totalStats.money }} <span class="unit">元</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-content">
      <BasicTable @register="registerTable">
        <template #toolbar>
          <div class="table-tip">
            <span class="anticon">💡</span>
            <span>点击上方"同步最新数据"按钮，系统将向所有在线设备发送查询指令，并在3秒后自动刷新列表。</span>
          </div>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { usageColumns, searchFormSchema } from './monitor.data';
import { listDeviceUsage, refreshUsage } from './monitor.api';

const { createMessage } = useMessage();
const operating = ref(false);
const autoRefreshTimer = ref<any>(null);

const [registerTable, { reload, getDataSource }] = useTable({
  title: '设备明细列表',
  api: listDeviceUsage,
  rowKey: 'id',
  columns: usageColumns,
  formConfig: { 
    labelWidth: 100, 
    schemas: [
      { field: 'deviceName', label: '设备名称', component: 'JInput', colProps: { span: 6 } },
      { field: 'sn', label: '设备机号', component: 'JInput', colProps: { span: 6 } },
    ],
    autoSubmitOnEnter: true,
  },
  useSearchForm: true,
  showTableSetting: true,
  bordered: true,
  showIndexColumn: true,
  pagination: { pageSize: 10 },
  canResize: false,
});

// 计算汇总数据
const totalStats = computed(() => {
  // If table is not ready or loading, return 0s. 
  // But computed property will react to changes in datasource.
  // getDataSource might be undefined if table is not registered yet.
  let list: any[] = [];
  try {
    if (getDataSource) {
      list = getDataSource() || [];
    }
  } catch (e) {
    // ignore table not ready error
    list = [];
  }
  
  let timeSec = 0;
  let flowMl = 0;
  let moneyFen = 0;
  
  list.forEach((item: any) => {
    timeSec += Number(item.totalUsageTime || 0);
    flowMl += Number(item.totalUsageFlow || 0);
    moneyFen += Number(item.totalUsageMoney || 0);
  });

  return {
    time: (timeSec / 3600).toFixed(4), // 保留4位小数以便观察小数据
    flow: (flowMl / 1000).toFixed(3), // 改为升(L)，保留3位小数
    money: (moneyFen / 100).toFixed(2)
  };
});

async function handleRefresh() {
  try {
    operating.value = true;
    await refreshUsage();
    createMessage.success('查询指令已下发，正在等待设备响应...');
    
    // 3秒后刷新列表
    setTimeout(() => {
      reload();
      operating.value = false;
    }, 3000);
    
  } catch (e) {
    createMessage.error('指令下发失败');
    operating.value = false;
  }
}

// 自动刷新逻辑（可选，每10秒刷新一次列表以获取最新Redis数据）
onMounted(() => {
  // 进入页面自动执行一次同步
  handleRefresh();

  autoRefreshTimer.value = setInterval(() => {
    if (!operating.value) {
      // Check if reload is available before calling
      if (reload) {
        reload({ searchInfo: {} });
      }
    }
  }, 10000);
});

onUnmounted(() => {
  if (autoRefreshTimer.value) clearInterval(autoRefreshTimer.value);
});
</script>

<style scoped lang="less">
.usage-stats-container {
  padding: 16px;
  background-color: #f0f2f5;
  min-height: 100%;
  
  .stats-header {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    margin-bottom: 16px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      
      .title-section {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: #e6f7ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .text-wrapper {
          .page-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1f1f1f;
            line-height: 28px;
          }
          .sub-title {
            margin: 4px 0 0;
            color: #8c8c8c;
            font-size: 13px;
          }
        }
      }
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      
      .card-item {
        padding: 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s;
        cursor: default;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: rgba(255,255,255,0.2);
        }
        
        .card-info {
          color: #fff;
          .label {
            font-size: 14px;
            opacity: 0.85;
            margin-bottom: 4px;
          }
          .value {
            font-size: 28px;
            font-weight: 700;
            font-family: 'DIN Alternate', sans-serif;
            
            .unit {
              font-size: 14px;
              font-weight: 400;
              margin-left: 4px;
              opacity: 0.85;
            }
          }
        }
        
        &.blue {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
        &.green {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
        }
        &.orange {
          background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
          box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
        }
      }
    }
  }
  
  .stats-content {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    
    .table-tip {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1890ff;
      background: #e6f7ff;
      padding: 0 16px;
      border-radius: 4px;
      border: 1px solid #91d5ff;
      font-size: 13px;
      height: 32px; /* Fixed height to match button */
      margin-right: 16px; /* Spacing from other elements */
      white-space: nowrap; /* Prevent text wrapping */
      flex-shrink: 0; /* Prevent container from shrinking */
    }
  }
}

@media (max-width: 992px) {
  .usage-stats-container .stats-header .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
