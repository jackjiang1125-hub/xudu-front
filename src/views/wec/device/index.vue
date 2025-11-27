<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增设备</a-button>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined" :loading="operating">
          远程控制
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="start">设备启用</a-menu-item>
            <a-menu-item key="stop">设备停用</a-menu-item>
            <a-menu-item key="restart">设备重启</a-menu-item>
            <a-menu-item key="syncTime">同步时间</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="设备信息" width="720px" :showFooter="false">
    <DeviceForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './device.data';
import DeviceForm from './DeviceForm.vue';
import { listWecDevices, deleteWecDevice, startDevice, stopDevice, restartDevice, syncDeviceTime, type WecDeviceModel } from './device.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload, getSelectRows }] = useTable({
  api: listWecDevices,
  rowKey: 'id',
  columns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  rowSelection: { type: 'checkbox', preserveSelectedRowKeys: true },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});
const operating = ref(false);

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: WecDeviceModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: WecDeviceModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除设备【${record.deviceName}】吗？`,
    async onOk() {
      await deleteWecDevice(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: WecDeviceModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}

async function onOperationSelect({ key }: any) {
  const rows = getSelectRows?.() || [];
  const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
  if (sns.length === 0) { createMessage.warning('请选择设备'); return; }
  try {
    operating.value = true;
    if (key === 'start') await startDevice(sns);
    if (key === 'stop') await stopDevice(sns);
    if (key === 'restart') await restartDevice(sns);
    if (key === 'syncTime') await syncDeviceTime(sns);
    createMessage.success('操作已下发');
  } catch (e) {
    createMessage.error('操作失败');
  } finally {
    operating.value = false;
  }
}
</script>
