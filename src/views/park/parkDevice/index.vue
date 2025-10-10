<template>
  <PageWrapper title='设备管理'>
    <BasicTable @register='registerTable'>
      <template #tableTitle>
        <a-button type='primary' preIcon='mdi:plus' @click='handleCreate'>新增设备</a-button>
      </template>
      <template #status='{ text }'>
        <a-tag :color='getStatusColor(text)'>
          {{ formatDeviceStatus(text) }}
        </a-tag>
      </template>
      <template #action='{ record }'>
        <TableAction :actions='getActions(record)' />
      </template>
    </BasicTable>

    <BasicModal
      v-model:visible='modalVisible'
      :title='modalTitle'
      :width='760'
      @ok='handleSubmit'
      @cancel='handleCancel'
    >
      <a-form ref='formRef' layout='vertical' :model='formModel' :rules='formRules' class='device-form'>
        <a-divider orientation='left'>基础信息</a-divider>
        <a-row :gutter='16'>
          <a-col :span='12'>
            <a-form-item label='设备名称' name='deviceName'>
              <a-input v-model:value='formModel.deviceName' placeholder='请输入设备名称' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='设备编号' name='deviceCode'>
              <a-input v-model:value='formModel.deviceCode' placeholder='请输入设备编号' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='所属车场' name='parkId'>
              <a-select
                v-model:value='formModel.parkId'
                placeholder='请选择车场'
                :options='parkOptions'
                @change='handleParkChange'
              />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='所属区域' name='areaId'>
              <a-select
                v-model:value='formModel.areaId'
                placeholder='请选择区域'
                :options='filteredAreaOptions'
                @change='handleAreaChange'
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation='left'>设备参数</a-divider>
        <a-row :gutter='16'>
          <a-col :span='12'>
            <a-form-item label='品牌' name='vendor'>
              <a-input v-model:value='formModel.vendor' placeholder='如：海康威视' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='型号' name='model'>
              <a-input v-model:value='formModel.model' placeholder='如：DS-LPR700' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='固件版本' name='firmwareVersion'>
              <a-input v-model:value='formModel.firmwareVersion' placeholder='如：v3.2.5' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='接入方式' name='connection'>
              <a-select v-model:value='formModel.connection' :options='connectionOptions' placeholder='请选择接入方式' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='IP 地址' name='ipAddress'>
              <a-input v-model:value='formModel.ipAddress' placeholder='例如 10.16.1.21' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='安装日期' name='installDate'>
              <a-input v-model:value='formModel.installDate' placeholder='例如 2024-03-12' />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation='left'>运行信息</a-divider>
        <a-row :gutter='16'>
          <a-col :span='12'>
            <a-form-item label='识别车牌类型' name='supportPlateTypes'>
              <a-select
                v-model:value='formModel.supportPlateTypes'
                mode='multiple'
                placeholder='请选择支持车牌类型'
                :options='plateTypeOptions'
              />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='设备状态' name='status'>
              <a-select v-model:value='formModel.status' :options='deviceStatusOptions' placeholder='请选择状态' />
            </a-form-item>
          </a-col>
          <a-col :span='24'>
            <a-form-item label='备注信息' name='remark'>
              <a-textarea v-model:value='formModel.remark' placeholder='可填写设备部署位置、维护说明等' :rows='3' />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </BasicModal>
  </PageWrapper>
</template>

