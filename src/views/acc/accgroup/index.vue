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
            <template #extra>
              <a-space>
                <a-button type="primary" :disabled="!selectedGroupId" @click="openMemberSelect">添加人员</a-button>
                <a-button danger :disabled="memberSelectedRowKeys.length === 0 || !selectedGroupId" @click="removeSelectedMembers">移除所选</a-button>
              </a-space>
            </template>
            <template v-if="currentMembers.length">
              <BasicTable @register="handleRegisterMemberTable" />
            </template>
            <a-empty description="该权限组暂无人员" v-else />
          </a-card>

          <a-card title="门列表" class="group-card" :headStyle="cardHeadStyle">
            <template #extra>
              <a-space>
                <a-button type="primary" :disabled="!selectedGroupId" @click="openDoorSelect">添加门</a-button>
                <a-button danger :disabled="deviceSelectedRowKeys.length === 0 || !selectedGroupId" @click="removeSelectedDoors">移除所选门</a-button>
              </a-space>
            </template>
            <template v-if="currentDevices.length">
              <BasicTable @register="handleRegisterDeviceTable" />
            </template>
            <a-empty description="该权限组暂无门" v-else />
          </a-card>
        </template>
        <a-empty v-else description="请选择左侧权限组" class="group-empty" />
      </a-col>
    </a-row>
    <GroupForm @register="registerForm" @success="handleFormSuccess" />
    <!-- 用户选择弹窗（仅业务用户） -->
    <UserSelectModalBiz :multi="true" @register="registerUserSelectModal" @selected="onMemberSelected" />
    <!-- 门选择弹窗 -->
    <BasicModal @register="registerDeviceSelectModal" :title="'选择门'" width="900px" @ok="onDoorSelectOk">
      <BasicTable
        @register="registerDeviceSelectTable"
        :rowSelection="deviceSelectRowSelection"
        :useSearchForm="true"
        :formConfig="{ showActionButtonGroup: false }"
      />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRouter } from 'vue-router';
  import { listAccGroups, getAccGroupDetail, deleteAccGroup, addAccGroup, editAccGroup, listAccGroupMembers, listAccGroupDevices, addMembersToGroup, removeMembersFromGroup, addDevicesToGroup, removeDevicesFromGroup } from './accgroup.api';
  import GroupForm from './groupForm.vue';
  import {
    groupColumns,
    groupSearchFormSchema,
    memberColumns,
    type AccGroupItem,
  } from './accgroup.data';
  import UserSelectModalBiz from '/@/components/Form/src/jeecg/components/userSelect/UserSelectModalBiz.vue';
  import { columns as doorColumns, searchFormSchema as doorSearchFormSchema } from '/@/views/acc/accdoor/accdoor.data';
  import { listDoor, /* new */ listDoorByGroup, getDoorDetail } from '/@/views/acc/accdoor/accdoor.api';
  import { getAccDeviceBySn } from '/@/views/acc/devce.api';

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
  const memberSelectedRowKeys = ref<string[]>([]);
  const deviceSelectedRowKeys = ref<string[]>([]);

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
    rowKey: 'id',
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    showTableSetting: false,
    useSearchForm: false,
    canResize: false,
    scroll: { y: 240 },
    rowSelection: {
      type: 'checkbox',
      preserveSelectedRowKeys: true,
      onChange: (keys: (string | number)[]) => {
        memberSelectedRowKeys.value = (keys || []).map(String);
      },
    },
  });

  const [internalRegisterDeviceTable, { setTableData: setDeviceTableData }] = useTable({
    columns: doorColumns,
    dataSource: [],
    bordered: true,
    rowKey: 'id',
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    showTableSetting: false,
    useSearchForm: false,
    canResize: false,
    scroll: { y: 240 },
    rowSelection: {
      type: 'checkbox',
      preserveSelectedRowKeys: true,
      onChange: (keys: (string | number)[], rows: any[]) => {
        deviceSelectedRowKeys.value = (keys || []).map(String);
        selectedDoorRowsForRemove.value = rows || [];
      },
    },
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
      const raw = response?.records || [];
      // 统一映射为 AccMemberItem 结构，确保列（workNo/name/dept）正常显示
      currentMembers.value = raw.map((r: any) => ({
        id: String(r.id ?? r.memberId ?? r.userId ?? ''),
        workNo: String(
          r.workNo ??
          r.memberCode ??
          r.userCode ??
          r.employeeNo ??
          r.employeeId ??
          r.jobNo ??
          r.work_code ??
          r.work_no ??
          ''
        ),
        name: String(r.name ?? r.memberName ?? r.realname ?? r.username ?? ''),
        dept: String(r.dept ?? r.department ?? r.orgCodeTxt ?? r.departName ?? ''),
      }));
    } catch (e) {
      currentMembers.value = [];
    }
  }

  async function loadGroupDevices(groupId: string) {
    try {
      const response = await listDoorByGroup(groupId, 1, 100);
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

  // 选择成员并添加到当前组
  const [registerUserSelectModal, { openModal: openUserSelectModal, closeModal: closeUserSelectModal }] = useModal();
  function openMemberSelect() {
    if (!selectedGroupId.value) return;
    // 传入已在组内的用户，避免重复选择
    const excludeIds = (currentMembers.value || []).map((m: any) => String(m.id)).filter(Boolean);
    openUserSelectModal(true, { excludeUserIdList: excludeIds });
  }

  async function onMemberSelected(users: any[]) {
    if (!selectedGroupId.value) return;
    const ids = (users || []).map((u: any) => String(u.id)).filter(Boolean);
    if (!ids.length) return;
    try {
      await addMembersToGroup(selectedGroupId.value, ids);
      createMessage.success('已添加所选人员');
      await loadGroupMembers(selectedGroupId.value);
      // 成功后关闭选择用户弹窗
      closeUserSelectModal();
    } catch (e: any) {
      createMessage.error(e?.message || '添加人员失败');
    }
  }

  async function removeSelectedMembers() {
    if (!selectedGroupId.value || memberSelectedRowKeys.value.length === 0) return;
    try {
      await removeMembersFromGroup(selectedGroupId.value, memberSelectedRowKeys.value);
      createMessage.success('已移除所选人员');
      memberSelectedRowKeys.value = [];
      await loadGroupMembers(selectedGroupId.value);
    } catch (e: any) {
      createMessage.error(e?.message || '移除人员失败');
    }
  }

  // 选择门并添加到当前组
  const [registerDeviceSelectModal, deviceModal] = useModal();
  const [registerDeviceSelectTable, deviceSelectTable] = useTable({
    title: '门列表',
    api: (params) => listDoor({ ...params }),
    columns: doorColumns,
    rowKey: 'id',
    bordered: true,
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      labelAlign: 'right',
      compact: true,
      showAdvancedButton: false,
      schemas: doorSearchFormSchema,
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
  });

  const deviceSelectKeys = ref<string[]>([]);
  const doorSelectRows = ref<any[]>([]);
  const deviceSelectRowSelection = {
    type: 'checkbox',
    onChange: (keys: (string | number)[], rows: any[]) => {
      deviceSelectKeys.value = (keys || []).map(String);
      doorSelectRows.value = rows || [];
    },
  } as any;

  function openDoorSelect() {
    if (!selectedGroupId.value) return;
    deviceModal.openModal(true);
  }

  async function onDoorSelectOk() {
    if (!selectedGroupId.value || deviceSelectKeys.value.length === 0) return;
    try {
      // 将所选门映射为设备ID
      const sns = (doorSelectRows.value || []).map((r: any) => String(r.deviceSn || '')).filter(Boolean);
      const deviceIds: string[] = [];
      for (const sn of sns) {
        const dev = await getAccDeviceBySn({ sn });
        if (dev?.id) deviceIds.push(String(dev.id));
      }
      if (deviceIds.length === 0) {
        createMessage.warning('未找到对应设备，请检查门的设备序列号');
        return;
      }
      await addDevicesToGroup(selectedGroupId.value, deviceIds);
      createMessage.success('已添加所选门');
      deviceSelectKeys.value = [];
      doorSelectRows.value = [];
      await loadGroupDevices(selectedGroupId.value);
      deviceModal.closeModal();
    } catch (e: any) {
      createMessage.error(e?.message || '添加门失败');
    }
  }

  const selectedDoorRowsForRemove = ref<any[]>([]);
  async function removeSelectedDoors() {
    if (!selectedGroupId.value || deviceSelectedRowKeys.value.length === 0) return;
    try {
      // 将所选门映射为设备ID
      const sns = (selectedDoorRowsForRemove.value || []).map((r: any) => String(r.deviceSn || '')).filter(Boolean);
      const deviceIds: string[] = [];
      for (const sn of sns) {
        const dev = await getAccDeviceBySn({ sn });
        if (dev?.id) deviceIds.push(String(dev.id));
      }
      if (deviceIds.length === 0) {
        createMessage.warning('未找到对应设备，请检查门的设备序列号');
        return;
      }
      await removeDevicesFromGroup(selectedGroupId.value, deviceIds);
      createMessage.success('已移除所选门');
      deviceSelectedRowKeys.value = [];
      selectedDoorRowsForRemove.value = [];
      await loadGroupDevices(selectedGroupId.value);
    } catch (e: any) {
      createMessage.error(e?.message || '移除门失败');
    }
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
    (async () => {
      try {
        // 将所选“门”转换为设备ID，以匹配后端 acc_group_device 表的 device_id
        let deviceIds: string[] = [];
        if (detail?.devices && Array.isArray(detail.devices) && detail.devices.length > 0) {
          const candidates = detail.devices as any[];
          const ids: string[] = [];
          for (const d of candidates) {
            const sn = String(d?.deviceSn || '');
            if (sn) {
              const dev = await getAccDeviceBySn({ sn });
              if (dev?.id) ids.push(String(dev.id));
            } else if (d?.id) {
              // 回退：缺少 deviceSn 时，根据门ID查询详情再映射
              try {
                const det = await getDoorDetail({ id: d.id });
                const door = det?.result ?? det;
                const sn2 = String(door?.deviceSn || '');
                if (sn2) {
                  const dev2 = await getAccDeviceBySn({ sn: sn2 });
                  if (dev2?.id) ids.push(String(dev2.id));
                }
              } catch (_) {
                // ignore
              }
            }
          }
          // 去重
          deviceIds = Array.from(new Set(ids));
        } else {
          // 无门详情时，沿用 record.devices（可能是设备ID列表，编辑场景）
          deviceIds = record.devices ?? [];
        }

        const vo = {
          id: isUpdate ? record.id : undefined,
          groupName: record.groupName,
          periodId: record.periodId,
          remark: record.remark,
          members: detail?.members?.map((m: any) => m.id) ?? record.members ?? [],
          devices: deviceIds,
        };

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
