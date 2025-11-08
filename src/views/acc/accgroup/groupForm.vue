<template>
  <BasicModal
    @register="registerModal"
    :title="modalTitle"
    :width="isUpdate ? 560 : 960"
    :maskClosable="false"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
    <a-divider v-if="!isUpdate" orientation="left">授权对象配置</a-divider>

    <a-card v-if="!isUpdate" class="selected-overview" :bodyStyle="{ padding: '12px 16px' }" bordered>
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="overview-title">
            <span class="overview-label">已选择人员</span>
            <a-badge :count="selectedMemberRows.length" show-zero />
            <a-button type="link" size="small" @click="clearMembers" v-if="selectedMemberRows.length">清空</a-button>
          </div>
          <template v-if="selectedMemberRows.length">
            <a-list :data-source="memberPreview" :split="false" class="overview-list">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-space :size="8">
                    <a-avatar :size="28">{{ item.name.slice(-2) }}</a-avatar>
                    <div class="item-meta">
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-desc">工号 {{ item.workNo || '-' }} ｜ {{ item.dept }} ｜ {{ item.position || '' }}</div>
                    </div>
                    <a-button type="link" size="small" @click="removeMember(item.id)">移除</a-button>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <div class="more-hint" v-if="memberMoreCount">还有 {{ memberMoreCount }} 人...</div>
          </template>
          <a-empty description="暂无已选人员" v-else />
        </a-col>
        <a-col :span="12">
          <div class="overview-title">
            <span class="overview-label">已选择门</span>
            <a-badge :count="selectedDoorRows.length" show-zero />
            <a-button type="link" size="small" @click="clearDoors" v-if="selectedDoorRows.length">清空</a-button>
          </div>
          <template v-if="selectedDoorRows.length">
            <a-list :data-source="doorPreview" :split="false" class="overview-list">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-space :size="8">
                    <a-avatar :size="28" shape="square">{{ (item.doorName || item.deviceName || '').slice(0, 2) }}</a-avatar>
                    <div class="item-meta">
                      <div class="item-name">{{ item.deviceName }} ｜ {{ item.doorName }}</div>
                      <div class="item-desc">序列号 {{ item.deviceSn }}</div>
                    </div>
                    <a-button type="link" size="small" @click="removeDoor(item.id)">移除</a-button>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <div class="more-hint" v-if="doorMoreCount">还有 {{ doorMoreCount }} 个...</div>
          </template>
          <a-empty description="暂无已选门" v-else />
        </a-col>
      </a-row>
    </a-card>

    <a-tabs v-if="!isUpdate" v-model:activeKey="activeTab" class="selector-tabs">
      <a-tab-pane key="member" tab="人员授权">
        <BasicTable @register="registerMemberTable" size="small">
          <template #tableTitle>
            <a-alert type="info" show-icon message="可通过条件过滤后勾选多个员工" />
          </template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane key="door" tab="门授权">
        <BasicTable @register="registerDoorTable" size="small">
          <template #tableTitle>
            <a-alert type="info" show-icon message="支持按设备名称、门名称或IP地址快速定位" />
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable } from '/@/components/Table';
  import { listTimePeriods } from '../timeperiod/timeperiod.api';
  import {
    memberColumns,
    memberSearchFormSchema,
    fetchAccMemberList,
    type AccMemberItem,
    type AccGroupItem,
  } from './accgroup.data';
  import { columns as doorColumns, searchFormSchema as doorSearchFormSchema } from '../accdoor/accdoor.data';
  import { listDoor } from '../accdoor/accdoor.api';
  import { dateUtil } from '/@/utils/dateUtil';

  type MemberItem = AccMemberItem;
  interface DoorItem {
    id: string;
    deviceName?: string;
    doorName?: string;
    deviceSn?: string;
    ipAddress?: string;
    authorized?: string;
  }

  interface GroupDetailPayload {
    members: MemberItem[];
    devices: DoorItem[];
  }

  interface GroupFormEmit {
    (e: 'register', ...args: any[]): void;
    (e: 'success', payload: { record: AccGroupItem; isUpdate: boolean; detail: GroupDetailPayload }): void;
  }

  interface GroupFormProps {
    record?: AccGroupItem;
    isUpdate?: boolean;
  }

  const emit = defineEmits<GroupFormEmit>();

  const activeTab = ref('member');
  const isUpdate = ref(false);
  const currentRecord = ref<AccGroupItem | null>(null);
  const selectedMemberRows = ref<MemberItem[]>([]);
  const selectedDoorRows = ref<DoorItem[]>([]);
  const selectedMemberKeys = ref<string[]>([]);
  const selectedDoorKeys = ref<string[]>([]);

  const memberPreview = computed(() => selectedMemberRows.value.slice(0, 5));
  const doorPreview = computed(() => selectedDoorRows.value.slice(0, 5));
  const memberMoreCount = computed(() => Math.max(0, selectedMemberRows.value.length - memberPreview.value.length));
  const doorMoreCount = computed(() => Math.max(0, selectedDoorRows.value.length - doorPreview.value.length));

  const periodName = ref<string>('');

  const modalTitle = computed(() => (isUpdate.value ? '编辑权限组' : '新增权限组'));

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 100,
    labelAlign: 'right',
    compact: true,
    rowProps: { gutter: 16 },
    baseColProps: { span: 12 },
    showActionButtonGroup: false,
    schemas: [
      {
        field: 'groupName',
        label: '权限组名称',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入权限组名称',
          allowClear: true,
          maxlength: 32,
          showCount: true,
          size: 'middle',
        },
      },
      {
        field: 'periodId',
        label: '授权时间段',
        component: 'ApiSelect',
        required: true,
        componentProps: {
          api: (p:any) => listTimePeriods(p),
          labelField: 'name',
          valueField: 'id',
          // 接口返回为分页结构 { records, total }，下拉需读取 records
          resultField: 'records',
          showSearch: true,
          allowClear: true,
          placeholder: '请选择时间段',
          size: 'middle',
          onChange: (_: any, option: any) => {
            periodName.value = option?.label ?? '';
          },
        },
      },
      {
        field: 'remark',
        label: '备注',
        component: 'InputTextArea',
        colProps: { span: 24 },
        componentProps: {
          placeholder: '请输入备注信息（可选）',
          rows: 3,
          maxlength: 200,
          showCount: true,
          allowClear: true,
          size: 'middle',
        },
      },
    ],
  });

  const [registerMemberTable, { reload: reloadMemberTable, setSelectedRowKeys: setMemberRowKeys }] = useTable({
    api: fetchMemberList,
    columns: memberColumns,
    rowKey: 'id',
    bordered: true,
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      labelAlign: 'right',
      compact: true,
      rowProps: { gutter: 16 },
      schemas: memberSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      actionColOptions: { span: 24 },
    },
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    size: 'small',
    scroll: { y: 260 },
    showIndexColumn: true,
    rowSelection: {
      type: 'checkbox',
      preserveSelectedRowKeys: true,
      onChange: (keys: (string | number)[], rows: MemberItem[]) => {
        handleMemberSelect(keys.map(String), rows);
      },
    },
  });

  const [registerDoorTable, { reload: reloadDoorTable, setSelectedRowKeys: setDoorRowKeys }] = useTable({
    api: fetchDoorList,
    columns: doorColumns,
    rowKey: 'id',
    bordered: true,
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      labelAlign: 'right',
      compact: true,
      rowProps: { gutter: 16 },
      schemas: doorSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      actionColOptions: { span: 24 },
    },
    pagination: {
      pageSize: 5,
      pageSizeOptions: ['5', '10', '20'],
    },
    size: 'small',
    scroll: { y: 260 },
    showIndexColumn: true,
    rowSelection: {
      type: 'checkbox',
      preserveSelectedRowKeys: true,
      onChange: (keys: (string | number)[], rows: DoorItem[]) => {
        handleDoorSelect(keys.map(String), rows);
      },
    },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (payload?: GroupFormProps) => {
    activeTab.value = 'member';
    await resetFields();
    isUpdate.value = !!payload?.isUpdate;
    currentRecord.value = payload?.record ?? null;

    const record = currentRecord.value;
    periodName.value = record?.periodName ?? '';

    // 仅新增场景需要加载和显示人员/门选择
    if (!isUpdate.value) {
      selectedMemberKeys.value = record?.members ? [...record.members] : [];
      selectedDoorKeys.value = record?.devices ? [...record.devices] : [];
      await preloadSelectedMembers();
      await preloadSelectedDoors();
    } else {
      // 编辑场景不展示授权对象，避免多余的预加载
      selectedMemberKeys.value = record?.members ? [...record.members] : [];
      selectedDoorKeys.value = record?.devices ? [...record.devices] : [];
      selectedMemberRows.value = [];
      selectedDoorRows.value = [];
    }

    await setFieldsValue({
      groupName: record?.groupName ?? '',
      periodId: record?.periodId ?? undefined,
      remark: record?.remark ?? '',
    });

    if (!isUpdate.value) {
      await Promise.all([reloadMemberTable({ page: 1 }), reloadDoorTable({ page: 1 })]);
      await nextTick();
      setMemberRowKeys?.(selectedMemberKeys.value);
      setDoorRowKeys?.(selectedDoorKeys.value);
    }
    setModalProps({ confirmLoading: false });
  });

  async function fetchMemberList(params: Record<string, any>) {
    return await fetchAccMemberList(params);
  }

  async function fetchDoorList(params: Record<string, any>) {
    return await listDoor(params);
  }

  async function preloadSelectedMembers() {
    const ids = selectedMemberKeys.value;
    if (!ids?.length) {
      selectedMemberRows.value = [];
      return;
    }
    // 尝试通过列表接口按 ids 预加载（后端如不支持 ids，使用前端过滤）
    const res = await fetchAccMemberList({ pageNo: 1, pageSize: Math.max(ids.length, 10), ids: ids.join(',') });
    const rows = (res.records || []).filter((r) => ids.includes(r.id));
    selectedMemberRows.value = rows;
  }

  async function preloadSelectedDoors() {
    const ids = selectedDoorKeys.value;
    if (!ids?.length) {
      selectedDoorRows.value = [];
      return;
    }
    const res = await listDoor({ pageNo: 1, pageSize: Math.max(ids.length, 10), ids: ids.join(',') });
    const rows = (res.records || []).filter((r: any) => ids.includes(r.id));
    selectedDoorRows.value = rows as DoorItem[];
  }

  function handleMemberSelect(keys: string[], rows?: MemberItem[]) {
    selectedMemberKeys.value = keys;
    if (rows && rows.length) {
      selectedMemberRows.value = rows;
    } else {
      // 无 rows 时（跨页勾选或初始化），保持已有行并去重
      const map = new Map<string, MemberItem>();
      selectedMemberRows.value.forEach((r) => map.set(r.id, r));
      selectedMemberRows.value = keys.map((id) => map.get(id)).filter(Boolean) as MemberItem[];
    }
  }

  function handleDoorSelect(keys: string[], rows?: DoorItem[]) {
    selectedDoorKeys.value = keys;
    if (rows && rows.length) {
      selectedDoorRows.value = rows;
    } else {
      const map = new Map<string, DoorItem>();
      selectedDoorRows.value.forEach((r) => map.set(r.id, r));
      selectedDoorRows.value = keys.map((id) => map.get(id)).filter(Boolean) as DoorItem[];
    }
  }

  function clearMembers() {
    selectedMemberKeys.value = [];
    selectedMemberRows.value = [];
    setMemberRowKeys?.([]);
  }

  function clearDoors() {
    selectedDoorKeys.value = [];
    selectedDoorRows.value = [];
    setDoorRowKeys?.([]);
  }

  function removeMember(id: string) {
    selectedMemberKeys.value = selectedMemberKeys.value.filter((key) => key !== id);
    selectedMemberRows.value = selectedMemberRows.value.filter((item) => item.id !== id);
    setMemberRowKeys?.(selectedMemberKeys.value);
  }

  function removeDoor(id: string) {
    selectedDoorKeys.value = selectedDoorKeys.value.filter((key) => key !== id);
    selectedDoorRows.value = selectedDoorRows.value.filter((item) => item.id !== id);
    setDoorRowKeys?.(selectedDoorKeys.value);
  }

  // periodId 对应的展示名称 periodName 已在下拉选择时记录

  async function handleSubmit() {
    const values = await validate();
    const members = selectedMemberRows.value ?? [];
    const doors = selectedDoorRows.value ?? [];

    const recordId = isUpdate.value && currentRecord.value ? currentRecord.value.id : `g-${Date.now()}`;
    const createTime = isUpdate.value && currentRecord.value ? currentRecord.value.createTime : dateUtil().format('YYYY-MM-DD HH:mm:ss');

    const record: AccGroupItem = {
      id: recordId,
      groupName: values.groupName,
      periodId: values.periodId,
      periodName: periodName.value,
      memberCount: isUpdate.value ? (currentRecord.value?.memberCount ?? 0) : members.length,
      deviceCount: isUpdate.value ? (currentRecord.value?.deviceCount ?? 0) : doors.length,
      createTime,
      remark: values.remark,
      // 编辑场景不变更绑定的人员和门；新增场景按选择填充
      members: isUpdate.value ? (currentRecord.value?.members ?? []) : members.map((item) => item.id),
      devices: isUpdate.value ? (currentRecord.value?.devices ?? []) : doors.map((item) => item.id),
    };

    emit('success', {
      record,
      isUpdate: isUpdate.value,
      // 编辑场景不传 detail，避免父层覆盖绑定列表
      detail: isUpdate.value ? undefined : {
        members,
        devices: doors,
      },
    });

    setModalProps({ confirmLoading: true });
    setTimeout(() => {
      setModalProps({ confirmLoading: false });
      closeModal();
    }, 300);
  }
</script>

<style scoped>
  .selected-overview {
    margin-bottom: 16px;
  }

  .overview-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .overview-label {
    font-weight: 600;
    font-size: 15px;
  }

  .overview-list {
    max-height: 180px;
    overflow: auto;
  }

  .item-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .item-name {
    font-weight: 500;
  }

  .item-desc {
    font-size: 12px;
    color: var(--text-color-secondary);
  }

  .more-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-color-secondary);
  }

  .selector-tabs {
    margin-top: 12px;
  }
</style>
