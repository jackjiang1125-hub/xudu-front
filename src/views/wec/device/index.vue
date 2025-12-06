<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleSearchPending">搜索待添加设备</a-button>
      <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:download-outlined" @click="handleDownloadTool">下载搜索工具</a-button>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined" :loading="operating">
          远程控制
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="start">设备启用</a-menu-item>
            <a-menu-item key="stop">设备停用</a-menu-item>
            <a-menu-item key="restart">设备重启</a-menu-item>
            <a-menu-item key="factoryReset">恢复出厂设置</a-menu-item>
            <a-menu-item key="syncTime">同步时间</a-menu-item>
            <a-menu-item key="enableBlacklist">启用黑名单</a-menu-item>
            <a-menu-item key="enableWhitelist">启用白名单</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
    </template>
    <template #onlineStatus="{ record }">
      <Icon
        :icon="isOnline(record) ? 'ant-design:check-circle-filled' : 'ant-design:close-circle-filled'"
        :color="isOnline(record) ? '#52c41a' : '#ff4d4f'"
        :size="16"
      />
    </template>
  </BasicTable>
  <BasicDrawer v-model:visible="drawerVisible" title="设备信息" width="720px" :showFooter="false">
    <DeviceForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>

  <!-- 搜索设备弹窗 -->
  <BasicModal @register="registerSearchModal" title="搜索待添加设备" width="800px" :showFooter="false">
    <div style="margin-bottom: 16px">
       <a-input-search
        v-model:value="searchKeyword"
        placeholder="输入序列号或IP地址搜索"
        enter-button="搜索"
        size="large"
        @search="onSearch"
      />
    </div>
    <BasicTable @register="registerSearchTable">
      <template #action="{ record }">
        <a-button type="link" size="small" @click="handleOpenAddConfirm(record)">添加</a-button>
      </template>
    </BasicTable>
  </BasicModal>

  <!-- 添加设备确认弹窗 -->
  <BasicModal @register="registerAddConfirmModal" title="添加设备" width="500px" @ok="handleConfirmAdd">
    <div style="padding: 20px">
      <a-form layout="vertical">
        <a-form-item label="设备名称" required>
          <a-input v-model:value="addForm.deviceName" placeholder="请输入设备名称" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="addForm.resetData">重置设备数据</a-checkbox>
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>

  <BasicModal @register="registerUpdateSnModal" title="修改设备号" width="500px" @ok="handleConfirmUpdateSn">
    <div style="padding: 20px">
      <a-alert message="警告" description="修改设备号会导致设备离线约1分钟，期间无法接收指令。请确保新机号与设备硬件设置一致。" type="warning" show-icon style="margin-bottom: 16px" />
      <a-form layout="vertical">
        <a-form-item label="原机号">
          <a-input v-model:value="updateSnForm.oldSn" disabled />
        </a-form-item>
        <a-form-item label="新机号" required>
          <a-input-number v-model:value="updateSnForm.newSn" :min="1" :max="65535" :precision="0" style="width: 100%" placeholder="请输入新机号(1-65535)" />
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { BasicModal, useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { columns, searchFormSchema } from './device.data';
import DeviceForm from './DeviceForm.vue';
import { listWecDevices, deleteWecDevice, startDevice, stopDevice, restartDevice, factoryResetDevice, syncDeviceTime, enableBlacklist, enableWhitelist, searchPendingDevices, addWecDevice, editWecDevice, type WecDeviceModel } from './device.api';
import { BasicColumn } from '/@/components/Table';
import { Icon } from '/@/components/Icon';
import dayjs from 'dayjs';

const { createMessage, createConfirm } = useMessage();

const [registerTable, { reload, getSelectRows }] = useTable({
  api: listWecDevices,
  rowKey: 'id',
  columns,
  actionColumn: { width: 140, fixed: 'right', title: '操作', slots: { customRender: 'action' } },
  rowSelection: { type: 'checkbox', preserveSelectedRowKeys: true },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});
const operating = ref(false);

function isOnline(record: any) {
  if (!record) return false;
  // 如果有明确的 online 字段
  if (record.online !== undefined && record.online !== null) return !!record.online;
  
  // 根据 lastHeartbeatTime 判断 (假设心跳间隔 60s，容差到 70s)
  const t = record.lastHeartbeatTime;
  if (!t) return false;
  const now = dayjs();
  const hb = dayjs(t);
  // 1分钟心跳，给70秒或者更长的宽容度
  return now.diff(hb, 'second') <= 70;
}

function handleEdit(record: WecDeviceModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); }

