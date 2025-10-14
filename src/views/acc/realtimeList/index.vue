<template>
  <div class="realtime-page">
    <a-row :gutter="12">
      <a-col :span="12" :xs="24" :sm="24" :md="12">
        <a-card title="人员列表" :bordered="false" class="block-card">
          <BasicTable @register="registerMemberTable">
            <template #authorized="{ text }">
              <a-tag :color="text === '已授权' ? 'green' : 'red'">{{ text }}</a-tag>
            </template>
          </BasicTable>
        </a-card>
      </a-col>

      <a-col :span="12" :xs="24" :sm="24" :md="12">
        <a-card title="设备列表" :bordered="false" class="block-card">
          <BasicTable @register="registerDeviceTable">
            <template #authorized="{ text }">
              <a-tag :color="text === '已授权' ? 'green' : 'red'">{{ text }}</a-tag>
            </template>
          </BasicTable>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { Card as ACard, Row as ARow, Col as ACol, Tag as ATag } from 'ant-design-vue';
import { BasicTable, useTable } from '/@/components/Table';
import {
  memberColumns,
  memberSearchFormSchema,
  deviceColumns,
  deviceSearchFormSchema,
  fetchAccMemberList,
  fetchAccDeviceList,
} from '/@/views/acc/accgroup/accgroup.data';

// 人员列表
const [registerMemberTable] = useTable({
  title: '人员',
  rowKey: 'id',
  columns: memberColumns,
  api: (params) => fetchAccMemberList(params),
  striped: true,
  showIndexColumn: false,
  fetchSetting: { pageField: 'pageNo', sizeField: 'pageSize', listField: 'records', totalField: 'total' },
  formConfig: {
    labelWidth: 80,
    showResetButton: true,
    schemas: memberSearchFormSchema,
  },
  pagination: { pageSize: 10, pageSizeOptions: ['10', '20', '50'] },
});

// 设备列表
const [registerDeviceTable] = useTable({
  title: '设备',
  rowKey: 'id',
  columns: deviceColumns,
  api: (params) => fetchAccDeviceList(params),
  striped: true,
  showIndexColumn: false,
  fetchSetting: { pageField: 'pageNo', sizeField: 'pageSize', listField: 'records', totalField: 'total' },
  formConfig: {
    labelWidth: 80,
    showResetButton: true,
    schemas: deviceSearchFormSchema,
  },
  pagination: { pageSize: 10, pageSizeOptions: ['10', '20', '50'] },
});
</script>

<style scoped>
.realtime-page {
  padding: 12px;
}
.block-card {
  background: #fff;
}
</style>