<template>
  <PageWrapper title="车场管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="mdi:plus" @click="handleCreate">新增车场</a-button>
      </template>
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">{{ formatParkStatus(text) }}</a-tag>
      </template>
      <template #chargeMode="{ text }">
        {{ formatChargeMode(text) }}
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <BasicModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="720"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" layout="vertical" :model="formModel" :rules="formRules" class="park-form">
        <a-divider orientation="left">基础信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="车场名称" name="parkName">
              <a-input v-model:value="formModel.parkName" placeholder="请输入车场名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="车场编号" name="parkCode">
              <a-input v-model:value="formModel.parkCode" placeholder="请输入车场编号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属城市" name="city">
              <a-input v-model:value="formModel.city" placeholder="请输入所属城市" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="详细地址" name="address">
              <a-input v-model:value="formModel.address" placeholder="请输入详细地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="总车位数量" name="totalSpaces">
              <a-input-number v-model:value="formModel.totalSpaces" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="当前可用车位" name="availableSpaces">
              <a-input-number v-model:value="formModel.availableSpaces" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">运营配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计费方式" name="chargeMode">
              <a-select v-model:value="formModel.chargeMode" :options="chargeModeOptions" placeholder="请选择计费方式" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计费规则说明" name="chargeRule">
              <a-input v-model:value="formModel.chargeRule" placeholder="如：5元/小时，封顶30元" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开放时间" name="openTime">
              <a-input v-model:value="formModel.openTime" placeholder="例如 07:00" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关闭时间" name="closeTime">
              <a-input v-model:value="formModel.closeTime" placeholder="例如 22:00" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="车场状态" name="status">
              <a-select v-model:value="formModel.status" :options="parkStatusOptions" placeholder="请选择车场状态" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">联系人信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="联系人" name="contactPerson">
              <a-input v-model:value="formModel.contactPerson" placeholder="请输入联系人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="contactPhone">
              <a-input v-model:value="formModel.contactPhone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注信息" name="remark">
              <a-textarea v-model:value="formModel.remark" placeholder="可填写车场补充说明" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import type { FormInstance } from 'ant-design-vue';
  import type { ParkRecord } from './parkManage.data';
  import { reactive, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    chargeModeOptions,
    formatChargeMode,
    formatParkStatus,
    mockParkList,
    parkColumns,
    parkSearchFormSchema,
    parkStatusOptions,
  } from './parkManage.data';

  const parkData = ref<ParkRecord[]>([...mockParkList]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<string | null>(null);
  const formRef = ref<FormInstance>();
  const { createMessage } = useMessage();

  const formModel = reactive<ParkRecord>({
    id: '',
    parkCode: '',
    parkName: '',
    city: '',
    address: '',
    totalSpaces: 0,
    availableSpaces: 0,
    chargeMode: 'hourly',
    chargeRule: '',
    openTime: '07:00',
    closeTime: '22:00',
    status: 'operating',
    contactPerson: '',
    contactPhone: '',
    remark: '',
  });

  const formRules = {
    parkCode: [{ required: true, message: '请输入车场编号' }],
    parkName: [{ required: true, message: '请输入车场名称' }],
    city: [{ required: true, message: '请输入所属城市' }],
    totalSpaces: [{ required: true, message: '请输入总车位数量' }],
    chargeMode: [{ required: true, message: '请选择计费方式' }],
    status: [{ required: true, message: '请选择车场状态' }],
    contactPerson: [{ required: true, message: '请输入联系人' }],
    contactPhone: [{ required: true, message: '请输入联系电话' }],
  };

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '车场列表',
    rowKey: 'id',
    api: fetchTableData,
    columns: parkColumns,
    formConfig: {
      labelWidth: 100,
      schemas: parkSearchFormSchema,
    },
    actionColumn: {
      width: 200,
      title: '操作',
    },
  });

  function fetchTableData(params: Record<string, any>) {
    let data = [...parkData.value];
    if (params.parkName) data = data.filter((item) => item.parkName.includes(params.parkName));
    if (params.city) data = data.filter((item) => item.city.includes(params.city));
    if (params.chargeMode) data = data.filter((item) => item.chargeMode === params.chargeMode);
    if (params.status) data = data.filter((item) => item.status === params.status);
    return Promise.resolve({ records: data, total: data.length });
  }

  function handleCreate() {
    isEdit.value = false;
    currentId.value = null;
    resetForm();
    modalVisible.value = true;
  }

  function handleEdit(record: ParkRecord) {
    isEdit.value = true;
    currentId.value = record.id;
    Object.assign(formModel, record);
    modalVisible.value = true;
  }

  function handleSubmit() {
    formRef.value
      ?.validate()
      .then(() => {
        if (isEdit.value && currentId.value) {
          const index = parkData.value.findIndex((item) => item.id === currentId.value);
          if (index > -1) {
            parkData.value.splice(index, 1, { ...formModel });
            createMessage.success('车场信息已更新');
          }
        } else {
          const id = `PK-${Date.now()}`;
          parkData.value.unshift({ ...formModel, id });
          createMessage.success('新增车场成功');
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

  function resetForm() {
    formRef.value?.resetFields();
    Object.assign(formModel, {
      id: '',
      parkCode: '',
      parkName: '',
      city: '',
      address: '',
      totalSpaces: 0,
      availableSpaces: 0,
      chargeMode: 'hourly',
      chargeRule: '',
      openTime: '07:00',
      closeTime: '22:00',
      status: 'operating',
      contactPerson: '',
      contactPhone: '',
      remark: '',
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'operating':
        return 'success';
      case 'paused':
        return 'warning';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  }

  function getActions(record: ParkRecord) {
    return [
      {
        label: '编辑',
        onClick: () => handleEdit(record),
      },
      {
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '确认删除该车场吗？',
          onConfirm: () => handleDelete(record),
        },
      },
    ];
  }

  function handleDelete(record: ParkRecord) {
    parkData.value = parkData.value.filter((item) => item.id !== record.id);
    createMessage.success('已删除该车场（示例数据）');
    reloadTable();
  }
</script>

<style scoped>
  .park-form :deep(.ant-divider-inner-text) {
    font-weight: 600;
    color: #1f2a44;
  }
</style>
