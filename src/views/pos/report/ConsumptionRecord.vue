<template>
  <PageWrapper title="消费记录">
    <BasicTable @register="registerTable">
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
          <a-descriptions-item label="卡号">{{ detailRecord.cardNo }}</a-descriptions-item>
          <a-descriptions-item label="客户姓名">{{ detailRecord.customerName }}</a-descriptions-item>
          <a-descriptions-item label="消费类型">{{ formatType(detailRecord.type) }}</a-descriptions-item>
          <a-descriptions-item label="消费金额(元)">
            {{ Number(detailRecord.amount).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="优惠金额(元)">
            {{ Number(detailRecord.discountAmount).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="消费后余额(元)">
            {{ Number(detailRecord.balanceAfter).toFixed(2) }}
          </a-descriptions-item>
          <a-descriptions-item label="消费时间">{{ detailRecord.consumeTime }}</a-descriptions-item>
          <a-descriptions-item label="消费设备">{{ detailRecord.deviceName }}</a-descriptions-item>
          <a-descriptions-item label="消费场景">{{ detailRecord.scene }}</a-descriptions-item>
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
  import {
    consumptionColumns,
    consumptionDetailColumns,
    consumptionSearchFormSchema,
    consumptionTypeOptions,
    mockConsumptionRecordList,
    type ConsumptionRecordItem,
    type ConsumptionType,
  } from './consumptionRecord.data';

  dayjs.extend(isBetween);

  const consumptionStore = ref<ConsumptionRecordItem[]>([...mockConsumptionRecordList]);
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

  const fetchConsumptionList = async (params: Record<string, any> = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      cardNo,
      customerName,
      type,
      deviceName,
      consumeTimeRange,
    } = params;

    let items = [...consumptionStore.value];

    if (cardNo) {
      const keyword = toSafeLower(cardNo);
      items = items.filter((item) => toSafeLower(item.cardNo).includes(keyword));
    }

    if (customerName) {
      const keyword = toSafeLower(customerName);
      items = items.filter((item) => toSafeLower(item.customerName).includes(keyword));
    }

    if (type) {
      items = items.filter((item) => item.type === type);
    }

    if (deviceName) {
      const keyword = toSafeLower(deviceName);
      items = items.filter((item) => toSafeLower(item.deviceName).includes(keyword));
    }

    if (Array.isArray(consumeTimeRange) && consumeTimeRange.length === 2) {
      const [startValue, endValue] = consumeTimeRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => dayjs(item.consumeTime).isBetween(start, end, null, '[]'));
      }
    }

    const total = items.length;
    const currentPage = Number(pageNo) || 1;
    const size = Number(pageSize) || 10;
    const startIndex = (currentPage - 1) * size;
    const records = items.slice(startIndex, startIndex + size);

    return {
      records,
      total,
    };
  };

  const [registerTable] = useTable({
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
    if (record.type !== 'product') {
      createMessage.info('当前记录为非商品消费，无需展示明细。');
      return;
    }
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function getTableActions(record: ConsumptionRecordItem): ActionItem[] {
    return [
      {
        label: '查看明细',
        tooltip: record.type === 'product' ? undefined : '仅商品类型支持查看明细',
        disabled: record.type !== 'product',
        onClick: handleView.bind(null, record),
      },
    ];
  }
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
