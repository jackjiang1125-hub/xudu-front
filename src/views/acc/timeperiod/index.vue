<template>
  <PageWrapper title="门禁时间段管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增时间段</a-button>
          <a-button
            danger
            preIcon="ant-design:delete-outlined"
            :disabled="!selectedRowKeys.length"
            @click="handleBatchDelete"
          >删除</a-button>
        </a-space>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getRowActions(record)" />
      </template>
    </BasicTable>
    <TimePeriodModal @register="registerModal" @submit="handleModalSubmit" />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import TimePeriodModal from './TimePeriodModal.vue';
  import {
    timePeriodColumns,
    timePeriodSearchSchema,
    mockTimePeriodList,
    type TimePeriodRecord,
  } from './timeperiod.data';

  const { createMessage, createConfirm } = useMessage();

  const dataSource = ref<TimePeriodRecord[]>([...mockTimePeriodList]);
  const selectedRowKeys = ref<(string | number)[]>([]);

  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload, setTableData, getSelectRows }] = useTable({
    title: '时间段列表',
    columns: timePeriodColumns,
    dataSource: dataSource.value,
    rowKey: 'id',
    actionColumn: {
      width: 160,
      title: '操作',
    },
    formConfig: {
      labelWidth: 100,
      schemas: timePeriodSearchSchema,
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
    rowSelection: {
      type: 'checkbox',
      onChange: (keys) => {
        selectedRowKeys.value = keys;
      },
    },
  });

  function refreshTable() {
    setTableData([...dataSource.value]);
    reload();
  }

  function handleCreate() {
    openModal(true, { isUpdate: false, record: null });
  }

  function handleEdit(record: TimePeriodRecord) {
    openModal(true, { isUpdate: true, record });
  }

  function handleDelete(record: TimePeriodRecord) {
    createConfirm({
      title: '删除时间段',
      content: `确定删除时间段“${record.name}”吗？`,
      iconType: 'warning',
      onOk: () => {
        dataSource.value = dataSource.value.filter((item) => item.id !== record.id);
        refreshTable();
        createMessage.success('删除成功');
      },
    });
  }

  function handleBatchDelete() {
    const rows = getSelectRows();
    if (!rows.length) {
      createMessage.warning('请至少选择一条数据');
      return;
    }
    createConfirm({
      title: '批量删除',
      content: `确认删除选中的 ${rows.length} 条时间段吗？`,
      iconType: 'warning',
      onOk: () => {
        const ids = new Set(rows.map((item) => item.id));
        dataSource.value = dataSource.value.filter((item) => !ids.has(item.id));
        selectedRowKeys.value = [];
        refreshTable();
        createMessage.success('已删除选中时间段');
      },
    });
  }

  function handleModalSubmit(record: TimePeriodRecord) {
    const index = dataSource.value.findIndex((item) => item.id === record.id);
    if (index > -1) {
      dataSource.value.splice(index, 1, record);
      createMessage.success('时间段更新成功');
    } else {
      dataSource.value = [record, ...dataSource.value];
      createMessage.success('已新增时间段');
    }
    refreshTable();
  }

  function getRowActions(record: TimePeriodRecord): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        onClick: () => handleDelete(record),
      },
    ];
  }
</script>

<style scoped>
  .group-empty {
    margin-top: 80px;
  }
</style>