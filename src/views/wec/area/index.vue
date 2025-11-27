<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增区域</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="区域信息" width="600px" :showFooter="false">
    <AreaForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './area.data';
import AreaForm from './AreaForm.vue';
import { listAreas, deleteArea, type AreaModel } from './area.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload }] = useTable({
  api: listAreas,
  rowKey: 'id',
  columns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: AreaModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: AreaModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除区域【${record.areaName}】吗？`,
    async onOk() {
      await deleteArea(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: AreaModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}
</script>
