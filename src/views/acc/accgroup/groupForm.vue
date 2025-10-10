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
  import {
    memberColumns,
    deviceColumns,
    memberSearchFormSchema,
    deviceSearchFormSchema,
    mockMemberList,
    mockDeviceList,
    type AccGroupItem,
  } from './accgroup.data';
  import { dateUtil } from '/@/utils/dateUtil';

  type MemberItem = (typeof mockMemberList)[number];
  type DeviceItem = (typeof mockDeviceList)[number];

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

  const defaultTimeRange: string[] = ['08:00', '19:00'];
  const defaultApplyDays: string[] = ['daily'];

  const modalTitle = computed(() => (isUpdate.value ? '编辑权限组' : '新增权限组'));

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    showActionButtonGroup: false,
    schemas: [
      {
        field: 'groupName',
        label: '权限组名称',
        component: 'Input',
        required: true,
        componentProps: {
          placeholder: '请输入权限组名称',
          maxlength: 32,
          showCount: true,
        },
      },
      {
        field: 'applyDays',
        label: '适用日期',
        component: 'Select',
        required: true,
        defaultValue: defaultApplyDays,
        componentProps: {
          mode: 'multiple',
          allowClear: true,
          maxTagCount: 3,
          placeholder: '请选择适用日期',
          options: [
            { label: '全部日期', value: 'daily' },
            { label: '工作日', value: 'workday' },
            { label: '周末', value: 'weekend' },
            { label: '自定义日期', value: 'custom' },
          ],
        },
      },
      {
        field: 'timeRange',
        label: '启用时间段',
        component: 'RangePicker',
        required: true,
        defaultValue: defaultTimeRange,
        componentProps: {
          picker: 'time',
          format: 'HH:mm',
          valueFormat: 'HH:mm',
          minuteStep: 5,
          placeholder: ['开始时间', '结束时间'],
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
      labelWidth: 80,
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
      onChange: (keys: (string | number)[]) => {
        handleMemberSelect(keys.map(String));
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
      labelWidth: 90,
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
      onChange: (keys: (string | number)[]) => {
        handleDeviceSelect(keys.map(String));
      },
    },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (payload?: GroupFormProps) => {
    activeTab.value = 'member';
    await resetFields();
    isUpdate.value = !!payload?.isUpdate;
    currentRecord.value = payload?.record ?? null;

    const record = currentRecord.value;
    const applyDays = record?.applyDays?.length ? record.applyDays : defaultApplyDays;
    const timeSlots = record?.timeSlots?.length === 2 ? record.timeSlots : defaultTimeRange;

    selectedMemberKeys.value = record?.members ? [...record.members] : [];
    selectedDeviceKeys.value = record?.devices ? [...record.devices] : [];
    selectedMemberRows.value = mapMemberRows(selectedMemberKeys.value);
    selectedDeviceRows.value = mapDeviceRows(selectedDeviceKeys.value);

    await setFieldsValue({
      groupName: record?.groupName ?? '',
      applyDays,
      timeRange: timeSlots,
      remark: record?.remark ?? '',
    });

    await Promise.all([reloadMemberTable({ page: 1 }), reloadDeviceTable({ page: 1 })]);
    await nextTick();
    setMemberRowKeys?.(selectedMemberKeys.value);
    setDeviceRowKeys?.(selectedDeviceKeys.value);
    setModalProps({ confirmLoading: false });
  });

  async function fetchMemberList(params: Record<string, any>) {
    const pageNo = Number(params.pageNo) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const { name, dept, phone } = params;
    let list = [...mockMemberList];
    if (name) {
      list = list.filter((item) => item.name.includes(name));
    }
    if (dept) {
      list = list.filter((item) => item.dept.includes(dept));
    }
    if (phone) {
      list = list.filter((item) => item.phone.includes(phone));
    }
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    const records = list.slice(start, start + pageSize);
    return { records, total };
  }

  async function fetchDeviceList(params: Record<string, any>) {
    const pageNo = Number(params.pageNo) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const { deviceName, sn, location } = params;
    let list = [...mockDeviceList];
    if (deviceName) {
      list = list.filter((item) => item.deviceName.includes(deviceName));
    }
    if (sn) {
      list = list.filter((item) => item.sn.includes(sn));
    }
    if (location) {
      list = list.filter((item) => item.location.includes(location));
    }
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    const records = list.slice(start, start + pageSize);
    return { records, total };
  }

  function mapMemberRows(keys: string[]) {
    if (!keys?.length) return [];
    return mockMemberList.filter((item) => keys.includes(item.id));
  }

  function mapDeviceRows(keys: string[]) {
    if (!keys?.length) return [];
    return mockDeviceList.filter((item) => keys.includes(item.id));
  }

  function handleMemberSelect(keys: string[]) {
    selectedMemberKeys.value = keys;
    selectedMemberRows.value = mapMemberRows(keys);
  }

  function handleDeviceSelect(keys: string[]) {
    selectedDeviceKeys.value = keys;
    selectedDeviceRows.value = mapDeviceRows(keys);
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

  function formatTimeRange(applyDays: string[], timeRange: string[]) {
    const dayTextMap: Record<string, string> = {
      daily: '每天',
      workday: '周一至周五',
      weekend: '周末',
      custom: '自定义',
    };
    const rangeText = `${timeRange[0]} - ${timeRange[1]}`;
    if (!applyDays?.length) {
      return rangeText;
    }
    const labels = applyDays.map((item) => dayTextMap[item] ?? item).join('、');
    return `${labels} ${rangeText}`;
  }

  async function handleSubmit() {
    const values = await validate();
    const members = selectedMemberRows.value ?? [];
    const devices = selectedDeviceRows.value ?? [];

    const recordId = isUpdate.value && currentRecord.value ? currentRecord.value.id : `g-${Date.now()}`;
    const createTime = isUpdate.value && currentRecord.value ? currentRecord.value.createTime : dateUtil().format('YYYY-MM-DD HH:mm:ss');

    const record: AccGroupItem = {
      id: recordId,
      groupName: values.groupName,
      timeRange: formatTimeRange(values.applyDays, values.timeRange),
      memberCount: members.length,
      deviceCount: devices.length,
      createTime,
      remark: values.remark,
      members: members.map((item) => item.id),
      devices: devices.map((item) => item.id),
      applyDays: values.applyDays,
      timeSlots: values.timeRange,
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
