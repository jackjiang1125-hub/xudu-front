<template>
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
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import TimePeriodModal from './TimePeriodModal.vue';
  import { timePeriodColumns, timePeriodSearchSchema, type TimePeriodRecord } from './timeperiod.data';
  import { listTimePeriods, deleteTimePeriod, deleteBatchTimePeriod, getTimePeriodDetail } from './timeperiod.api';

  const { createMessage, createConfirm } = useMessage();

  const selectedRowKeys = ref<(string | number)[]>([]);
  // 记录当前弹窗操作类型：新增或编辑
  const isUpdateMode = ref(false);

  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload, getSelectRows }] = useTable({
    title: '时间段列表',
    columns: timePeriodColumns,
    // 映射后端分页字段，直接返回 IPage 结构即可
    fetchSetting: {
      pageField: 'pageNo',
      sizeField: 'pageSize',
      listField: 'records',
      totalField: 'total',
    },
    api: async (params) => {
      // 将搜索表单的 updatedAt: [begin, end] 转换为后端需要的参数
      const { updatedAt, ...rest } = params || {};
      const query: Record<string, any> = { ...rest };
      if (Array.isArray(updatedAt) && updatedAt.length === 2) {
        query.updatedAt_begin = updatedAt[0];
        query.updatedAt_end = updatedAt[1];
      }
      // 直接返回后端的分页结构（IPage<TimePeriodVO>）
      return await listTimePeriods(query);
    },
    rowKey: 'id',
    actionColumn: {
      width: 160,
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      // 显式声明使用 action 插槽，确保 td 位置正确
      slots: { customRender: 'action' },
    },
    formConfig: {
      labelWidth: 100,
      schemas: timePeriodSearchSchema,
      // 搜索时的参数转换，保持与 api 中一致，便于支持手动触发
      showResetButton: true,
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
    reload();
  }

  function handleCreate() {
    isUpdateMode.value = false;
    openModal(true, { isUpdate: false, record: null });
  }

  async function handleEdit(record: TimePeriodRecord) {
    // 拉取详情，避免列表数据缺少 detail 时导致弹窗展示不全
    const detailRes = await getTimePeriodDetail(record.id);
    isUpdateMode.value = true;
    openModal(true, { isUpdate: true, record: detailRes });
  }

  function handleDelete(record: TimePeriodRecord) {
    createConfirm({
      title: '删除时间段',
      content: `确定删除时间段“${record.name}”吗？`,
      iconType: 'warning',
      onOk: () => {
        return deleteTimePeriod(record.id)
          .then(() => {
            createMessage.success('删除成功');
            refreshTable();
          })
          .catch((e) => {
            createMessage.error((e as Error).message || '删除失败');
          });
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
        const ids = rows.map((item) => item.id).join(',');
        return deleteBatchTimePeriod(ids)
          .then(() => {
            selectedRowKeys.value = [];
            createMessage.success('已删除选中时间段');
            refreshTable();
          })
          .catch((e) => {
            createMessage.error((e as Error).message || '批量删除失败');
          });
      },
    });
  }

  function handleModalSubmit() {
    // 弹窗内部已完成新增/编辑，这里展示成功提示并刷新列表
    createMessage.success(isUpdateMode.value ? '修改成功' : '新增成功');
    refreshTable();
    // 重置操作标记，避免下次误判
    isUpdateMode.value = false;
  }

  function getRowActions(record: TimePeriodRecord): ActionItem[] {
    return [
      {
        label: '编辑',
        icon: 'ant-design:edit-outlined',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        icon: 'ant-design:delete-outlined',
        popConfirm: {
          title: '删除时间段',
          okText: '确认',
          cancelText: '取消',
          placement: 'left',
          confirm: () =>
            deleteTimePeriod(record.id)
              .then(() => {
                createMessage.success('删除成功');
                refreshTable();
              })
              .catch((e) => {
                createMessage.error((e as Error).message || '删除失败');
              }),
        },
      },
    ];
  }
</script>

<style scoped>
  .group-empty {
    margin-top: 80px;
  }
</style>