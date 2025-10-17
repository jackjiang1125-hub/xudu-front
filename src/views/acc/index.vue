<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleOpenSearch">
        搜索设备
      </a-button>
      <a-button danger style="margin-left:8px;" :disabled="selectedRowKeys.length === 0" @click="confirmDelete">
        删除设备
      </a-button>
    </template>
    <template #authorized="{ text }">
      <a-tag :color="Number(text) === 1 ? 'success' : 'default'">
        {{ formatAuthorizedText(text) }}
      </a-tag>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <DeviceForm @register="registerDetail" />
  <SearchDeviceForm @register="registerSearch" @authorize="handleAuthorize" />
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref } from 'vue';
  import DeviceForm from './deviceform.vue';
  import SearchDeviceForm from './searchDeviceForm.vue';
  import { columns, searchFormSchema } from './device.data';
  import { listDevices, type AccDeviceModel, addDeviceBySn, authorizeAccDevice, deleteBatchAccDevice } from './devce.api';

  const { createMessage, createConfirm } = useMessage();

  const [registerDetail, { openModal: openDetail }] = useModal();
  const [registerSearch, { openModal: openSearch }] = useModal();

  const { tableContext } = useListPage({
    designScope: 'acc-device',
    tableProps: {
      api: listDevices,
      rowKey: 'id',
      columns,
      actionColumn: {
        width: 120,
        fixed: 'right',
        title: '操作',
      },
      rowSelection: {
        type: 'checkbox',
        preserveSelectedRowKeys: true,
        onChange: (keys: (string | number)[]) => {
          selectedRowKeys.value = (keys || []).map(String);
        },
      },
      formConfig: {
        labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
      },
    },
  });
  const [registerTable, { reload }] = tableContext;

  function handleOpenSearch() {
    openSearch(true);
  }

  function formatAuthorizedText(value: unknown) {
    if (value === 1 || value === '1' || value === true) {
      return '已授权';
    }
    if (value === 0 || value === '0' || value === false) {
      return '未授权';
    }
    return value ?? '未知';
  }

  function handleDetail(record: AccDeviceModel) {
    openDetail(true, {
      id: record?.id,
      sn: record?.sn,
      record,
    });
  }

  async function handleAuthorize(record: AccDeviceModel) {
    const sn = record?.sn as string;
    const deviceName = record?.deviceName as string | undefined;
    const ipAddress = record?.ipAddress as string | undefined;
    try {
      await addDeviceBySn({ sn, deviceName, ipAddress });
      await authorizeAccDevice({ sn });
      createMessage.success(`设备 ${deviceName ?? sn} 已添加并授权`);
      reload();
    } catch (e) {
      console.error(e);
      createMessage.error('授权失败，请稍后重试');
    }
  }

  function getTableActions(record: AccDeviceModel): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  const selectedRowKeys = ref<string[]>([]);
  function confirmDelete() {
    if (selectedRowKeys.value.length === 0) return;
    createConfirm({
      title: '删除设备',
      content: `确认删除所选 ${selectedRowKeys.value.length} 台设备？`,
      iconType: 'warning',
      onOk: handleBatchDelete,
    });
  }

  async function handleBatchDelete() {
    try {
      await deleteBatchAccDevice(selectedRowKeys.value);
      createMessage.success('删除成功');
      selectedRowKeys.value = [];
      reload();
    } catch (e) {
      console.error(e);
      createMessage.error('删除失败，请稍后重试');
    }
  }
</script>
