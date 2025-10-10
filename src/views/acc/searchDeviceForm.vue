<template>
  <BasicModal @register="registerModal" title="搜索设备" :footer="null" :width="960">
    <BasicTable @register="registerTable">
      <template #authorized="{ text }">
        <a-tag :color="Number(text) === 1 ? 'success' : 'default'">
          {{ formatAuthorized(text) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import type { ActionItem, BasicColumn } from '/@/components/Table';
  import type { FormSchema } from '/@/components/Form';
  import { listAuthDevices, type AccDeviceModel } from './devce.api';

  const emit = defineEmits(['register', 'authorize']);

  const MODAL_HEIGHT = 520;
  const BODY_MAX_HEIGHT = 420;
  const TABLE_SCROLL_Y = 260;

  const columns: BasicColumn[] = [
    {
      title: '设备序列号',
      dataIndex: 'sn',
      width: 160,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 160,
    },
    {
      title: 'IPv4地址',
      dataIndex: 'ipAddress',
      width: 160,
    },
    {
      title: '授权状态',
      dataIndex: 'authorized',
      width: 120,
      align: 'center',
      slots: { customRender: 'authorized' },
    },
  ];

  const searchFormSchema: FormSchema[] = [
    {
      label: '设备序列号',
      field: 'sn',
      component: 'Input',
      colProps: { span: 12 },
    },
    {
      label: 'IPv4地址',
      field: 'ipAddress',
      component: 'Input',
      colProps: { span: 12 },
    },
  ];

  const [registerTable, { reload }] = useTable({
    api: listAuthDevices,
    columns,
    rowKey: 'id',
    useSearchForm: true,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
    },
    scroll: { y: TABLE_SCROLL_Y },
    showIndexColumn: true,
    actionColumn: {
      width: 140,
      fixed: 'right',
    },
    immediate: false,
  });

  const [registerModal, { setModalProps }] = useModalInner(() => {
    setModalProps({
      confirmLoading: false,
      height: MODAL_HEIGHT,
      bodyStyle: {
        maxHeight: `${BODY_MAX_HEIGHT}px`,
        overflowY: 'auto',
      },
    });
    reload();
  });

  function formatAuthorized(value: unknown) {
    if (value === 1 || value === '1' || value === true) {
      return '已授权';
    }
    if (value === 0 || value === '0' || value === false) {
      return '未授权';
    }
    return value ?? '未知';
  }

  function handleAuthorize(record: AccDeviceModel) {
    emit('authorize', record);
  }

  function getActions(record: AccDeviceModel): ActionItem[] {
    return [
      {
        label: '添加授权',
        onClick: handleAuthorize.bind(null, record),
        ifShow: Number(record?.authorized) !== 1,
      },
    ];
  }
</script>
