<template>
  <PageWrapper title="订餐记录">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-alert type="info" show-icon>
          <template #message>订餐记录为历史日志数据，仅支持查询与查看详情。</template>
        </a-alert>
      </template>
      <template #orderDetailType="{ text }">
        <a-tag color="processing">
          {{ formatOrderType(text) }}
        </a-tag>
      </template>
      <template #orderStatus="{ text }">
        <a-tag :color="getOrderStatusColor(text)">
          {{ formatOrderStatus(text) }}
        </a-tag>
      </template>
      <template #payStatus="{ text }">
        <a-tag :color="getPayStatusColor(text)">
          {{ formatPayStatus(text) }}
        </a-tag>
      </template>
      <template #pickupMethod="{ text }">
        <a-tag color="blue">
          {{ formatPickupMethod(text) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
      <template #expandedRowRender="{ record }">
        <div v-if="canExpand(record)" class="expand-content">
          <a-descriptions size="small" :column="3" bordered>
            <a-descriptions-item label="订餐类型">{{ formatOrderType(record.orderDetailType) }}</a-descriptions-item>
            <a-descriptions-item label="出餐场景">{{ record.diningScene }}</a-descriptions-item>
            <a-descriptions-item label="用餐人数">{{ record.attendees ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="座位预留">{{ record.seatsReserved ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="配送地址" :span="2">{{ record.deliveryAddress ?? '—' }}</a-descriptions-item>
          </a-descriptions>
          <a-table
            :columns="detailColumns"
            :data-source="record.orderItems"
            size="small"
            :pagination="false"
            bordered
            row-key="id"
            class="detail-table"
          />
          <div class="detail-summary">
            明细合计：<span>{{ calcDetailTotal(record.orderItems).toFixed(2) }}</span> 元
          </div>
        </div>
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="订餐详情" :footer="null" width="860">
      <template v-if="detailRecord">
        <a-descriptions bordered size="small" :column="3">
          <a-descriptions-item label="订餐单号">{{ detailRecord.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="客户姓名">{{ detailRecord.customerName }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ detailRecord.contactPhone }}</a-descriptions-item>
          <a-descriptions-item label="客户类型">{{ detailRecord.customerType }}</a-descriptions-item>
          <a-descriptions-item label="所属部门">{{ detailRecord.department ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="订餐类型">{{ formatOrderType(detailRecord.orderDetailType) }}</a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag :color="getOrderStatusColor(detailRecord.orderStatus)">{{ formatOrderStatus(detailRecord.orderStatus) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="支付状态">
            <a-tag :color="getPayStatusColor(detailRecord.payStatus)">{{ formatPayStatus(detailRecord.payStatus) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="取餐方式">
            <a-tag color="blue">{{ formatPickupMethod(detailRecord.pickupMethod) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用餐日期">{{ detailRecord.diningDate }}</a-descriptions-item>
          <a-descriptions-item label="用餐时段">{{ detailRecord.diningTimeRange }}</a-descriptions-item>
          <a-descriptions-item label="用餐人数">{{ detailRecord.attendees ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="渠道来源">{{ formatChannel(detailRecord.channel) }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ detailRecord.createTime }}</a-descriptions-item>
          <a-descriptions-item label="最近更新">{{ detailRecord.lastUpdateTime }}</a-descriptions-item>
          <a-descriptions-item label="总数量">{{ detailRecord.totalQuantity }}</a-descriptions-item>
          <a-descriptions-item label="原价合计(元)">{{ Number(detailRecord.totalAmount).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="优惠金额(元)">{{ Number(detailRecord.discountAmount).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="应付金额(元)">{{ Number(detailRecord.payableAmount).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="实付金额(元)">{{ Number(detailRecord.paidAmount).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="配送地址" :span="3">{{ detailRecord.deliveryAddress ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="备注信息" :span="3">{{ detailRecord.remark || '暂无备注' }}</a-descriptions-item>
        </a-descriptions>
        <a-divider v-if="canExpand(detailRecord)" orientation="left" plain>订餐明细</a-divider>
        <template v-if="canExpand(detailRecord)">
          <a-table
            :columns="detailColumns"
            :data-source="detailRecord.orderItems"
            size="small"
            :pagination="false"
            bordered
            row-key="id"
          />
          <div class="detail-summary">
            明细合计：<span>{{ detailSummary.toFixed(2) }}</span> 元
          </div>
        </template>
      </template>
      <a-empty v-else description="请选择订餐记录查看详情" />
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
    mealOrderColumns,
    mealOrderDetailColumns,
    mealOrderDetailTypeOptions,
    mealOrderStatusOptions,
    mealOrderPayStatusOptions,
    mealOrderPickupMethodOptions,
    mealOrderChannelOptions,
    mealOrderSearchFormSchema,
    mockMealOrderRecordList,
    type MealOrderRecord,
    type MealOrderDetailType,
    type MealOrderStatus,
    type MealOrderPayStatus,
    type MealOrderPickupMethod,
    type MealOrderChannel,
  } from './mealOrderRecord.data';

  dayjs.extend(isBetween);

  const mealOrderStore = ref<MealOrderRecord[]>([...mockMealOrderRecordList]);
  const detailColumns = mealOrderDetailColumns;
  const detailVisible = ref(false);
  const detailRecord = ref<MealOrderRecord | null>(null);
  const { createMessage } = useMessage();

  const detailItems = computed(() => detailRecord.value?.orderItems ?? []);
  const detailSummary = computed(() => calcDetailTotal(detailItems.value));

  function canExpand(record: MealOrderRecord | null | undefined) {
    if (!record) return false;
    return record.orderDetailType === 'detail' && Array.isArray(record.orderItems) && record.orderItems.length > 0;
  }

  function calcDetailTotal(details?: MealOrderRecord['orderItems']) {
    if (!Array.isArray(details)) {
      return 0;
    }
    return details.reduce((total, item) => total + Number(item.amount ?? 0), 0);
  }

  const fetchMealOrderList = async (params: Record<string, any> = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      orderNo,
      customerName,
      orderDetailType,
      orderStatus,
      payStatus,
      channel,
      diningDateRange,
    } = params;

    let items = [...mealOrderStore.value];

    if (orderNo) {
      const keyword = toLower(orderNo);
      items = items.filter((item) => toLower(item.orderNo).includes(keyword));
    }

    if (customerName) {
      const keyword = toLower(customerName);
      items = items.filter((item) => toLower(item.customerName).includes(keyword));
    }

    if (orderDetailType) {
      items = items.filter((item) => item.orderDetailType === orderDetailType);
    }

    if (orderStatus) {
      items = items.filter((item) => item.orderStatus === orderStatus);
    }

    if (payStatus) {
      items = items.filter((item) => item.payStatus === payStatus);
    }

    if (channel) {
      items = items.filter((item) => item.channel === channel);
    }

    if (Array.isArray(diningDateRange) && diningDateRange.length === 2) {
      const [startValue, endValue] = diningDateRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => {
          const diningDate = dayjs(item.diningDate);
          return diningDate.isBetween(start, end, 'day', '[]');
        });
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
    title: '订餐记录列表',
    rowKey: 'id',
    api: fetchMealOrderList,
    columns: mealOrderColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: mealOrderSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    rowClassName: (row: MealOrderRecord & { record?: MealOrderRecord }) =>
      canExpand(row.record ?? row) ? 'order-expandable' : 'order-non-expandable',
    actionColumn: {
      width: 160,
      title: '操作',
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
  });

  function toLower(value: unknown) {
    return String(value ?? '').toLowerCase();
  }

  function formatFromOptions<T extends string>(value: T, options: { label: string; value: T }[]) {
    const target = options.find((item) => item.value === value);
    return target ? target.label : value;
  }

  function formatOrderType(value: MealOrderDetailType) {
    return formatFromOptions(value, mealOrderDetailTypeOptions as any);
  }

  function formatOrderStatus(value: MealOrderStatus) {
    return formatFromOptions(value, mealOrderStatusOptions as any);
  }

  function formatPayStatus(value: MealOrderPayStatus) {
    return formatFromOptions(value, mealOrderPayStatusOptions as any);
  }

  function formatPickupMethod(value: MealOrderPickupMethod) {
    return formatFromOptions(value, mealOrderPickupMethodOptions as any);
  }

  function formatChannel(value: MealOrderChannel) {
    return formatFromOptions(value, mealOrderChannelOptions as any);
  }

  function getOrderStatusColor(value: MealOrderStatus) {
    switch (value) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  }

  function getPayStatusColor(value: MealOrderPayStatus) {
    switch (value) {
      case 'unpaid':
        return 'warning';
      case 'paid':
        return 'success';
      case 'refunded':
        return 'default';
      default:
        return 'default';
    }
  }

  function handleView(record: MealOrderRecord) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleUnsupportedDetail(record: MealOrderRecord) {
    if (record.orderDetailType !== 'detail') {
      createMessage.info('当前订餐为套餐或自助类型，暂无菜品明细。');
    }
    handleView(record);
  }

  function getTableActions(record: MealOrderRecord): ActionItem[] {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: '查看餐品',
        disabled: !canExpand(record),
        tooltip: canExpand(record) ? undefined : '仅明细订餐展示餐品',
        onClick: handleUnsupportedDetail.bind(null, record),
      },
    ];
  }
</script>

<style scoped>
  .expand-content {
    padding: 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  .detail-table {
    margin-top: 12px;
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

  :deep(tr.order-non-expandable .ant-table-row-expand-icon) {
    visibility: hidden;
    pointer-events: none;
  }
</style>
