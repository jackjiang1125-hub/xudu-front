<template>
  <div>
    <a-row type="flex" :gutter="10">
      <a-col :xl="5" :lg="24" :md="24" style="margin-bottom: 10px">
        <DeptFilterTree :autoSelectFirst="false" :allowUnselect="true" @select="onDeptSelect" />
      </a-col>
      <a-col :xl="19" :lg="24" :md="24" style="margin-bottom: 10px">
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button @click="reload">刷新</a-button>
            <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">新增</a-button>
            <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :disabled="isDisabledAuth('system:user:export')">导出</a-button>
            <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="biz-import">
                <j-upload-button type="link" @click="handleBizUserImport">导入业务用户</j-upload-button>
              </a-menu-item>
              <a-menu-item key="biz-photo-import">
                <a-button type="link" @click="handleBizUserPhotoImport">导入业务用户照片</a-button>
              </a-menu-item>
              <a-menu-item key="biz-template" @click="downloadBizUserTemplate">
                <Icon icon="ant-design:download-outlined" /> 下载导入业务用户模版
              </a-menu-item>
            </a-menu>
          </template>
          <a-button type="primary">
            业务用户导入
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
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
        <BizPhotoImportModal ref="bizPhotoModalRef" @success="reload" />
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" name="biz-user-list" setup>
import { ref, unref } from 'vue';
import { BasicTable, TableAction, ActionItem, BasicColumn } from '/@/components/Table';
import DeptFilterTree from '/@/views/system/depart/components/DeptFilterTree.vue';
import UserDrawer from './UserDrawer.vue';
import UserRecycleBinModal from './UserRecycleBinModal.vue';
import PasswordModal from './PasswordModal.vue';
import UserAgentModal from './UserAgentModal.vue';
import UserQuitAgentModal from './UserQuitAgentModal.vue';
import UserQuitModal from './UserQuitModal.vue';
import BizPhotoImportModal from './BizPhotoImportModal.vue';
import { useDrawer } from '/@/components/Drawer';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './user.data';
import { listNoCareTenant, deleteUser, batchDeleteUser, getExportUrl, frozenBatch, getBizUserImportUrl, getBizUserPhotoImportUrl, getBizUserTemplateUrl } from './user.api';
import { usePermission } from '/@/hooks/web/usePermission';
import { useMethods } from '/@/hooks/system/useMethods';

const { createMessage, createConfirm } = useMessage();
const { isDisabledAuth } = usePermission();
const [registerDrawer, { openDrawer }] = useDrawer();
const [registerModal, { openModal }] = useModal();
const [registerPasswordModal, { openModal: openPasswordModal }] = useModal();
const [registerAgentModal, { openModal: openAgentModal }] = useModal();
const [registerQuitAgentModal, { openModal: openQuitAgentModal }] = useModal();
const [registerQuitModal, { openModal: openQuitModal }] = useModal();
const bizPhotoModalRef = ref<any>(null);
const selectedDeptId = ref<string | null>(null);
const includeSubDepts = ref<boolean>(true);

const workNoColumn: BasicColumn = { title: '工号', dataIndex: 'workNo', width: 100 };
const bizColumns: BasicColumn[] = [workNoColumn, ...columns.filter((c) => !['username', 'sex', 'birthday', 'departIds_dictText'].includes(c.dataIndex as string))];
const displayColumns = ref<BasicColumn[]>(bizColumns);
const bizSearchSchemas = searchFormSchema.filter((s) => s.field !== 'userType');

const { tableContext, onExportXls } = useListPage({
  designScope: 'user-list-biz',
  tableProps: {
    title: '业务用户',
    api: listNoCareTenant,
    columns: displayColumns,
    size: 'small',
    formConfig: { schemas: bizSearchSchemas },
    actionColumn: { width: 120 },
    beforeFetch: (params) => {
      displayColumns.value = bizColumns;
      Object.assign(params, { column: 'createTime', order: 'desc', userType: 2 });
      if (selectedDeptId.value) {
        Object.assign(params, { parentDeptId: selectedDeptId.value, includeSubDepts: includeSubDepts.value });
      }
      return params;
    },
    afterFetch: (items) => {
      if (Array.isArray(items)) {
        return items.filter((it) => String(it.userType) === '2');
      }
      return items;
    },
  },
  exportConfig: { name: '业务用户列表', url: getExportUrl, params: () => (selectedDeptId.value ? { userType: 2, parentDeptId: selectedDeptId.value, includeSubDepts: includeSubDepts.value } : { userType: 2 }) },
});

const [registerTable, { reload }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

const { handleImportXls, handleExportXls } = useMethods();
function handleBizUserImport(file) {
  return handleImportXls(file, getBizUserImportUrl, reload);
}
function handleBizUserPhotoImport() {
  bizPhotoModalRef.value?.open();
}
function downloadBizUserTemplate() {
  return handleExportXls('业务用户导入模板', getBizUserTemplateUrl, {});
}

function onDeptSelect(data) {
  selectedDeptId.value = data && data.id ? data.id : null;
  reload();
}

function handleCreate() {
  openDrawer(true, { isUpdate: false, showFooter: true, tenantSaas: false, record: { userType: 2, __bizOnly: true } });
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
    { label: '删除', popConfirm: { title: '是否确认删除', confirm: handleDelete.bind(null, record) } },
    { label: '冻结', ifShow: record.status == 1, popConfirm: { title: '确定冻结吗?', confirm: handleFrozen.bind(null, record, 2) } },
    { label: '解冻', ifShow: record.status == 2, popConfirm: { title: '确定解冻吗?', confirm: handleFrozen.bind(null, record, 1) } },
    { label: '代理人', onClick: handleAgentSettings.bind(null, record.username) },
  ];
}
</script>

<style scoped></style>
