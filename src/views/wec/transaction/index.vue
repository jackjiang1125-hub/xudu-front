<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" preIcon="ant-design:reload-outlined" @click="reload">刷新</a-button>
        <a-button type="primary" danger preIcon="ant-design:delete-outlined" @click="handleBatchDelete">批量删除</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './transaction.data';
import { listTransactions, deleteTransaction, batchDeleteTransaction, type TransactionModel } from './transaction.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload, getSelectRowKeys }] = useTable({
  title: '消费记录列表',
  api: listTransactions,
  rowKey: 'id',
  columns,
  formConfig: {
    labelWidth: 100,
    schemas: searchFormSchema,
    autoSubmitOnEnter: true,
  },
  useSearchForm: true,
  showTableSetting: true,
  bordered: true,
  showIndexColumn: false,
  rowSelection: { type: 'checkbox' },
  actionColumn: {
    width: 80,
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
  },
});

function handleDelete(record: TransactionModel) {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否确认删除该条记录？',
    onOk: async () => {
      await deleteTransaction({ id: record.id! });
      createMessage.success('删除成功');
      reload();
    },
  });
}

function handleBatchDelete() {
  const ids = getSelectRowKeys();
  if (!ids || ids.length === 0) {
    createMessage.warning('请选择要删除的数据');
    return;
  }
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否确认删除选中的数据？',
    onOk: async () => {
      await batchDeleteTransaction({ ids: ids.join(',') });
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: TransactionModel) {
  return [
    {
      label: '删除',
      color: 'error',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
      },
    },
  ];
}
</script>
