<template>
  <PageWrapper title="门禁权限组管理" :contentStyle="{ marginLeft: '0' }">
    <a-row :gutter="16" class="group-layout">
      <a-col :span="8" class="group-left">
        <BasicTable @register="handleRegisterGroupTable">
          <template #tableTitle>
            <div class="table-header">
              <a-space>
                <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">
                  新增权限组
                </a-button>
                <a-button
                  danger
                  preIcon="ant-design:delete-outlined"
                  :disabled="!selectedGroupId"
                  @click="confirmDelete"
                >
                  删除权限组
                </a-button>
              </a-space>
            </div>
          </template>
        </BasicTable>
      </a-col>
      <a-col :span="16" class="group-right">
        <template v-if="currentGroup">
          <a-card title="权限组概览" class="group-card" :bodyStyle="{ padding: '16px 20px' }">
            <a-descriptions :column="2" size="small" bordered layout="horizontal">
              <a-descriptions-item label="权限组名称">{{ currentGroup.groupName }}</a-descriptions-item>
              <a-descriptions-item label="启用时段">{{ currentGroup.periodName }}</a-descriptions-item>
              <a-descriptions-item label="人员数量">{{ currentGroup.memberCount }}</a-descriptions-item>
              <a-descriptions-item label="设备数量">{{ currentGroup.deviceCount }}</a-descriptions-item>
              <a-descriptions-item label="创建时间">{{ currentGroup.createTime }}</a-descriptions-item>
              <a-descriptions-item label="备注" :span="2">
                {{ currentGroup.remark || '暂无备注' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="人员列表" class="group-card" :headStyle="cardHeadStyle">
            <template v-if="currentMembers.length">
              <BasicTable @register="handleRegisterMemberTable" />
            </template>
            <a-empty description="该权限组暂无人员" v-else />
          </a-card>

          <a-card title="设备列表" class="group-card" :headStyle="cardHeadStyle">
            <template v-if="currentDevices.length">
              <BasicTable @register="handleRegisterDeviceTable" />
            </template>
            <a-empty description="该权限组暂无设备" v-else />
          </a-card>
        </template>
        <a-empty v-else description="请选择左侧权限组" class="group-empty" />
      </a-col>
    </a-row>
    <GroupForm @register="registerForm" @success="handleFormSuccess" />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRouter } from 'vue-router';
  import { listAccGroups, getAccGroupDetail, deleteAccGroup, addAccGroup, editAccGroup, listAccGroupMembers, listAccGroupDevices } from './accgroup.api';
  import GroupForm from './groupForm.vue';
  import {
    groupColumns,
    groupSearchFormSchema,
    memberColumns,
    deviceColumns,
    type AccGroupItem,
  } from './accgroup.data';

  const { createMessage, createConfirm } = useMessage();
  const router = useRouter();
  const selectedGroupId = ref<string | null>(null);
  const suppressSelectionEvent = ref(false);

  const groupTableReady = ref(false);
  const memberTableReady = ref(false);
  const deviceTableReady = ref(false);

  const cardHeadStyle = {
    padding: '12px 16px',
  };

  const currentGroup = ref<AccGroupItem | null>(null);
  const currentMembers = ref<any[]>([]);
  const currentDevices = ref<any[]>([]);

  const [internalRegisterGroupTable, { setSelectedRowKeys, reload: reloadGroupTable }] = useTable({
    title: '权限组列表',
    api: listAccGroups,
    columns: groupColumns,
    bordered: true,
    rowKey: 'id',
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      labelAlign: 'right',
      compact: true,
      rowProps: { gutter: 16, align: 'middle' },
      baseColProps: { span: 24 },
      schemas: groupSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: false,
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
    rowSelection: {
      type: 'radio',
      preserveSelectedRowKeys: true,
      onChange: (keys: (string | number)[], rows: AccGroupItem[]) => {
        if (suppressSelectionEvent.value) {
          // 程序同步选择触发的事件，直接跳过，避免重复请求
          suppressSelectionEvent.value = false;
          return;
        }
        const record = rows[0];
        if (record) {
          // 仅当选择发生变化时才加载详情，避免重复调用
          const nextId = String(record.id);
          if (selectedGroupId.value !== nextId) {
            selectedGroupId.value = nextId;
            currentGroup.value = record;
            loadGroupDetail(nextId);
          } else {
            currentGroup.value = record;
          }
        }
      },
    },
  });

  const [internalRegisterMemberTable, { setTableData: setMemberTableData }] = useTable({
    columns: memberColumns,
    dataSource: [],
    bordered: true,
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    showTableSetting: false,
    useSearchForm: false,
    canResize: false,
    scroll: { y: 240 },
  });

  const [internalRegisterDeviceTable, { setTableData: setDeviceTableData }] = useTable({
    columns: deviceColumns,
    dataSource: [],
    bordered: true,
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    showTableSetting: false,
    useSearchForm: false,
    canResize: false,
    scroll: { y: 240 },
  });

  const [registerForm, { openModal }] = useModal();

  function handleRegisterGroupTable(...args: any[]) {
    internalRegisterGroupTable(...args);
    groupTableReady.value = true;
    nextTick(() => {
      syncSelection();
    });
  }

  function handleRegisterMemberTable(...args: any[]) {
    internalRegisterMemberTable(...args);
    memberTableReady.value = true;
    nextTick(refreshMemberTable);
  }

  function handleRegisterDeviceTable(...args: any[]) {
    internalRegisterDeviceTable(...args);
    deviceTableReady.value = true;
    nextTick(refreshDeviceTable);
  }

  async function loadGroupDetail(id: string) {
    try {
      const vo = await getAccGroupDetail(id);
      currentGroup.value = {
        id: vo.id!,
        groupName: vo.groupName,
        periodId: vo.periodId,
        periodName: vo.periodName,
        memberCount: vo.memberCount ?? 0,
        deviceCount: vo.deviceCount ?? 0,
        createTime: vo.createTime ?? '',
        remark: vo.remark,
        members: vo.members ?? [],
        devices: vo.devices ?? [],
      };
      
      // 调用真实API获取关联的人员和设备列表
      await loadGroupMembers(id);
      await loadGroupDevices(id);
    } catch (e) {}
  }

  async function loadGroupMembers(groupId: string) {
    try {
      const response = await listAccGroupMembers(groupId, 1, 100);
      currentMembers.value = response.records || [];
    } catch (e) {
      currentMembers.value = [];
    }
  }

  async function loadGroupDevices(groupId: string) {
    try {
      const response = await listAccGroupDevices(groupId, 1, 100);
      currentDevices.value = response.records || [];
    } catch (e) {
      currentDevices.value = [];
    }
  }

  function refreshMemberTable() {
    if (memberTableReady.value) {
      setMemberTableData(currentMembers.value);
    }
  }

  function refreshDeviceTable() {
    if (deviceTableReady.value) {
      setDeviceTableData(currentDevices.value);
    }
  }

  function refreshAllTables() {
    refreshMemberTable();
    refreshDeviceTable();
  }

  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }

  function handleEdit(record: AccGroupItem) {
    openModal(true, {
      isUpdate: true,
      record,
    });
  }

  function confirmDelete() {
    if (!selectedGroupId.value) return;
    createConfirm({
      title: '删除权限组',
      content: `确认删除当前选中的权限组吗？`,
      iconType: 'warning',
      onOk: () => handleDelete(selectedGroupId.value!),
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteAccGroup(id);
      createMessage.success('删除成功');
      selectedGroupId.value = null;
      currentGroup.value = null;
      await reloadGroupTable();
      syncSelection();
    } catch (e: any) {
      createMessage.error(e?.message || '删除失败');
    }
  }

  function handleFormSuccess(payload: { record: AccGroupItem; isUpdate: boolean; detail?: Record<string, any> }) {
    const { record, isUpdate, detail } = payload;
    const vo = {
      id: isUpdate ? record.id : undefined,
      groupName: record.groupName,
      periodId: record.periodId,
      remark: record.remark,
      members: detail?.members?.map((m: any) => m.id) ?? record.members ?? [],
      devices: detail?.devices?.map((d: any) => d.id) ?? record.devices ?? [],
    };
    (async () => {
      try {
        const resp = isUpdate ? await editAccGroup(vo) : await addAccGroup(vo);
        createMessage.success(isUpdate ? '权限组信息已更新' : '已创建新的权限组');
        await reloadGroupTable();
        selectedGroupId.value = resp.id!;
        await loadGroupDetail(resp.id!);
        nextTick(() => {
          refreshAllTables();
          syncSelection();
        });
      } catch (e: any) {
        createMessage.error(e?.message || '提交失败');
      }
    })();
  }

  function syncSelection() {
    if (groupTableReady.value) {
      // 标记为程序触发的选择变更，避免触发 onChange 再次请求
      suppressSelectionEvent.value = true;
      setSelectedRowKeys?.(selectedGroupId.value ? [selectedGroupId.value] : []);
    }
  }

  watch(currentMembers, () => {
    refreshMemberTable();
  });

  watch(currentDevices, () => {
    refreshDeviceTable();
  });

  watch(selectedGroupId, () => {
    nextTick(() => {
      refreshMemberTable();
      refreshDeviceTable();
      syncSelection();
    });
  });
</script>

<style scoped>
  .group-layout {
    align-items: stretch;
  }

  .group-left,
  .group-right {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* 去除左侧列因 gutter 带来的左内边距，贴齐窗口左缘 */
  .group-left {
    padding-left: 0 !important;
  }

  .group-right {
    gap: 16px;
  }

  .group-card {
    flex: none;
  }

  .group-empty {
    margin-top: 80px;
  }

  .table-header {
    display: flex;
    justify-content: flex-start;
    /* 与上方搜索表单保持一定间距 */
    margin-top: 10px;
  }

  /* 搜索表单左对齐与项间距优化 */
  .group-left :deep(.ant-form-inline) {
    justify-content: flex-start;
  }

  .group-left :deep(.ant-form-inline .ant-form-item) {
    margin-right: 12px;
    margin-bottom: 8px;
  }

  /* 去除卡片内容区左内边距，确保表单标签贴边 */
  .group-left :deep(.ant-card-body) {
    padding-left: 0 !important;
  }
</style>
