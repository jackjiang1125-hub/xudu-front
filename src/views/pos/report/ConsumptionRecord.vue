<template>
  <PageWrapper title="消费记录">
    <BasicTable 
      @register="registerTable"
      :bordered="true"
      :scroll="{ x: 1300 }"
    >
      <template #tableTitle>
        <a-alert type="info" show-icon>
          <template #message>消费记录为日志数据，仅支持查询与查看明细。</template>
        </a-alert>
      </template>
      <template #type="{ text }">
        <a-tag :color="getTypeColor(text)">
          {{ formatType(text) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
      <template #expandedRowRender="{ record }">
        <div v-if="canExpand(record)" class="expand-detail-wrapper">
          <a-table
            :columns="detailColumns"
            :data-source="record.details"
            size="small"
            :pagination="false"
            row-key="id"
            bordered
          />
          <div class="detail-summary">
            合计：<span>{{ calcDetailTotal(record.details).toFixed(2) }}</span> 元
          </div>
        </div>
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="消费明细" :footer="null" width="760">
      <template v-if="detailRecord">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="消费单号">{{ detailRecord.recordNo }}</a-descriptions-item>
          <a-descriptions-item label="人员编号">{{ detailRecord.customerId }}</a-descriptions-item>
          <a-descriptions-item label="人员姓名">{{ detailRecord.customerName }}</a-descriptions-item>
          <a-descriptions-item label="消费类型">{{ formatType(detailRecord.type) }}</a-descriptions-item>
          <a-descriptions-item label="消费金额(元)">
            {{ Number(detailRecord.amount).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="折扣百分比">
            {{ detailRecord.amount && detailRecord.amount > 0 
              ? `${((detailRecord.discountAmount || 0) / detailRecord.amount * 100).toFixed(1)}%` 
              : '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="折扣金额(元)">
            {{ Number(detailRecord.discountAmount).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="消费后余额(元)">
            {{ Number(detailRecord.balanceAfter).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="消费时间">{{ detailRecord.consumeTime }}</a-descriptions-item>
          <a-descriptions-item label="设备序列号">{{ detailRecord.deviceCode }}</a-descriptions-item>
          <a-descriptions-item label="消费设备">{{ detailRecord.deviceName }}</a-descriptions-item>
          <a-descriptions-item label="餐厅编码">{{ detailRecord.restaurantCode }}</a-descriptions-item>
          <a-descriptions-item label="餐厅名称">{{ detailRecord.scene }}</a-descriptions-item>
          <a-descriptions-item label="验证方式">{{ detailRecord.verifyMethod }}</a-descriptions-item>
          <a-descriptions-item label="卡号">{{ detailRecord.cardNo }}</a-descriptions-item>
          <a-descriptions-item label="操作员">{{ detailRecord.operator }}</a-descriptions-item>
          <a-descriptions-item label="消费渠道">{{ detailRecord.channel }}</a-descriptions-item>
          <a-descriptions-item label="备注信息" :span="2">
            {{ detailRecord.remark || '暂无备注' }}
          </a-descriptions-item>
        </a-descriptions>
        <a-divider orientation="left" plain>商品明细</a-divider>
        <template v-if="detailItems.length">
          <a-table
            :columns="detailColumns"
            :data-source="detailItems"
            size="small"
            :pagination="false"
            row-key="id"
            bordered
          />
          <div class="detail-summary">
            合计：<span>{{ detailSummary.toFixed(2) }}</span> 元
          </div>
        </template>
        <a-empty v-else description="该消费记录暂无明细" />
      </template>
      <a-empty v-else description="请选择商品类型的消费记录查看明细" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getConsumptionList, getConsumptionDetail } from './consumptionRecord.api';
  import {
    consumptionColumns,
    consumptionDetailColumns,
    consumptionSearchFormSchema,
    consumptionTypeOptions,
    type ConsumptionRecordItem,
    type ConsumptionType,
  } from './consumptionRecord.data';

  dayjs.extend(isBetween);

  // 不再需要本地存储，直接从API获取
  const detailColumns = consumptionDetailColumns;
  const detailVisible = ref(false);
  const detailRecord = ref<ConsumptionRecordItem | null>(null);
  const { createMessage } = useMessage();

  const detailItems = computed(() => detailRecord.value?.details ?? []);
  const detailSummary = computed(() =>
    detailItems.value.reduce((total, item) => total + Number(item.totalAmount ?? 0), 0),
  );

  function canExpand(record: ConsumptionRecordItem) {
    return record.type === 'product' && Array.isArray(record.details) && record.details.length > 0;
  }

  function calcDetailTotal(details?: ConsumptionRecordItem['details']) {
    if (!Array.isArray(details)) {
      return 0;
    }
    return details.reduce((total, item) => total + Number(item.totalAmount ?? 0), 0);
  }

  // 恢复使用真实的后端API调用
  const fetchConsumptionList = async (params: Record<string, any> = {}) => {
    try {
      // 处理时间范围参数名转换
      const requestParams = { ...params };
      
      // 将前端的consumeTimeRange转换为后端可能需要的consumeTimeStart和consumeTimeEnd
      if (requestParams.consumeTimeRange && Array.isArray(requestParams.consumeTimeRange) && requestParams.consumeTimeRange.length === 2) {
        requestParams.consumeTimeStart = requestParams.consumeTimeRange[0];
        requestParams.consumeTimeEnd = requestParams.consumeTimeRange[1];
        delete requestParams.consumeTimeRange;
      }
      
      // 确保分页参数正确
      if (!requestParams.pageNo) requestParams.pageNo = 1;
      if (!requestParams.pageSize) requestParams.pageSize = 10;
      
      // 添加时间戳参数以避免缓存
      requestParams._t = Date.now();
      
      // 调用后端API获取消费记录列表
      console.log('请求参数:', requestParams);
      const response = await getConsumptionList(requestParams);
      
      // 打印完整响应数据，帮助调试
      console.log('API响应数据:', response);
      
      // 处理API响应
      if (response && response.success) {
        if (response.data && response.data.records && Array.isArray(response.data.records)) {
          // 规范化数据格式
          const records = response.data.records.map((record: any) => {
            // 计算折扣百分比
            const amount = Number(record.amount || 0);
            const discountAmount = Number(record.discountAmount || 0);
            const discountPercent = amount > 0 ? (discountAmount / amount * 100) : 0;
            
            return {
              id: record.id || '',
              recordNo: record.recordNo || '',
              cardNo: record.cardNo || '',
              customerId: record.customerId || '',
              customerName: record.customerName || '',
              customerType: record.customerType || '',
              type: record.type || 'product',
              amount: amount,
              discountAmount: discountAmount,
              discountPercent: discountPercent,
              balanceAfter: Number(record.balanceAfter || 0),
              deviceName: record.deviceName || '',
              deviceCode: record.deviceCode || '',
              restaurantCode: record.restaurantCode || '',
              scene: record.scene || '',
              verifyMethod: record.verifyMethod || '',
              channel: record.channel || '',
              operator: record.operator || '',
              consumeTime: record.consumeTime || '',
              remark: record.remark || '',
              details: Array.isArray(record.details) ? record.details : []
            };
          });
          
          return {
            records,
            total: Number(response.data.total || 0)
          };
        }
      }
      
      // 响应不符合预期时的处理
      console.warn('API响应不符合预期:', response);
      return {
        records: [],
        total: 0
      };
    } catch (error) {
      console.error('获取消费记录失败:', error);
      createMessage.error('获取数据失败，请稍后重试');
      return {
        records: [],
        total: 0
      };
    }
  };

  // 修复表格配置，确保只有一个完整的useTable调用
  const [registerTable, { getColumns, setColumns, reload, updateTableData }] = useTable({
    title: '消费记录列表',
    rowKey: 'id',
    api: fetchConsumptionList,
    columns: consumptionColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: consumptionSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    rowClassName: (row: ConsumptionRecordItem & { record?: ConsumptionRecordItem }) =>
      canExpand(row.record ?? row) ? 'product-expand-row' : 'no-expand-row',
    actionColumn: {
      width: 160,
      title: '操作',
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
    canResize: true,
    useVirtual: false,
    // 添加表格加载回调以调试数据
    onLoaded: (data) => {
      console.log('表格加载完成，数据:', data);
      // 检查数据结构是否正确
      console.log('数据格式验证:', {
        hasRecords: Array.isArray(data?.records),
        recordCount: data?.records?.length || 0,
        hasTotal: typeof data?.total === 'number'
      });
    },
    onMounted: () => {
      console.log('表格组件已挂载');
    },
  });

  function toSafeLower(value: unknown) {
    return String(value ?? '').toLowerCase();
  }

  function formatType(value: ConsumptionType) {
    const target = consumptionTypeOptions.find((item) => item.value === value);
    return target ? target.label : value;
  }

  function getTypeColor(value: ConsumptionType) {
    switch (value) {
      case 'product':
        return 'blue';
      case 'meal':
        return 'green';
      case 'service':
        return 'purple';
      case 'recharge':
        return 'orange';
      default:
        return 'default';
    }
  }

  function handleView(record: ConsumptionRecordItem) {
    console.log('查看记录:', record);
    if (record.type !== 'product') {
      createMessage.info('当前记录为非商品消费，无需展示明细。');
      return;
    }
    
    // 调用后端API获取详细信息
    const loadDetail = async () => {
      try {
        const response = await getConsumptionDetail(record.id);
        console.log('获取明细响应:', response);
        
        // 根据API定义正确解析响应格式
        if (response.success && response.data) {
          detailRecord.value = response.data;
          detailVisible.value = true;
        } else {
          console.warn('获取明细API失败:', response);
          createMessage.error('获取明细失败，请稍后重试');
        }
      } catch (error) {
        console.error('获取消费明细失败:', error);
        createMessage.error('获取明细失败，请稍后重试');
      }
    };
    
    loadDetail();
  }

  function getTableActions(record: ConsumptionRecordItem): ActionItem[] {
    return [
      {
        label: '查看明细',
        tooltip: record.type === 'product' ? undefined : '仅商品类型支持查看明细',
        disabled: record.type !== 'product',
        onClick: () => handleView(record),
      },
    ];
  }

  // 组件挂载时打印表格列信息
  setTimeout(() => {
    console.log('表格列配置:', getColumns());
  }, 500);
</script>

<style scoped>
  .expand-detail-wrapper {
    padding: 12px 12px 4px 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  .detail-summary {
    margin-top: 12px;
    text-align: right;
    font-weight: 500;
  }

  .detail-summary span {
    color: #1890ff;
    margin-left: 4px;
  }

  :deep(tr.no-expand-row .ant-table-row-expand-icon) {
    visibility: hidden;
    pointer-events: none;
  }
</style>
