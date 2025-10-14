<template>
  <BasicModal
    @register="registerModal"
    :title="modalTitle"
    :width="960"
    :maskClosable="false"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
    <a-divider orientation="left">授权对象配置</a-divider>

    <a-card class="selected-overview" :bodyStyle="{ padding: '12px 16px' }" bordered>
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
                      <div class="item-desc">{{ item.dept }} ｜ {{ item.position }}</div>
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
            <span class="overview-label">已选择设备</span>
            <a-badge :count="selectedDeviceRows.length" show-zero />
            <a-button type="link" size="small" @click="clearDevices" v-if="selectedDeviceRows.length">清空</a-button>
          </div>
          <template v-if="selectedDeviceRows.length">
            <a-list :data-source="devicePreview" :split="false" class="overview-list">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-space :size="8">
                    <a-avatar :size="28" shape="square">{{ item.deviceName.slice(0, 2) }}</a-avatar>
                    <div class="item-meta">
                      <div class="item-name">{{ item.deviceName }}</div>
                      <div class="item-desc">{{ item.location }} ｜ 序列号 {{ item.sn }}</div>
                    </div>
                    <a-button type="link" size="small" @click="removeDevice(item.id)">移除</a-button>
                  </a-space>
                </a-list-item>
              </template>
            </a-list>
            <div class="more-hint" v-if="deviceMoreCount">还有 {{ deviceMoreCount }} 台...</div>
          </template>
          <a-empty description="暂无已选设备" v-else />
        </a-col>
      </a-row>
    </a-card>

    <a-tabs v-model:activeKey="activeTab" class="selector-tabs">
      <a-tab-pane key="member" tab="人员授权">
        <BasicTable @register="registerMemberTable" size="small">
          <template #tableTitle>
            <a-alert type="info" show-icon message="可通过条件过滤后勾选多个员工" />
          </template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane key="device" tab="设备授权">
        <BasicTable @register="registerDeviceTable" size="small">
          <template #tableTitle>
            <a-alert type="info" show-icon message="支持按设备名称、序列号或安装位置快速定位" />
          </template>
          <template #authorized="{ text }">
            <a-tag :color="text === '已授权' ? 'success' : 'orange'">{{ text }}</a-tag>
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
    deviceColumns,
    memberSearchFormSchema,
    deviceSearchFormSchema,
    fetchAccMemberList,
    fetchAccDeviceList,
    type AccMemberItem,
    type AccDeviceItem,
    type AccGroupItem,
  } from './accgroup.data';
  import { dateUtil } from '/@/utils/dateUtil';

  type MemberItem = AccMemberItem;
  type DeviceItem = AccDeviceItem;

  interface GroupDetailPayload {
    members: MemberItem[];
    devices: DeviceItem[];
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
  const selectedDeviceRows = ref<DeviceItem[]>([]);
  const selectedMemberKeys = ref<string[]>([]);
  const selectedDeviceKeys = ref<string[]>([]);

  const memberPreview = computed(() => selectedMemberRows.value.slice(0, 5));
  const devicePreview = computed(() => selectedDeviceRows.value.slice(0, 5));
  const memberMoreCount = computed(() => Math.max(0, selectedMemberRows.value.length - memberPreview.value.length));
  const deviceMoreCount = computed(() => Math.max(0, selectedDeviceRows.value.length - devicePreview.value.length));

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

  const [registerDeviceTable, { reload: reloadDeviceTable, setSelectedRowKeys: setDeviceRowKeys }] = useTable({
    api: fetchDeviceList,
    columns: deviceColumns,
    rowKey: 'id',
    bordered: true,
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      labelAlign: 'right',
      compact: true,
      rowProps: { gutter: 16 },
      schemas: deviceSearchFormSchema,
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
      onChange: (keys: (string | number)[], rows: DeviceItem[]) => {
        handleDeviceSelect(keys.map(String), rows);
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

    selectedMemberKeys.value = record?.members ? [...record.members] : [];
    selectedDeviceKeys.value = record?.devices ? [...record.devices] : [];
    // 预加载编辑态已选项详情，用于右侧预览
    await preloadSelectedMembers();
    await preloadSelectedDevices();

    await setFieldsValue({
      groupName: record?.groupName ?? '',
      periodId: record?.periodId ?? undefined,
      remark: record?.remark ?? '',
    });

    await Promise.all([reloadMemberTable({ page: 1 }), reloadDeviceTable({ page: 1 })]);
    await nextTick();
    setMemberRowKeys?.(selectedMemberKeys.value);
    setDeviceRowKeys?.(selectedDeviceKeys.value);
    setModalProps({ confirmLoading: false });
  });

  async function fetchMemberList(params: Record<string, any>) {
    return await fetchAccMemberList(params);
  }

  async function fetchDeviceList(params: Record<string, any>) {
    return await fetchAccDeviceList(params);
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

  async function preloadSelectedDevices() {
    const ids = selectedDeviceKeys.value;
    if (!ids?.length) {
      selectedDeviceRows.value = [];
      return;
    }
    const res = await fetchAccDeviceList({ pageNo: 1, pageSize: Math.max(ids.length, 10), ids: ids.join(',') });
    const rows = (res.records || []).filter((r) => ids.includes(r.id));
    selectedDeviceRows.value = rows;
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

  function handleDeviceSelect(keys: string[], rows?: DeviceItem[]) {
    selectedDeviceKeys.value = keys;
    if (rows && rows.length) {
      selectedDeviceRows.value = rows;
    } else {
      const map = new Map<string, DeviceItem>();
      selectedDeviceRows.value.forEach((r) => map.set(r.id, r));
      selectedDeviceRows.value = keys.map((id) => map.get(id)).filter(Boolean) as DeviceItem[];
    }
  }

  function clearMembers() {
    selectedMemberKeys.value = [];
    selectedMemberRows.value = [];
    setMemberRowKeys?.([]);
  }

  function clearDevices() {
    selectedDeviceKeys.value = [];
    selectedDeviceRows.value = [];
    setDeviceRowKeys?.([]);
  }

  function removeMember(id: string) {
    selectedMemberKeys.value = selectedMemberKeys.value.filter((key) => key !== id);
    selectedMemberRows.value = selectedMemberRows.value.filter((item) => item.id !== id);
    setMemberRowKeys?.(selectedMemberKeys.value);
  }

  function removeDevice(id: string) {
    selectedDeviceKeys.value = selectedDeviceKeys.value.filter((key) => key !== id);
    selectedDeviceRows.value = selectedDeviceRows.value.filter((item) => item.id !== id);
    setDeviceRowKeys?.(selectedDeviceKeys.value);
  }

  // periodId 对应的展示名称 periodName 已在下拉选择时记录

  async function handleSubmit() {
    const values = await validate();
    const members = selectedMemberRows.value ?? [];
    const devices = selectedDeviceRows.value ?? [];

    const recordId = isUpdate.value && currentRecord.value ? currentRecord.value.id : `g-${Date.now()}`;
    const createTime = isUpdate.value && currentRecord.value ? currentRecord.value.createTime : dateUtil().format('YYYY-MM-DD HH:mm:ss');

    const record: AccGroupItem = {
      id: recordId,
      groupName: values.groupName,
      periodId: values.periodId,
      periodName: periodName.value,
      memberCount: members.length,
      deviceCount: devices.length,
      createTime,
      remark: values.remark,
      members: members.map((item) => item.id),
      devices: devices.map((item) => item.id),
    };

    emit('success', {
      record,
      isUpdate: isUpdate.value,
      detail: {
        members,
        devices,
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
