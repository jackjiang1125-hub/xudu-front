<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增安装位置</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="安装位置" width="600px" :showFooter="false">
    <LocationForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './location.data';
import LocationForm from './LocationForm.vue';
import { listLocations, deleteLocation, type LocationModel } from './location.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload }] = useTable({
  api: listLocations,
  rowKey: 'id',
  columns,
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: LocationModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: LocationModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除安装位置【${record.locationName}】吗？`,
    async onOk() {
      await deleteLocation(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: LocationModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}
</script>
