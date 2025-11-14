<template>
  <div class="p-2">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" preIcon="ant-design:unlock-outlined" @click="handleRemoteOpenClick">远程开门</a-button>
          <a-button danger preIcon="ant-design:lock-outlined" @click="handleRemoteCloseClick">远程关门</a-button>
          <a-button preIcon="ant-design:alert-outlined" @click="handleCancelAlarmClick">取消报警</a-button>
          <a-button preIcon="ant-design:pause-circle-outlined" @click="handleHoldOpenClick">远程常开</a-button>
          <a-button preIcon="ant-design:lock-outlined" @click="handleLockDoorClick">远程锁定</a-button>
          <a-button preIcon="ant-design:unlock-outlined" @click="handleUnlockDoorClick">远程解锁</a-button>
          <a-button preIcon="ant-design:calendar-outlined" @click="handleEnableTodayAlwaysOpenClick">启动当天常开时间段</a-button>
          <a-button danger preIcon="ant-design:stop-outlined" @click="handleDisableTodayAlwaysOpenClick">禁用当天常开时间段</a-button>
        </a-space>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <AccDoorModal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="acc-door-list" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { columns, searchFormSchema } from './accdoor.data';
  import { listDoor, deleteDoor, getDoorDetail, remoteOpenDoor, remoteCloseDoor, remoteCancelAlarm, remoteHoldOpen, remoteLockDoor, remoteUnlockDoor, enableTodayAlwaysOpen, disableTodayAlwaysOpen } from './accdoor.api';
  import AccDoorModal from './AccDoorModal.vue';
  import { Modal, InputNumber } from 'ant-design-vue';
  import { h, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      title: '门列表',
      api: listDoor,
      columns,
      formConfig: { labelWidth: 120, schemas: searchFormSchema },
      showIndexColumn: true,
      actionColumn: { width: 160, title: '操作', slots: { customRender: 'action' } },
      rowSelection: { type: 'checkbox' },
    },
  });
  const { createMessage } = useMessage();
  const [registerTable, { reload }, { selectedRows, selectedRowKeys }] = tableContext;
  const [registerModal, { openModal }] = useModal();

  function handleCreate() {
    openModal(true, { isUpdate: false });
  }

  function handleEdit(record) {
    openModal(true, { isUpdate: true, id: record.id });
  }

  function handleDetail(record) {
    getDoorDetail({ id: record.id }).then((res) => {
      const data = res?.result || {};
      const content = Object.keys(data)
        .map((k) => `${k}: ${data[k]}`)
        .join('\n');
      Modal.info({ title: '门详情', content: content.replace(/\n/g, '<br/>') });
    });
  }

  function handleDelete(record) {
    deleteDoor({ id: record.id }, reload);
  }

  function getTableAction(record) {
    return [
      { label: '编辑', icon: 'ant-design:edit-outlined', onClick: handleEdit.bind(null, record) },
      { label: '详情', icon: 'ant-design:info-circle-outlined', onClick: handleDetail.bind(null, record) },
    ];
  }

  function ensureSelectedIds(): string[] | null {
    const rows = selectedRows?.value || [];
    if (!rows.length) {
      createMessage.warning('请先勾选至少一条门记录');
      return null;
    }
    const ids = rows.map((r) => r.id).filter(Boolean);
    if (!ids.length) {
      createMessage.warning('选中记录缺少ID，无法操作');
      return null;
    }
    return ids;
  }

  function promptPulseSeconds(defaultSeconds = 5): Promise<number> {
    return new Promise((resolve, reject) => {
      const seconds = ref<number>(defaultSeconds);
      const vnode = h(InputNumber, {
        min: 1,
        max: 99,
        value: seconds.value,
        style: 'width: 100%',
        onChange: (val: number) => {
          const v = Number(val);
          seconds.value = isNaN(v) ? defaultSeconds : Math.max(1, Math.min(v, 99));
        },
      });
      Modal.confirm({
        title: '请输入开门时间（秒）',
        content: vnode,
        okText: '确定',
        cancelText: '取消',
        onOk: () => resolve(seconds.value),
        onCancel: () => reject(new Error('cancel')),
      });
    });
  }

  async function handleRemoteOpenClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      const seconds = await promptPulseSeconds(5);
      await remoteOpenDoor(ids, seconds);
      createMessage.success(`已下发开门命令（${ids.length}），时间 ${seconds} 秒`);
    } catch (e) {
      if (e && e.message === 'cancel') return;
      createMessage.error('开门失败，请稍后重试');
    }
  }

  async function handleRemoteCloseClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await remoteCloseDoor(ids);
      createMessage.success(`已下发关门命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('关门失败，请稍后重试');
    }
  }

  async function handleCancelAlarmClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await remoteCancelAlarm(ids);
      createMessage.success(`已下发取消报警命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('取消报警失败，请稍后重试');
    }
  }

  async function handleHoldOpenClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await remoteHoldOpen(ids);
      createMessage.success(`已下发远程常开命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('远程常开失败，请稍后重试');
    }
  }

  async function handleLockDoorClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await remoteLockDoor(ids);
      createMessage.success(`已下发远程锁定命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('远程锁定失败，请稍后重试');
    }
  }

  async function handleUnlockDoorClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await remoteUnlockDoor(ids);
      createMessage.success(`已下发远程解锁命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('远程解锁失败，请稍后重试');
    }
  }

  async function handleEnableTodayAlwaysOpenClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await enableTodayAlwaysOpen(ids);
      createMessage.success(`已下发启动当天常开时间段命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('启动当天常开时间段失败，请稍后重试');
    }
  }

  async function handleDisableTodayAlwaysOpenClick() {
    const ids = ensureSelectedIds();
    if (!ids) return;
    try {
      await disableTodayAlwaysOpen(ids);
      createMessage.success(`已下发禁用当天常开时间段命令（${ids.length}）`);
    } catch (e) {
      createMessage.error('禁用当天常开时间段失败，请稍后重试');
    }
  }
</script>
<style scoped></style>