<template>
  <PageWrapper title="充值记录">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-alert type="info" show-icon>
          <template #message>
            充值记录为实时日志数据，页面无需新增或删除操作，仅支持筛选与查看。
          </template>
        </a-alert>
      </template>
      <template #rechargeChannel="{ text }">
        <a-tag :color="getChannelColor(text)">
          {{ formatChannel(text) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="充值记录详情" :footer="null" width="660">
      <a-descriptions v-if="detailRecord" bordered size="small" :column="2">
        <a-descriptions-item label="充值单号">{{ detailRecord.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="卡号">{{ detailRecord.cardNo }}</a-descriptions-item>
        <a-descriptions-item label="客户姓名">{{ detailRecord.customerName }}</a-descriptions-item>
        <a-descriptions-item label="客户类型">{{ detailRecord.customerType }}</a-descriptions-item>
        <a-descriptions-item label="充值金额(元)">
          {{ Number(detailRecord.rechargeAmount).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="赠送金额(元)">
          {{ Number(detailRecord.giftAmount).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="充值后余额(元)">
          {{ Number(detailRecord.balanceAfter).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="充值渠道">
          <a-tag :color="getChannelColor(detailRecord.rechargeChannel)">
            {{ formatChannel(detailRecord.rechargeChannel) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作员">{{ detailRecord.operator }}</a-descriptions-item>
        <a-descriptions-item label="所属商户">{{ detailRecord.merchant }}</a-descriptions-item>
        <a-descriptions-item label="充值时间" :span="2">{{ detailRecord.rechargeTime }}</a-descriptions-item>
        <a-descriptions-item label="备注信息" :span="2">
          {{ detailRecord.remark || '暂无备注' }}
        </a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="请选择一条充值记录查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import {
    mockRechargeRecordList,
    rechargeChannelOptions,
    rechargeColumns,
    rechargeSearchFormSchema,
    type RechargeChannel,
    type RechargeRecordItem,
  } from './rechargeRecord.data';

  dayjs.extend(isBetween);

  const rechargeStore = ref<RechargeRecordItem[]>([...mockRechargeRecordList]);
  const detailVisible = ref(false);
  const detailRecord = ref<RechargeRecordItem | null>(null);

  const fetchRechargeList = async (params: Record<string, any> = {}) => {
    const { pageNo = 1, pageSize = 10, cardNo, customerName, rechargeChannel, rechargeTimeRange } =
      params;

    let items = [...rechargeStore.value];

    if (cardNo) {
      const keyword = toSafeLower(cardNo);
      items = items.filter((item) => toSafeLower(item.cardNo).includes(keyword));
    }

    if (customerName) {
      const keyword = toSafeLower(customerName);
      items = items.filter((item) => toSafeLower(item.customerName).includes(keyword));
    }

    if (rechargeChannel) {
      items = items.filter((item) => item.rechargeChannel === rechargeChannel);
    }

    if (Array.isArray(rechargeTimeRange) && rechargeTimeRange.length === 2) {
      const [startValue, endValue] = rechargeTimeRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => dayjs(item.rechargeTime).isBetween(start, end, null, '[]'));
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
    title: '充值记录列表',
    rowKey: 'id',
    api: fetchRechargeList,
    columns: rechargeColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: rechargeSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    actionColumn: {
      width: 140,
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

  function formatChannel(value: RechargeChannel) {
    const target = rechargeChannelOptions.find((item) => item.value === value);
    return target ? target.label : value;
  }

  function getChannelColor(value: RechargeChannel) {
    switch (value) {
      case 'cash':
        return 'orange';
      case 'wechat':
        return 'green';
      case 'alipay':
        return 'blue';
      case 'bank':
        return 'purple';
      case 'transfer':
        return 'cyan';
      default:
        return 'default';
    }
  }

  function handleView(record: RechargeRecordItem) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function getTableActions(record: RechargeRecordItem) {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
    ];
  }
</script>
