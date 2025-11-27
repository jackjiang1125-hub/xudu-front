<template>
  <BasicTable @register="registerHeartbeatTable">
    <template #toolbar>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" preIcon="ant-design:setting-outlined" :loading="syncing">通信管理</a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="syncTime">设备时间同步</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </BasicTable>
  <BasicTable @register="registerLogTable" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { listHeartbeats, listCommLogs, syncDeviceTime } from './system.api';

const { createMessage } = useMessage();

const [registerHeartbeatTable, { getSelectRows }] = useTable({
  api: listHeartbeats,
  rowKey: 'id',
  columns: [
    { title: '设备', dataIndex: 'deviceName', width: 160 },
    { title: '机号', dataIndex: 'sn', width: 140 },
    { title: '心跳时间', dataIndex: 'time', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
  ],
  rowSelection: { type: 'checkbox', preserveSelectedRowKeys: true },
});

const [registerLogTable] = useTable({
  api: listCommLogs,
  rowKey: 'id',
  columns: [
    { title: '时间', dataIndex: 'time', width: 180 },
    { title: '设备', dataIndex: 'deviceName', width: 160 },
    { title: '机号', dataIndex: 'sn', width: 140 },
    { title: '内容', dataIndex: 'content', width: 240 },
  ],
});

const syncing = ref(false);
async function onOperationSelect({ key }: any) {
  if (key !== 'syncTime') return;
  const rows = getSelectRows?.() || [];
  const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
  if (sns.length === 0) { createMessage.warning('请选择设备'); return; }
  try {
    syncing.value = true;
    await syncDeviceTime(sns);
    createMessage.success('已触发时间同步');
  } catch (e) {
    createMessage.error('时间同步失败');
  } finally {
    syncing.value = false;
  }
}
</script>
