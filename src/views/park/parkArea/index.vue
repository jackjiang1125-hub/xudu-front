<template>
  <PageWrapper title="区域管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="mdi:plus" @click="handleCreate">新增区域</a-button>
      </template>
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">{{ formatAreaStatus(text) }}</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <BasicModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="700"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" layout="vertical" :model="formModel" :rules="formRules" class="styled-form">
        <a-divider orientation="left">基础信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="区域名称" name="zoneName">
              <a-input v-model:value="formModel.zoneName" placeholder="请输入区域名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="区域编号" name="zoneCode">
              <a-input v-model:value="formModel.zoneCode" placeholder="请输入区域编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属车场" name="parkId">
              <a-select
                v-model:value="formModel.parkId"
                placeholder="请选择所属车场"
                :options="parkOptions"
                @change="handleParkChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所在楼层/区域" name="floor">
              <a-input v-model:value="formModel.floor" placeholder="例如 B1 层、地面西侧" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">泊位配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="总泊位数量" name="capacity">
              <a-input-number v-model:value="formModel.capacity" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="当前可用泊位" name="available">
              <a-input-number v-model:value="formModel.available" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="支持车型" name="allowVehicle">
              <a-select
                v-model:value="formModel.allowVehicle"
                mode="multiple"
                placeholder="请选择支持车型"
                :options="vehicleOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="区域状态" name="status">
              <a-select v-model:value="formModel.status" :options="areaStatusOptions" placeholder="请选择状态" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">备注信息</a-divider>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formModel.remark" placeholder="可填写区域管控说明" :rows="3" />
        </a-form-item>
      </a-form>
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import type { FormInstance } from 'ant-design-vue';
  import type { ParkAreaRecord, AreaStatus } from './parkArea.data';
  import { reactive, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    areaColumns,
    areaSearchFormSchema,
    areaStatusOptions,
    formatAreaStatus,
    mockAreaList,
    parkSelectOptions,
    vehicleOptions,
  } from './parkArea.data';

  const areaData = ref<ParkAreaRecord[]>([...mockAreaList]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<string | null>(null);
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();

  const formModel = reactive<ParkAreaRecord>({
    id: '',
    zoneCode: '',
    zoneName: '',
    parkId: '',
    parkName: '',
    floor: '',
    capacity: 0,
    available: 0,
    allowVehicle: [],
    status: 'enabled',
    remark: '',
  });

  const formRules = {
    zoneCode: [{ required: true, message: '请输入区域编号' }],
    zoneName: [{ required: true, message: '请输入区域名称' }],
    parkId: [{ required: true, message: '请选择所属车场' }],
    capacity: [{ required: true, message: '请输入总泊位数量' }],
    status: [{ required: true, message: '请选择区域状态' }],
  };

  const parkOptions = parkSelectOptions;

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '区域列表',
    rowKey: 'id',
    api: fetchTableData,
    columns: areaColumns,
    formConfig: {
      labelWidth: 100,
      schemas: areaSearchFormSchema,
    },
    actionColumn: {
      width: 200,
      title: '操作',
    },
  });

  function fetchTableData(params: Record<string, any>) {
    let data = [...areaData.value];
    if (params.zoneName) data = data.filter((item) => item.zoneName.includes(params.zoneName));
    if (params.parkId) data = data.filter((item) => item.parkId === params.parkId);
    if (params.status) data = data.filter((item) => item.status === params.status);
    if (params.vehicle) data = data.filter((item) => item.allowVehicle.includes(params.vehicle));
    return Promise.resolve({ records: data, total: data.length });
  }

  function handleCreate() {
    isEdit.value = false;
    currentId.value = null;
    resetForm();
    modalVisible.value = true;
  }

  function handleEdit(record: ParkAreaRecord) {
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
        };
        if (isEdit.value && currentId.value) {
          const index = areaData.value.findIndex((item) => item.id === currentId.value);
          if (index > -1) {
            areaData.value.splice(index, 1, payload);
            createMessage.success('区域信息已更新');
          }
        } else {
          areaData.value.unshift({ ...payload, id: `PA-${Date.now()}` });
          createMessage.success('新增区域成功');
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

  function handleParkChange(parkId: string) {
    formModel.parkName = parkOptions.find((item) => item.value === parkId)?.label ?? '';
  }

  function resetForm() {
    formRef.value?.resetFields();
    Object.assign(formModel, {
      id: '',
      zoneCode: '',
      zoneName: '',
      parkId: '',
      parkName: '',
      floor: '',
      capacity: 0,
      available: 0,
      allowVehicle: [] as string[],
      status: 'enabled' as AreaStatus,
      remark: '',
    });
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

  function getActions(record: ParkAreaRecord) {
    return [
      {
        label: '编辑',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '确认删除该区域吗？',
          onConfirm: () => handleDelete(record),
        },
      },
    ];
  }

  function handleDelete(record: ParkAreaRecord) {
    areaData.value = areaData.value.filter((item) => item.id !== record.id);
    createMessage.success('已删除该区域（示例数据）');
    reloadTable();
  }
</script>

<style scoped>
  .styled-form :deep(.ant-divider-inner-text) {
    font-weight: 600;
    color: #1f2a44;
  }
</style>
