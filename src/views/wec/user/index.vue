<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增用户</a-button>
      <a-button style="margin-left:8px;" preIcon="ant-design:upload-outlined" @click="handleImport">批量导入</a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="用户信息" width="720px" :showFooter="false">
    <UserForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './user.data';
import UserForm from './UserForm.vue';
import { listUsers, deleteUser, importUsers, type WecUserModel } from './user.api';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload }] = useTable({
  api: listUsers,
  rowKey: 'id',
  columns,
  actionColumn: { width: 160, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: WecUserModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: WecUserModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除用户【${record.realName}】吗？`,
    async onOk() {
      await deleteUser(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

async function handleImport() {
  await importUsers({});
  createMessage.success('已触发导入');
}

function getTableActions(record: WecUserModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}
</script>
