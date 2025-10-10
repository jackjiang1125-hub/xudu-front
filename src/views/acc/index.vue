<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleOpenSearch">
        搜索设备
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
  import DeviceForm from './deviceform.vue';
  import SearchDeviceForm from './searchDeviceForm.vue';
  import { columns, searchFormSchema } from './device.data.js';
  import { listDevices, type AccDeviceModel } from './devce.api';

  const { createMessage } = useMessage();

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
      formConfig: {
        labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
      },
    },
  });

  const [registerTable] = tableContext;

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

  function handleAuthorize(record: AccDeviceModel) {
    createMessage.success(`已选择向设备 ${record?.deviceName ?? record?.sn ?? ''} 添加授权`);
  }

  function getTableActions(record: AccDeviceModel): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
</script>
