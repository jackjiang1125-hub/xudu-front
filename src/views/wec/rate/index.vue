<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增费率模板</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="费率模板" width="720px" :showFooter="false">
    <RateTemplateForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
  </template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './rate.data';
import RateTemplateForm from './RateTemplateForm.vue';
import { listRateTemplates, deleteRateTemplate, type RateTemplateModel } from './rate.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload }] = useTable({
  api: listRateTemplates,
  rowKey: 'id',
  columns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: RateTemplateModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: RateTemplateModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除模板【${record.templateName}】吗？`,
    async onOk() {
      await deleteRateTemplate(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: RateTemplateModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}
</script>
