<template>
  <PageWrapper title="门禁权限组管理">
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
              <a-descriptions-item label="启用时段">{{ currentGroup.timeRange }}</a-descriptions-item>
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
  import GroupForm from './groupForm.vue';
  import {
    groupColumns,
    groupSearchFormSchema,
    mockGroupList,
    memberColumns,
    deviceColumns,
    mockMemberList,
    mockDeviceList,
    type AccGroupItem,
  } from './accgroup.data';

  const { createMessage, createConfirm } = useMessage();
  const dataSource = ref<AccGroupItem[]>([...mockGroupList]);
  const selectedGroupId = ref<string | null>(dataSource.value[0]?.id ?? null);

  const groupTableReady = ref(false);
  const memberTableReady = ref(false);
  const deviceTableReady = ref(false);

  const cardHeadStyle = {
    padding: '12px 16px',
  };

  const currentGroup = computed(() => {
    if (!selectedGroupId.value) return null;
    return dataSource.value.find((item) => item.id === selectedGroupId.value) ?? null;
  });

  const currentMembers = computed(() => {
    if (!currentGroup.value?.members?.length) return [];
    return mockMemberList.filter((member) => currentGroup.value!.members!.includes(member.id));
  });

  const currentDevices = computed(() => {
    if (!currentGroup.value?.devices?.length) return [];
    return mockDeviceList.filter((device) => currentGroup.value!.devices!.includes(device.id));
  });

  const [internalRegisterGroupTable, { setTableData: setGroupTableData, setSelectedRowKeys }] = useTable({
    title: '权限组列表',
    columns: groupColumns,
    dataSource: dataSource.value,
    bordered: true,
    rowKey: 'id',
    formConfig: {
      labelWidth: 100,
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
        const record = rows[0];
        if (record) {
          selectedGroupId.value = record.id;
        }
      },
    },
    onRow: (record: AccGroupItem) => {
      return {
        onClick: () => {
          selectedGroupId.value = record.id;
        },
      };
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
      refreshGroupTable();
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

  function refreshGroupTable() {
    if (groupTableReady.value) {
      setGroupTableData([...dataSource.value]);
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
    refreshGroupTable();
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
    const record = dataSource.value.find((item) => item.id === selectedGroupId.value);
    if (!record) return;
    createConfirm({
      title: '删除权限组',
      content: `确认删除权限组“${record.groupName}”吗？`,
      iconType: 'warning',
      onOk: () => handleDelete(record),
    });
  }

  function handleDelete(record: AccGroupItem) {
    dataSource.value = dataSource.value.filter((item) => item.id !== record.id);
    if (selectedGroupId.value === record.id) {
      selectedGroupId.value = dataSource.value[0]?.id ?? null;
    }
    nextTick(() => {
      refreshAllTables();
      syncSelection();
    });
    createMessage.success('已删除该权限组（示例数据）');
  }

  function handleFormSuccess(payload: { record: AccGroupItem; isUpdate: boolean; detail?: Record<string, any> }) {
    const { record, isUpdate } = payload;
    if (isUpdate) {
      const index = dataSource.value.findIndex((item) => item.id === record.id);
      if (index > -1) {
        dataSource.value.splice(index, 1, record);
      }
    } else {
      dataSource.value = [{ ...record }, ...dataSource.value];
    }
    selectedGroupId.value = record.id;
    nextTick(() => {
      refreshAllTables();
      syncSelection();
    });
    createMessage.success(isUpdate ? '权限组信息已更新' : '已创建新的权限组');
  }

  function syncSelection() {
    if (groupTableReady.value) {
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
  }
</style>
