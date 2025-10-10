<template>
  <PageWrapper title='通道管理'>
    <BasicTable @register='registerTable'>
      <template #tableTitle>
        <a-button type='primary' preIcon='mdi:plus' @click='handleCreate'>新增通道</a-button>
      </template>
      <template #status='{ text }'>
        <a-tag :color='getStatusColor(text)'>
          {{ formatChannelStatus(text) }}
        </a-tag>
      </template>
      <template #action='{ record }'>
        <TableAction :actions='getActions(record)' />
      </template>
    </BasicTable>

    <BasicModal
      v-model:visible='modalVisible'
      :title='modalTitle'
      :width='720'
      @ok='handleSubmit'
      @cancel='handleCancel'
    >
      <a-form ref='formRef' layout='vertical' :model='formModel' :rules='formRules' class='channel-form'>
        <a-divider orientation='left'>基础信息</a-divider>
        <a-row :gutter='16'>
          <a-col :span='12'>
            <a-form-item label='通道名称' name='channelName'>
              <a-input v-model:value='formModel.channelName' placeholder='请输入通道名称' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='通道编号' name='channelCode'>
              <a-input v-model:value='formModel.channelCode' placeholder='请输入通道编号' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='所属车场' name='parkId'>
              <a-select
                v-model:value='formModel.parkId'
                placeholder='请选择车场'
                :options='parkOptionList'
                @change='handleParkChange'
              />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='关联区域' name='areaId'>
              <a-select
                v-model:value='formModel.areaId'
                placeholder='请选择区域'
                :options='filteredAreaOptions'
                @change='handleAreaChange'
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation='left'>设备与权限</a-divider>
        <a-row :gutter='16'>
          <a-col :span='12'>
            <a-form-item label='通行方向' name='direction'>
              <a-select v-model:value='formModel.direction' :options='channelDirectionOptions' placeholder='请选择通行方向' />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='支持车型' name='allowVehicle'>
              <a-select
                v-model:value='formModel.allowVehicle'
                mode='multiple'
                placeholder='请选择支持车型'
                :options='channelVehicleOptions'
              />
            </a-form-item>
          </a-col>
          <a-col :span='24'>
            <a-form-item label='关联设备' name='bindDeviceIds'>
              <a-select
                v-model:value='formModel.bindDeviceIds'
                mode='multiple'
                placeholder='请选择绑定的车牌识别设备'
                :options='filteredDeviceOptions'
                :max-tag-count='3'
              />
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item label='通道状态' name='status'>
              <a-select v-model:value='formModel.status' :options='channelStatusOptions' placeholder='请选择状态' />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation='left'>备注</a-divider>
        <a-form-item label='备注信息' name='remark'>
          <a-textarea v-model:value='formModel.remark' placeholder='可填写通道限行规则等说明' :rows='3' />
        </a-form-item>
      </a-form>
    </BasicModal>
  </PageWrapper>
</template>