function handleDelete(record: WecDeviceModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除设备【${record.deviceName}】吗？`,
    async onOk() {
      await deleteWecDevice(String(record.id));
      createMessage.success('删除成功');
      reload();
    },
  });
}

function getTableActions(record: WecDeviceModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}

function getDropDownActions(record: WecDeviceModel) {
  return [
    { label: '修改机号', onClick: handleOpenUpdateSn.bind(null, record) }
  ];
}

const [registerUpdateSnModal, { openModal: openUpdateSnModal, closeModal: closeUpdateSnModal }] = useModal();
const updateSnForm = ref({ id: '', oldSn: '', newSn: null as number | null });

function handleOpenUpdateSn(record: any) {
  updateSnForm.value = {
    id: record.id,
    oldSn: record.sn,
    newSn: null
  };
  openUpdateSnModal(true);
}

async function handleConfirmUpdateSn() {
  if (!updateSnForm.value.newSn) {
    createMessage.warning('请输入新机号');
    return;
  }
  try {
    await editWecDevice({
      id: updateSnForm.value.id,
      sn: String(updateSnForm.value.newSn)
    });
    createMessage.success('指令已下发，请等待设备重连');
    closeUpdateSnModal();
    reload();
  } catch (e) {
    createMessage.error('修改失败');
  }
}

async function onOperationSelect({ key }: any) {
  const rows = getSelectRows?.() || [];
  const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
  if (sns.length === 0) { createMessage.warning('请选择设备'); return; }
  try {
    operating.value = true;
    if (key === 'start') await startDevice(sns);
    if (key === 'stop') await stopDevice(sns);
    if (key === 'restart') await restartDevice(sns);
    if (key === 'syncTime') await syncDeviceTime(sns);
    if (key === 'enableBlacklist') await enableBlacklist(sns);
    if (key === 'enableWhitelist') await enableWhitelist(sns);
    if (key === 'factoryReset') {
      operating.value = false; // 提前结束loading，因为是弹窗操作
      createConfirm({
        title: '确认恢复出厂设置',
        content: '确定要恢复出厂设置吗？恢复出厂设置不影响设备的IP端口。',
        iconType: 'warning',
        onOk: async () => {
           try {
             await factoryResetDevice(sns);
             createMessage.success('操作已下发');
           } catch (e) {
             createMessage.error('操作失败');
           }
        },
      });
      return; // 退出函数，避免最后finally把operating设为false（虽然这里已经是false了，但逻辑上区分开）
    }
    createMessage.success('操作已下发');
  } catch (e) {
    createMessage.error('操作失败');
  } finally {
    operating.value = false;
  }
}

// --- 搜索设备逻辑 ---
const searchKeyword = ref('');
const [registerSearchModal, { openModal: openSearchModal, closeModal: closeSearchModal }] = useModal();
const [registerSearchTable, { setTableData, setLoading }] = useTable({
  columns: [
    { title: '序列号', dataIndex: 'sn', width: 150 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 150 },
  ] as BasicColumn[],
  rowKey: 'sn',
  showIndexColumn: false,
  pagination: false,
  maxHeight: 400,
  actionColumn: { width: 100, title: '操作', slots: { customRender: 'action' } },
});

function handleDownloadTool() {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = '/resource/tools/NetModuleConfig_7_20.exe';
  link.setAttribute('download', 'NetModuleConfig_7_20.exe');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleSearchPending() {
  searchKeyword.value = '';
  openSearchModal(true);
  // 延迟加载，确保 Table 实例已注册
  setTimeout(() => {
    setTableData([]);
    onSearch(''); // Load initial list
  }, 100);
}

async function onSearch(value: string) {
  try {
    setLoading(true);
    const res = await searchPendingDevices(value);
    setTableData(res);
  } catch (e) {
    createMessage.error('查询失败');
  } finally {
    setLoading(false);
  }
}

// --- 添加确认逻辑 ---
const [registerAddConfirmModal, { openModal: openConfirmModal, closeModal: closeConfirmModal }] = useModal();
const addForm = ref({ deviceName: '', resetData: false, sn: '', ipAddress: '' });

function handleOpenAddConfirm(record: any) {
  addForm.value = {
    deviceName: record.deviceName || `设备-${record.sn}`,
    resetData: false,
    sn: record.sn,
    ipAddress: record.ipAddress
  };
  openConfirmModal(true);
}

async function handleConfirmAdd() {
  if (!addForm.value.deviceName) {
    createMessage.warning('请输入设备名称');
    return;
  }
  try {
    await addWecDevice({
      sn: addForm.value.sn,
      deviceName: addForm.value.deviceName,
      ipAddress: addForm.value.ipAddress,
      deviceType: 'water_control',
      status: '1',
      resetData: addForm.value.resetData // Pass reset flag to backend
    });
    createMessage.success('添加成功');
    closeConfirmModal();
    closeSearchModal();
    reload();
  } catch (e) {
    createMessage.error('添加失败');
  }
}

</script>
