<template>
  <BasicTable
    :columns="columns"
    :api="listTransactions"
    :formConfig="{ schemas: searchFormSchema }"
    @register="registerTable"
  >
    <template #tableTitle>
      <a-button type="default" @click="reload">刷新</a-button>
    </template>
    <template #action="{ record }">
      <a-space>
        <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>
  </BasicTable>

  <BasicDrawer v-model:visible="drawerVisible" title="交易记录" width="800px" :showFooter="false">
    <AccTransactionForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { listTransactions, deleteTransaction } from './transaction.api';
import { columns, searchFormSchema } from './transaction.data';
import AccTransactionForm from './AccTransactionForm.vue';

const [registerTable, { reload }] = useTable({ actionColumn: { title: '操作', dataIndex: 'action', width: 160, slots: { customRender: 'action' } } });
const drawerVisible = ref(false);
const currentRecord = ref<any>({});
const { createConfirm, createMessage } = useMessage();
function handleEdit(record) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }
function handleDelete(record) {
  createConfirm({
    title: '确认删除',
    iconType: 'warning',
    content: `确定要删除交易记录【${record.sn}-${record.logTime}】吗？`,
    async onOk() {
      await deleteTransaction(record.id);
      createMessage.success('删除成功');
      reload();
    },
  });
}
</script>