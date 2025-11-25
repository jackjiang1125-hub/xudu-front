<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button @click="reload">刷新</a-button>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')">导出</a-button>
        <a-button type="primary" @click="openModal(true, {})" preIcon="ant-design:hdd-outlined">回收站</a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
              <a-menu-item key="2" @click="batchFrozen(2)">
                <Icon icon="ant-design:lock-outlined"></Icon>
                冻结
              </a-menu-item>
              <a-menu-item key="3" @click="batchFrozen(1)">
                <Icon icon="ant-design:unlock-outlined"></Icon>
                解冻
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作<Icon icon="mdi:chevron-down"></Icon></a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <UserDrawer @register="registerDrawer" @success="reload" />
    <PasswordModal @register="registerPasswordModal" @success="reload" />
    <UserAgentModal @register="registerAgentModal" @success="reload" />
    <UserRecycleBinModal @register="registerModal" @success="reload" />
    <UserQuitAgentModal @register="registerQuitAgentModal" @success="reload" />
    <UserQuitModal @register="registerQuitModal" @success="reload" />
  </div>
</template>

<script lang="ts" name="system-user-list" setup>
import { ref, unref } from 'vue';
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import UserDrawer from './UserDrawer.vue';
import UserRecycleBinModal from './UserRecycleBinModal.vue';
import PasswordModal from './PasswordModal.vue';
import UserAgentModal from './UserAgentModal.vue';
import UserQuitAgentModal from './UserQuitAgentModal.vue';
import UserQuitModal from './UserQuitModal.vue';
import { useDrawer } from '/@/components/Drawer';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './user.data';
import { listNoCareTenant, deleteUser, batchDeleteUser, getExportUrl, frozenBatch } from './user.api';
import { usePermission } from '/@/hooks/web/usePermission';

const { createMessage, createConfirm } = useMessage();
const { isDisabledAuth } = usePermission();
const [registerDrawer, { openDrawer }] = useDrawer();
const [registerModal, { openModal }] = useModal();
const [registerPasswordModal, { openModal: openPasswordModal }] = useModal();
const [registerAgentModal, { openModal: openAgentModal }] = useModal();
const [registerQuitAgentModal, { openModal: openQuitAgentModal }] = useModal();
const [registerQuitModal, { openModal: openQuitModal }] = useModal();

const systemSearchSchemas = searchFormSchema.filter((s) => s.field !== 'userType');

const { tableContext, onExportXls } = useListPage({
  designScope: 'user-list-system',
  tableProps: {
    title: '系统用户',
    api: listNoCareTenant,
    columns,
    size: 'small',
    formConfig: { schemas: systemSearchSchemas },
    actionColumn: { width: 120 },
    beforeFetch: (params) => {
      return Object.assign({ column: 'createTime', order: 'desc' }, params, { userType: 1 });
    },
  },
  exportConfig: { name: '系统用户列表', url: getExportUrl },
});

const [registerTable, { reload }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

function handleCreate() {
  openDrawer(true, { isUpdate: false, showFooter: true, tenantSaas: false, record: { userType: 1 } });
}
async function handleEdit(record: Recordable) {
  openDrawer(true, { record, isUpdate: true, showFooter: true, tenantSaas: false });
}
async function handleDetail(record: Recordable) {
  openDrawer(true, { record, isUpdate: true, showFooter: false, tenantSaas: false });
}
async function handleDelete(record) {
  if ('admin' == record.username) {
    createMessage.warning('管理员账号不允许此操作！');
    return;
  }
  await deleteUser({ id: record.id }, reload);
}
async function batchHandleDelete() {
  let hasAdmin = unref(selectedRows).filter((item) => item.username == 'admin');
  if (unref(hasAdmin).length > 0) {
    createMessage.warning('管理员账号不允许此操作！');
    return;
  }
  await batchDeleteUser({ ids: selectedRowKeys.value }, () => {
    selectedRowKeys.value = [];
    reload();
  });
}
function handleChangePassword(username) {
  openPasswordModal(true, { username });
}
function handleAgentSettings(userName) {
  openAgentModal(true, { userName });
}
async function handleFrozen(record, status) {
  if ('admin' == record.username) {
    createMessage.warning('管理员账号不允许此操作！');
    return;
  }
  await frozenBatch({ ids: record.id, status }, reload);
}
function batchFrozen(status) {
  let hasAdmin = selectedRows.value.filter((item) => item.username == 'admin');
  if (unref(hasAdmin).length > 0) {
    createMessage.warning('管理员账号不允许此操作！');
    return;
  }
  createConfirm({
    iconType: 'warning',
    title: '确认操作',
    content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中账号?',
    onOk: async () => {
      await frozenBatch({ ids: unref(selectedRowKeys).join(','), status }, reload);
    },
  });
}
function getTableAction(record): ActionItem[] {
  return [{ label: '编辑', onClick: handleEdit.bind(null, record) }];
}
function getDropDownAction(record): ActionItem[] {
  return [
    { label: '详情', onClick: handleDetail.bind(null, record) },
    { label: '密码', onClick: handleChangePassword.bind(null, record.username) },
    { label: '删除', popConfirm: { title: '是否确认删除', confirm: handleDelete.bind(null, record) } },
    { label: '冻结', ifShow: record.status == 1, popConfirm: { title: '确定冻结吗?', confirm: handleFrozen.bind(null, record, 2) } },
    { label: '解冻', ifShow: record.status == 2, popConfirm: { title: '确定解冻吗?', confirm: handleFrozen.bind(null, record, 1) } },
    { label: '代理人', onClick: handleAgentSettings.bind(null, record.username) },
  ];
}
</script>

<style scoped></style>