<script lang='ts' setup>
  import type { FormInstance } from 'ant-design-vue';
  import type { ParkChannelRecord, ChannelStatus, ChannelDirection } from './parkChannel.data';
  import { computed, reactive, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    areaOptionList,
    channelColumns,
    channelDirectionOptions,
    channelSearchFormSchema,
    channelStatusOptions,
    channelVehicleOptions,
    deviceOptionList,
    formatChannelStatus,
    mockChannelList,
    parkOptionList,
  } from './parkChannel.data';

  const channelData = ref<ParkChannelRecord[]>([...mockChannelList]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<string | null>(null);
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();

  const formModel = reactive<ParkChannelRecord>({
    id: '',
    channelCode: '',
    channelName: '',
    parkId: '',
    parkName: '',
    areaId: '',
    areaName: '',
    direction: 'entry',
    bindDeviceIds: [],
    bindDeviceNames: [],
    allowVehicle: [],
    status: 'enabled',
    remark: '',
  });

  const formRules = {
    channelCode: [{ required: true, message: '请输入通道编号' }],
    channelName: [{ required: true, message: '请输入通道名称' }],
    parkId: [{ required: true, message: '请选择所属车场' }],
    areaId: [{ required: true, message: '请选择关联区域' }],
  };

  const filteredAreaOptions = computed(() => {
    if (!formModel.parkId) return areaOptionList;
    return areaOptionList.filter((item) => item.parkId === formModel.parkId);
  });

  const filteredDeviceOptions = computed(() => {
    return deviceOptionList.filter((item) => {
      if (!formModel.parkId) return true;
      if (formModel.areaId) {
        return item.parkId === formModel.parkId && item.areaId === formModel.areaId;
      }
      return item.parkId === formModel.parkId;
    });
  });

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '通道列表',
    rowKey: 'id',
    api: fetchTableData,
    columns: channelColumns,
    formConfig: {
      labelWidth: 100,
      schemas: channelSearchFormSchema,
    },
    actionColumn: {
      width: 200,
      title: '操作',
    },
  });

  function fetchTableData(params: Record<string, any>) {
    let data = [...channelData.value];
    if (params.channelName) data = data.filter((item) => item.channelName.includes(params.channelName));
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

  function handleEdit(record: ParkChannelRecord) {
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
          parkName: parkOptionList.find((item) => item.value === formModel.parkId)?.label ?? '',
          areaName: areaOptionList.find((item) => item.value === formModel.areaId)?.label?.split(' - ')[1] ?? '',
          bindDeviceNames: formModel.bindDeviceIds.map(
            (id) => deviceOptionList.find((item) => item.value === id)?.label ?? id,
          ),
        };
        if (isEdit.value && currentId.value) {
          const index = channelData.value.findIndex((item) => item.id === currentId.value);
          if (index > -1) {
            channelData.value.splice(index, 1, payload);
            createMessage.success('通道信息已更新');
          }
        } else {
          channelData.value.unshift({ ...payload, id: `PC-${Date.now()}` });
          createMessage.success('新增通道成功');
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

  function handleDelete(record: ParkChannelRecord) {
    channelData.value = channelData.value.filter((item) => item.id !== record.id);
    createMessage.success('已删除该通道（示例数据）');
    reloadTable();
  }

  function handleParkChange(parkId: string) {
    formModel.parkName = parkOptionList.find((item) => item.value === parkId)?.label ?? '';
    if (formModel.areaId && !filteredAreaOptions.value.some((item) => item.value === formModel.areaId)) {
      formModel.areaId = '';
      formModel.areaName = '';
    }
    if (formModel.bindDeviceIds.length) {
      formModel.bindDeviceIds = formModel.bindDeviceIds.filter((id) =>
        filteredDeviceOptions.value.some((item) => item.value === id),
      );
    }
  }

  function handleAreaChange(areaId: string) {
    formModel.areaName = areaOptionList.find((item) => item.value === areaId)?.label?.split(' - ')[1] ?? '';
    if (formModel.bindDeviceIds.length) {
      formModel.bindDeviceIds = formModel.bindDeviceIds.filter((id) =>
        filteredDeviceOptions.value.some((item) => item.value === id),
      );
    }
  }

  function resetForm() {
    formRef.value?.resetFields();
    Object.assign(formModel, {
      id: '',
      channelCode: '',
      channelName: '',
      parkId: '',
      parkName: '',
      areaId: '',
      areaName: '',
      direction: 'entry' as ChannelDirection,
      bindDeviceIds: [] as string[],
      bindDeviceNames: [] as string[],
      allowVehicle: [] as string[],
      status: 'enabled' as ChannelStatus,
      remark: '',
    });
  }

  function getActions(record: ParkChannelRecord) {
    return [
      {
        label: '编辑',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '确认删除该通道吗？',
          onConfirm: () => handleDelete(record),
        },
      },
    ];
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'enabled':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'disabled':
        return 'default';
      default:
        return 'default';
    }
  }
</script>

<style scoped>
  .channel-form :deep(.ant-divider-inner-text) {
    font-weight: 600;
    color: #1f2a44;
  }
</style>