<script lang='ts' setup>
  import type { FormInstance } from 'ant-design-vue';
  import type { ParkDeviceRecord, ConnectionType, DeviceStatus } from './parkDevice.data';
  import { computed, reactive, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    areaOptions,
    connectionOptions,
    deviceColumns,
    deviceSearchFormSchema,
    deviceStatusOptions,
    formatDeviceStatus,
    mockDeviceList,
    parkOptions,
    plateTypeOptions,
  } from './parkDevice.data';

  const deviceData = ref<ParkDeviceRecord[]>([...mockDeviceList]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<string | null>(null);
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();

  const formModel = reactive<ParkDeviceRecord>({
    id: '',
    deviceCode: '',
    deviceName: '',
    parkId: '',
    parkName: '',
    areaId: '',
    areaName: '',
    vendor: '',
    model: '',
    firmwareVersion: '',
    ipAddress: '',
    connection: 'ethernet',
    installDate: '',
    lastOnline: '',
    status: 'online',
    supportPlateTypes: [],
    remark: '',
  });

  const formRules = {
    deviceCode: [{ required: true, message: '请输入设备编号' }],
    deviceName: [{ required: true, message: '请输入设备名称' }],
    parkId: [{ required: true, message: '请选择所属车场' }],
    areaId: [{ required: true, message: '请选择所属区域' }],
    ipAddress: [{ required: true, message: '请输入 IP 地址' }],
  };

  const filteredAreaOptions = computed(() => {
    if (!formModel.parkId) return areaOptions;
    return areaOptions.filter((item) => item.parkId === formModel.parkId);
  });

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '设备列表',
    rowKey: 'id',
    api: fetchTableData,
    columns: deviceColumns,
    formConfig: {
      labelWidth: 100,
      schemas: deviceSearchFormSchema,
    },
    actionColumn: {
      width: 200,
      title: '操作',
    },
  });

  function fetchTableData(params: Record<string, any>) {
    let data = [...deviceData.value];
    if (params.deviceName) data = data.filter((item) => item.deviceName.includes(params.deviceName));
    if (params.parkId) data = data.filter((item) => item.parkId === params.parkId);
    if (params.areaId) data = data.filter((item) => item.areaId === params.areaId);
    if (params.status) data = data.filter((item) => item.status === params.status);
    return Promise.resolve({ records: data, total: data.length });
  }

  function handleCreate() {
    isEdit.value = false;
    currentId.value = null;
    resetForm();
    modalVisible.value = true;
  }

  function handleEdit(record: ParkDeviceRecord) {
    isEdit.value = true;
    currentId.value = record.id;
    Object.assign(formModel, record);
    modalVisible.value = true;
  }

  function handleSubmit() {
    formRef.value
      ?.validate()
      .then(() => {
        const payload = {
          ...formModel,
          parkName: parkOptions.find((item) => item.value === formModel.parkId)?.label ?? '',
          areaName: areaOptions.find((item) => item.value === formModel.areaId)?.label?.split(' - ')[1] ?? '',
          lastOnline: formModel.lastOnline || new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        if (isEdit.value && currentId.value) {
          const index = deviceData.value.findIndex((item) => item.id === currentId.value);
          if (index > -1) {
            deviceData.value.splice(index, 1, payload);
            createMessage.success('设备信息已更新');
          }
        } else {
          deviceData.value.unshift({ ...payload, id: `PD-${Date.now()}` });
          createMessage.success('新增设备成功');
        }
        modalVisible.value = false;
        reloadTable();
      })
      .catch(() => {});
  }

  function handleCancel() {
    modalVisible.value = false;
    resetForm();
  }

  function handleDelete(record: ParkDeviceRecord) {
    deviceData.value = deviceData.value.filter((item) => item.id !== record.id);
    createMessage.success('已删除该设备（示例数据）');
    reloadTable();
  }

  function handleParkChange(parkId: string) {
    formModel.parkName = parkOptions.find((item) => item.value === parkId)?.label ?? '';
    if (formModel.areaId && !filteredAreaOptions.value.some((item) => item.value === formModel.areaId)) {
      formModel.areaId = '';
      formModel.areaName = '';
    }
  }

  function handleAreaChange(areaId: string) {
    formModel.areaName = areaOptions.find((item) => item.value === areaId)?.label?.split(' - ')[1] ?? '';
  }

  function resetForm() {
    formRef.value?.resetFields();
    Object.assign(formModel, {
      id: '',
      deviceCode: '',
      deviceName: '',
      parkId: '',
      parkName: '',
      areaId: '',
      areaName: '',
      vendor: '',
      model: '',
      firmwareVersion: '',
      ipAddress: '',
      connection: 'ethernet' as ConnectionType,
      installDate: '',
      lastOnline: '',
      status: 'online' as DeviceStatus,
      supportPlateTypes: [] as string[],
      remark: '',
    });
  }

  function getActions(record: ParkDeviceRecord) {
    return [
      {
        label: '编辑',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '确认删除该设备吗？',
          onConfirm: () => handleDelete(record),
        },
      },
    ];
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'online':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'offline':
        return 'default';
      default:
        return 'default';
    }
  }
</script>

<style scoped>
  .device-form :deep(.ant-divider-inner-text) {
    font-weight: 600;
    color: #1f2a44;
  }
</style>
