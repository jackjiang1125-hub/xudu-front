<template>
  <BasicModal @register="registerModal" title="搜索设备" :footer="null" :width="960">
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <template v-if="record.__accAdded">
          <a-tag color="success">已添加</a-tag>
        </template>
        <template v-else>
          <a-button type="primary" size="small" @click="handleAuthorize(record)">
            添加
          </a-button>
        </template>
      </template>
    </BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable } from '/@/components/Table';
  import type { BasicColumn } from '/@/components/Table';
  import type { FormSchema } from '/@/components/Form';
  import { listAuthDevices, getAccDeviceBySn, type AccDeviceModel } from './devce.api';

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
      title: '操作',
      slots: { customRender: 'action' },
    },
    // 在表格数据返回后，批量查询ACC模块是否已添加
    afterFetch: async (items: any[]) => {
      const checks = await Promise.all(
        items.map(async (it) => {
          const dev = await getAccDeviceBySn({ sn: it?.sn });
          return { sn: it?.sn, exists: !!dev };
        })
      );
      const map = new Map(checks.map((c) => [c.sn, c.exists]));
      items.forEach((it) => (it.__accAdded = map.get(it?.sn) === true));
      return items;
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

  function handleAuthorize(record: AccDeviceModel) {
    emit('authorize', record);
  }
</script>
