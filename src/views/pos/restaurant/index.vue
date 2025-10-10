<template>
  <PageWrapper title="餐厅档案">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-alert type="info" show-icon>
          <template #message>餐厅档案列表仅展示示例数据，可根据筛选条件检索。</template>
        </a-alert>
      </template>
      <template #category="{ text }">
        <a-tag color="processing">{{ formatCategory(text) }}</a-tag>
      </template>
      <template #serviceType="{ text }">
        <a-tag color="purple">{{ formatServiceType(text) }}</a-tag>
      </template>
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">{{ formatStatus(text) }}</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
      <template #expandedRowRender="{ record }">
        <div class="expand-content">
          <a-descriptions bordered size="small" :column="3">
            <a-descriptions-item label="餐厅编码">{{ record.restaurantCode }}</a-descriptions-item>
            <a-descriptions-item label="餐厅名称">{{ record.restaurantName }}</a-descriptions-item>
            <a-descriptions-item label="开业日期">{{ record.openingDate }}</a-descriptions-item>
            <a-descriptions-item label="业态">{{ formatServiceType(record.diningServiceType) }}</a-descriptions-item>
            <a-descriptions-item label="平均客单(元)">{{ Number(record.averageSpend).toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="评分">{{ record.ratingScore }}</a-descriptions-item>
            <a-descriptions-item label="负责人">{{ record.supervisor?.name ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="负责人电话">{{ record.supervisor?.phone ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="负责人岗位">{{ record.supervisor?.position ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="是否停车">{{ record.hasParking ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="是否WIFI">{{ record.hasWifi ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="支持发票">{{ record.supportsInvoice ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="卫生许可证">{{ record.hygieneLicenseNo }}</a-descriptions-item>
            <a-descriptions-item label="消防巡检日期">{{ record.fireInspectionDate }}</a-descriptions-item>
            <a-descriptions-item label="最近稽核">{{ record.lastAuditDate }}</a-descriptions-item>
          </a-descriptions>
          <a-divider orientation="left" plain>设备统计</a-divider>
          <a-space size="large" wrap class="device-summary">
            <div class="device-card">
              <div class="label">POS 终端</div>
              <div class="value">{{ record.deviceSummary?.posCount ?? 0 }}</div>
            </div>
            <div class="device-card">
              <div class="label">自助点餐机</div>
              <div class="value">{{ record.deviceSummary?.kioskCount ?? 0 }}</div>
            </div>
            <div class="device-card">
              <div class="label">手持终端</div>
              <div class="value">{{ record.deviceSummary?.handheldCount ?? 0 }}</div>
            </div>
            <div class="device-card">
              <div class="label">智能取餐柜</div>
              <div class="value">{{ record.deviceSummary?.lockerCount ?? 0 }}</div>
            </div>
          </a-space>
          <a-divider orientation="left" plain>标签</a-divider>
          <div class="tags">
            <a-tag v-for="tag in record.tags" :key="tag" color="blue" bordered>
              {{ tag }}
            </a-tag>
            <span v-if="!record.tags?.length">暂无标签</span>
          </div>
          <a-divider orientation="left" plain>备注</a-divider>
          <p class="remark">
            {{ record.remark || '暂无备注信息' }}
          </p>
        </div>
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="餐厅详情" :footer="null" width="880">
      <template v-if="detailRecord">
        <a-descriptions bordered size="small" :column="3">
          <a-descriptions-item label="餐厅编码">{{ detailRecord.restaurantCode }}</a-descriptions-item>
          <a-descriptions-item label="餐厅名称">{{ detailRecord.restaurantName }}</a-descriptions-item>
          <a-descriptions-item label="餐厅分类">{{ formatCategory(detailRecord.category) }}</a-descriptions-item>
          <a-descriptions-item label="业态">{{ formatServiceType(detailRecord.diningServiceType) }}</a-descriptions-item>
          <a-descriptions-item label="餐厅状态">
            <a-tag :color="getStatusColor(detailRecord.status)">{{ formatStatus(detailRecord.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="开业日期">{{ detailRecord.openingDate }}</a-descriptions-item>
          <a-descriptions-item label="关店日期">{{ detailRecord.closingDate ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="营业时间" :span="2">{{ detailRecord.businessHours }}</a-descriptions-item>
          <a-descriptions-item label="地址" :span="3">{{ detailRecord.address }}</a-descriptions-item>
          <a-descriptions-item label="楼栋">{{ detailRecord.building ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="楼层">{{ detailRecord.floor ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="面积(㎡)">{{ detailRecord.areaSize }}</a-descriptions-item>
          <a-descriptions-item label="座位数">{{ detailRecord.seatingCapacity }}</a-descriptions-item>
          <a-descriptions-item label="包厢数">{{ detailRecord.privateRoomCount }}</a-descriptions-item>
          <a-descriptions-item label="月交易额(元)">{{ Number(detailRecord.monthlySales).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="月订单量">{{ detailRecord.monthlyOrderVolume }}</a-descriptions-item>
          <a-descriptions-item label="平均客单价(元)">{{ Number(detailRecord.averageSpend).toFixed(2) }}</a-descriptions-item>
          <a-descriptions-item label="评分">{{ detailRecord.ratingScore }} ({{ detailRecord.ratingLevel }})</a-descriptions-item>
          <a-descriptions-item label="外送平台">{{ formatDeliveryProvider(detailRecord.deliveryProvider) }}</a-descriptions-item>
          <a-descriptions-item label="外送时间段">
            {{
              detailRecord.deliveryProvider === 'none'
                ? '不支持外送'
                : `${detailRecord.deliveryStartTime ?? '--'} ~ ${detailRecord.deliveryEndTime ?? '--'}`
            }}
          </a-descriptions-item>
          <a-descriptions-item label="卫生许可证">{{ detailRecord.hygieneLicenseNo }}</a-descriptions-item>
          <a-descriptions-item label="消防巡检">{{ detailRecord.fireInspectionDate }}</a-descriptions-item>
          <a-descriptions-item label="最近稽核">{{ detailRecord.lastAuditDate }}</a-descriptions-item>
          <a-descriptions-item label="停车位">{{ detailRecord.hasParking ? '提供' : '不提供' }}</a-descriptions-item>
          <a-descriptions-item label="Wi-Fi">{{ detailRecord.hasWifi ? '提供' : '不提供' }}</a-descriptions-item>
          <a-descriptions-item label="发票">{{ detailRecord.supportsInvoice ? '支持' : '不支持' }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ detailRecord.supervisor?.name ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="联系人电话">{{ detailRecord.supervisor?.phone ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="负责人职务">{{ detailRecord.supervisor?.position ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="标签" :span="3">
            <a-space :size="4" wrap>
              <a-tag v-for="tag in detailRecord.tags" :key="tag" color="blue">
                {{ tag }}
              </a-tag>
              <span v-if="!detailRecord.tags?.length">暂无标签</span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="备注信息" :span="3">{{ detailRecord.remark || '暂无备注' }}</a-descriptions-item>
        </a-descriptions>
      </template>
      <a-empty v-else description="请选择餐厅查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import {
    diningServiceTypeOptions,
    deliveryProviderOptions,
    mockRestaurantList,
    restaurantCategoryOptions,
    restaurantColumns,
    restaurantSearchFormSchema,
    restaurantStatusOptions,
    type RestaurantRecord,
  } from './restaurant.data';

  dayjs.extend(isBetween);

  const restaurantStore = ref<RestaurantRecord[]>([...mockRestaurantList]);
  const detailVisible = ref(false);
  const detailRecord = ref<RestaurantRecord | null>(null);

  const fetchRestaurantList = async (params: Record<string, any> = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      restaurantName,
      restaurantCode,
      status,
      category,
      diningServiceType,
      deliveryProvider,
      openingDateRange,
    } = params;

    let items = [...restaurantStore.value];

    if (restaurantName) {
      const keyword = toLower(restaurantName);
      items = items.filter((item) => toLower(item.restaurantName).includes(keyword));
    }

    if (restaurantCode) {
      const keyword = toLower(restaurantCode);
      items = items.filter((item) => toLower(item.restaurantCode).includes(keyword));
    }

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    if (diningServiceType) {
      items = items.filter((item) => item.diningServiceType === diningServiceType);
    }

    if (deliveryProvider) {
      items = items.filter((item) => item.deliveryProvider === deliveryProvider);
    }

    if (Array.isArray(openingDateRange) && openingDateRange.length === 2) {
      const [startValue, endValue] = openingDateRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => {
          const opened = dayjs(item.openingDate);
          return opened.isBetween(start, end, 'day', '[]');
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
    title: '餐厅列表',
    rowKey: 'id',
    api: fetchRestaurantList,
    columns: restaurantColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 120,
      schemas: restaurantSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    rowClassName: (row: RestaurantRecord & { record?: RestaurantRecord }) =>
      (row.record ?? row).status === 'operating' ? '' : 'restaurant-status',
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

  function formatFromOptions<T extends string>(collection: { label: string; value: T }[], value: T) {
    const match = collection.find((item) => item.value === value);
    return match ? match.label : value;
  }

  function formatCategory(value: string) {
    return formatFromOptions(restaurantCategoryOptions as any, value);
  }

  function formatServiceType(value: string) {
    return formatFromOptions(diningServiceTypeOptions as any, value);
  }

  function formatStatus(value: string) {
    return formatFromOptions(restaurantStatusOptions as any, value);
  }

  function formatDeliveryProvider(value: string) {
    return formatFromOptions(deliveryProviderOptions as any, value);
  }

  function getStatusColor(value: string) {
    switch (value) {
      case 'operating':
        return 'green';
      case 'pending':
        return 'cyan';
      case 'renovation':
        return 'orange';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  }

  function handleView(record: RestaurantRecord) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleCopy(record: RestaurantRecord) {
    const text = `【餐厅档案】${record.restaurantName} (${record.restaurantCode})
状态：${formatStatus(record.status)}
地址：${record.address}
营业时间：${record.businessHours}
负责人：${record.supervisor?.name ?? '—'} ${record.supervisor?.phone ?? ''}`;
    navigator.clipboard?.writeText?.(text).then(
      () => {},
      () => {}
    );
  }

  function getTableActions(record: RestaurantRecord): ActionItem[] {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: '复制档案',
        onClick: handleCopy.bind(null, record),
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

  .device-summary {
    margin-bottom: 8px;
  }

  .device-card {
    min-width: 120px;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background-color: #fff;
    text-align: center;
  }

  .device-card .label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }

  .device-card .value {
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
  }

  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .remark {
    margin: 0;
    color: #555;
    line-height: 1.6;
  }

  :deep(.restaurant-status td) {
    background-color: #fff7e6;
  }
</style>
