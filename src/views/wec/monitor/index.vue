<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" preIcon="ant-design:setting-outlined" :loading="operating">远程控制</a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="start">设备启用</a-menu-item>
            <a-menu-item key="stop">设备停用</a-menu-item>
            <a-menu-item key="restart">设备重启</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </BasicTable>
  <BasicTable @register="registerAlarmTable" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './monitor.data';
import { listDeviceStatus, listAlarms, startDevice, stopDevice, restartDevice } from './monitor.api';

const { createMessage } = useMessage();

const [registerTable, { getSelectRows }] = useTable({
  api: listDeviceStatus,
  rowKey: 'id',
  columns,
  rowSelection: { type: 'checkbox', preserveSelectedRowKeys: true },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const [registerAlarmTable] = useTable({
  api: listAlarms,
  rowKey: 'id',
  columns: [
    { title: '设备', dataIndex: 'deviceName', width: 160 },
    { title: '机号', dataIndex: 'sn', width: 140 },
    { title: '报警类型', dataIndex: 'type', width: 140 },
    { title: '内容', dataIndex: 'content', width: 240 },
    { title: '时间', dataIndex: 'time', width: 160 },
  ],
});

const operating = ref(false);

async function onOperationSelect({ key }: any) {
  const rows = getSelectRows?.() || [];
  const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
  if (sns.length === 0) { createMessage.warning('请选择设备'); return; }
  try {
    operating.value = true;
    if (key === 'start') await startDevice(sns);
    if (key === 'stop') await stopDevice(sns);
    if (key === 'restart') await restartDevice(sns);
    createMessage.success('操作已下发');
  } catch (e) {
    createMessage.error('操作失败');
  } finally {
    operating.value = false;
  }
}
</script>
