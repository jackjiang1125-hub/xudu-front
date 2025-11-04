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
    type MealOrderRecord,
    type MealOrderDetailType,
    type MealOrderStatus,
    type MealOrderPayStatus,
    type MealOrderPickupMethod,
    type MealOrderChannel,
  } from './mealOrderRecord.data';
  import { getMealOrderList, getMealOrderDetail } from './mealOrderRecord.api';

  dayjs.extend(isBetween);

  // 不再需要本地存储，直接从API获取
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
    try {
      // 处理时间范围参数名转换
      const requestParams = { ...params };
      
      // 将前端的diningDateRange转换为后端可能需要的diningDateStart和diningDateEnd
      if (requestParams.diningDateRange && Array.isArray(requestParams.diningDateRange) && requestParams.diningDateRange.length === 2) {
        requestParams.diningDateStart = requestParams.diningDateRange[0];
        requestParams.diningDateEnd = requestParams.diningDateRange[1];
        delete requestParams.diningDateRange;
      }
      
      console.log('订餐记录请求参数:', requestParams);
      
      // 调用后端API获取订餐记录列表
      const response = await getMealOrderList(requestParams);
      
      // 打印完整响应数据，帮助调试
      console.log('订餐记录API响应数据:', JSON.stringify(response));
      
      // 根据API定义正确解析响应格式
      if (response && response.success === true) {
        // 检查响应数据格式
        if (response.data) {
          // 确保records是数组格式
          let records = Array.isArray(response.data.records) ? response.data.records : [];
          // 确保total是数字格式
          const total = typeof response.data.total === 'number' ? response.data.total : 0;
          
          console.log(`获取并规范化了${records.length}条订餐记录，总计${total}条`);
          
          return {
            records,
            total
          };
        } else {
          console.warn('响应数据字段为空:', response);
          return {
            records: [],
            total: 0
          };
        }
      } else {
        console.warn('后端API返回异常:', response);
        createMessage.error('获取订餐记录失败，请稍后重试');
        
        return {
          records: [],
          total: 0
        };
      }
    } catch (error) {
      console.error('获取订餐记录失败:', error);
      createMessage.error('获取订餐记录失败，请稍后重试');
      
      return {
        records: [],
        total: 0
      };
    }
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
    if (!value) return '-';
    // 同时支持从options和直接映射获取
    const typeMap = {
      'detail': '点餐',
      'package': '套餐'
    };
    return typeMap[value] || formatFromOptions(value, mealOrderDetailTypeOptions as any);
  }

  function formatOrderStatus(value: MealOrderStatus) {
    if (!value) return '-';
    // 同时支持从options和直接映射获取
    const statusMap = {
      'pending': '待处理',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[value] || formatFromOptions(value, mealOrderStatusOptions as any);
  }

  function formatPayStatus(value: MealOrderPayStatus) {
    if (!value) return '-';
    // 同时支持从options和直接映射获取
    const statusMap = {
      'unpaid': '未支付',
      'paid': '已支付',
      'refunded': '已退款'
    };
    return statusMap[value] || formatFromOptions(value, mealOrderPayStatusOptions as any);
  }

  function formatPickupMethod(value: MealOrderPickupMethod) {
    if (!value) return '-';
    // 同时支持从options和直接映射获取
    const methodMap = {
      'takeaway': '外卖',
      'dinein': '堂食',
      'delivery': '配送'
    };
    return methodMap[value] || formatFromOptions(value, mealOrderPickupMethodOptions as any);
  }

  function formatChannel(value: MealOrderChannel) {
    if (!value) return '-';
    // 同时支持从options和直接映射获取
    const channelMap = {
      'app': 'APP',
      'website': '网站',
      'phone': '电话',
      'wechat': '微信'
    };
    return channelMap[value] || formatFromOptions(value, mealOrderChannelOptions as any);
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
    console.log('查看订餐记录:', record);
    
    // 调用后端API获取详细信息
    const loadDetail = async () => {
      try {
        const response = await getMealOrderDetail(record.id);
        console.log('获取订餐详情响应:', response);
        
        // 根据API定义正确解析响应格式
        if (response.success && response.data) {
          detailRecord.value = response.data;
          detailVisible.value = true;
        } else {
          createMessage.error('获取订餐详情失败');
        }
      } catch (error) {
        console.error('获取订餐详情失败:', error);
        createMessage.error('获取订餐详情失败，请稍后重试');
      }
    };
    
    loadDetail();
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
