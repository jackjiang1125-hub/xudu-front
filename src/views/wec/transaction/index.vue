<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:reload-outlined" @click="reload">刷新</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
</template>

<script setup lang="ts">
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './transaction.data';
import { listTransactions, refundTransaction, type TransactionModel } from './transaction.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload }] = useTable({
  api: listTransactions,
  rowKey: 'id',
  columns,
  actionColumn: { width: 160, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

function handleRefund(record: TransactionModel) {
  createConfirm({
    title: '确认退款',
    content: `确定为交易【${record.tradeNo}】退款吗？`,
    async onOk() {
      await refundTransaction(String(record.id));
      createMessage.success('退款成功');
      reload();
    },
  });
}

function getTableActions(record: TransactionModel) {
  return [
    { label: '退款', onClick: handleRefund.bind(null, record) },
  ];
}
</script>
