<template>
  <div>
    <BasicTable
      @register="registerTable"
      :columns="columns"
      :api="listCommands"
      :formConfig="{ schemas: searchFormSchema }"
      :rowSelection="rowSelection"
    >
      <template #tableTitle>
        <a-button type="default" @click="handleRefresh">刷新</a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleView(record)">查看</a-button>
          <a-button type="link" @click="handleRetry(record)" :disabled="record.status !== 'FAILED'">重试</a-button>
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </BasicTable>

    <BasicDrawer v-model:visible="drawerVisible" title="命令详情" width="800px" :showFooter="false">
      <CommandForm :record="currentRecord" @success="handleSaved" />
    </BasicDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { listCommands, deleteCommand, deleteBatchCommands, exportCommands, retryCommand } from './command.api';
import { columns, searchFormSchema } from './command.data';
import CommandForm from './CommandForm.vue';

const [registerTable, { reload, getSelectRows }] = useTable();
const drawerVisible = ref(false);
const currentRecord = ref<any>({});
const { createConfirm, createMessage } = useMessage();

const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);

const rowSelection = {
  type: 'checkbox',
  selectedRowKeys,
  onChange: (keys: string[], rows: any[]) => {
    selectedRowKeys.value = keys;
    selectedRows.value = rows;
  },
};

const hasSelected = computed(() => selectedRowKeys.value.length > 0);

function handleAdd() {
  currentRecord.value = {};
  drawerVisible.value = true;
}

function handleView(record: any) {
  currentRecord.value = { ...record, readonly: true };
  drawerVisible.value = true;
}

function handleSaved() {
  drawerVisible.value = false;
  reload();
}

function handleDelete(record: any) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除命令"${record.commandCode}"吗？`,
    async onOk() {
      await deleteCommand(record.id);
      createMessage.success('删除成功');
      reload();
    },
  });
}

function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    createMessage.warning('请选择要删除的命令');
    return;
  }
  createConfirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 个命令吗？`,
    async onOk() {
      const ids = selectedRows.value.map(item => item.id);
      await deleteBatchCommands(ids);
      createMessage.success('批量删除成功');
      selectedRowKeys.value = [];
      selectedRows.value = [];
      reload();
    },
  });
}

function handleRetry(record: any) {
  createConfirm({
    title: '确认重试',
    content: `确定要重试命令"${record.commandCode}"吗？`,
    async onOk() {
      await retryCommand(record.id);
      createMessage.success('重试成功');
      reload();
    },
  });
}

function handleExport() {
  exportCommands();
}

function handleRefresh() {
  reload();
}
</script>
