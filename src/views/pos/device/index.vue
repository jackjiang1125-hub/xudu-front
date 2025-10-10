<template>
  <PageWrapper title="消费终端管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="table-header">
          <a-alert type="info" message="消费终端列表仅展示样例数据，后续可替换为接口数据。" show-icon />
          <a-button preIcon="ant-design:reload-outlined" @click="reload">
            刷新
          </a-button>
        </div>
      </template>
      <template #onlineStatus="{ text }">
        <a-tag :color="text === 'online' ? 'success' : 'default'">
          {{ text === 'online' ? '在线' : '离线' }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="终端详情" :footer="null" width="680">
      <a-descriptions v-if="detailRecord" bordered size="small" :column="2">
        <a-descriptions-item label="终端编号">{{ detailRecord.deviceCode }}</a-descriptions-item>
        <a-descriptions-item label="终端名称">{{ detailRecord.deviceName }}</a-descriptions-item>
        <a-descriptions-item label="设备类型">{{ formatDeviceType(detailRecord.deviceType) }}</a-descriptions-item>
        <a-descriptions-item label="序列号">{{ detailRecord.serialNo }}</a-descriptions-item>
        <a-descriptions-item label="所属门店">{{ detailRecord.bindStore }}</a-descriptions-item>
        <a-descriptions-item label="部署位置">{{ detailRecord.location }}</a-descriptions-item>
        <a-descriptions-item label="网络类型">{{ detailRecord.networkType }}</a-descriptions-item>
        <a-descriptions-item label="心跳间隔(秒)">{{ detailRecord.heartbeatInterval }}</a-descriptions-item>
        <a-descriptions-item label="在线状态">
          <a-tag :color="detailRecord.onlineStatus === 'online' ? 'success' : 'default'">
            {{ detailRecord.onlineStatus === 'online' ? '在线' : '离线' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="固件版本">{{ detailRecord.firmwareVersion }}</a-descriptions-item>
        <a-descriptions-item label="硬件版本">{{ detailRecord.hardwareVersion }}</a-descriptions-item>
        <a-descriptions-item label="IP 地址">{{ detailRecord.ipAddress }}</a-descriptions-item>
        <a-descriptions-item label="MAC 地址">{{ detailRecord.macAddress }}</a-descriptions-item>
        <a-descriptions-item label="最近在线时间">{{ detailRecord.lastOnlineAt }}</a-descriptions-item>
        <a-descriptions-item label="上次同步时间">{{ detailRecord.lastSyncAt }}</a-descriptions-item>
        <a-descriptions-item label="备注信息" :span="2">
          {{ detailRecord.remark || '暂无备注' }}
        </a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="请选择一台终端查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    deviceColumns,
    deviceSearchFormSchema,
    deviceTypeOptions,
    mockDeviceList,
    type PosDeviceItem,
  } from './device.data';

  const deviceStore = ref<PosDeviceItem[]>([...mockDeviceList]);
  const detailVisible = ref(false);
  const detailRecord = ref<PosDeviceItem | null>(null);
  const { createMessage } = useMessage();

  const fetchDeviceList = async (params: Record<string, any> = {}) => {
    const { pageNo = 1, pageSize = 10, deviceName, deviceCode, deviceType, onlineStatus, bindStore } =
      params;
    let items = [...deviceStore.value];

    if (deviceName) {
      const keyword = toSafeLower(deviceName);
      items = items.filter((item) => toSafeLower(item.deviceName).includes(keyword));
    }

    if (deviceCode) {
      const keyword = toSafeLower(deviceCode);
      items = items.filter((item) => toSafeLower(item.deviceCode).includes(keyword));
    }

    if (deviceType) {
      items = items.filter((item) => item.deviceType === deviceType);
    }

    if (onlineStatus) {
      items = items.filter((item) => item.onlineStatus === onlineStatus);
    }

    if (bindStore) {
      const keyword = toSafeLower(bindStore);
      items = items.filter((item) => toSafeLower(item.bindStore).includes(keyword));
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

  const [registerTable, { reload }] = useTable({
    title: '消费终端列表',
    rowKey: 'id',
    api: fetchDeviceList,
    columns: deviceColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: deviceSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: false,
    },
    actionColumn: {
      width: 220,
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

  function formatDeviceType(value: string) {
    const target = deviceTypeOptions.find((item) => item.value === value);
    return target ? target.label : value;
  }

  function handleView(record: PosDeviceItem) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleRefresh(record: PosDeviceItem) {
    const target = deviceStore.value.find((item) => item.id === record.id);
    if (!target) return;
    target.lastSyncAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    target.lastOnlineAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    target.onlineStatus = 'online';
    createMessage.success(`已同步终端「${target.deviceName}」状态为在线`);
    reload();
  }

  function handlePushConfig(record: PosDeviceItem) {
    createMessage.info(`已触发终端「${record.deviceName}」配置下发任务`);
  }

  function handleDiagnose(record: PosDeviceItem) {
    createMessage.info(`诊断报告已生成，终端：${record.deviceName}`);
  }

  function getTableActions(record: PosDeviceItem) {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: '刷新状态',
        onClick: handleRefresh.bind(null, record),
      },
      {
        label: '下发配置',
        onClick: handlePushConfig.bind(null, record),
      },
      {
        label: '远程诊断',
        onClick: handleDiagnose.bind(null, record),
      },
    ];
  }
</script>

<style scoped>
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .table-header .ant-alert {
    flex: 1;
  }
</style>
