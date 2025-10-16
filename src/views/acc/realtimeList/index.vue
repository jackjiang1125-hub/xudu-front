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
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { BasicTable, useTable } from '/@/components/Table';
import {
  memberColumns,
  memberSearchFormSchema,
  deviceColumns,
  deviceSearchFormSchema,
  fetchAccMemberList,
  fetchAccDeviceList,
} from '/@/views/acc/accgroup/accgroup.data';
import { getAccGroupDetail } from '/@/views/acc/accgroup/accgroup.api';

// 人员列表
const memberTableReady = ref(false);
const route = useRoute();
const currentGroupId = ref<string>('');
const memberIds = ref<string[]>([]);
const deviceIds = ref<string[]>([]);

async function loadGroupIdsIfNeeded() {
  const gid = (route.query.groupId as string) || '';
  currentGroupId.value = gid;
  if (!gid) {
    memberIds.value = [];
    deviceIds.value = [];
    return;
  }
  try {
    const detail = await getAccGroupDetail(gid);
    memberIds.value = (detail?.members ?? []).map((id: any) => String(id));
    deviceIds.value = (detail?.devices ?? []).map((id: any) => String(id));
  } catch (e) {
    memberIds.value = [];
    deviceIds.value = [];
  }
}

const [internalRegisterMemberTable, { reload: reloadMember }] = useTable({
  title: '人员',
  rowKey: 'id',
  columns: memberColumns,
  api: (params) => {
    const ids = memberIds.value?.length ? memberIds.value.join(',') : undefined;
    return fetchAccMemberList({ ...params, ids });
  },
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

function registerMemberTable(...args: any[]) {
  (internalRegisterMemberTable as any)(...args);
  memberTableReady.value = true;
  // 首次进入主动刷新一次
  reloadMember();
}

// 设备列表
const deviceTableReady = ref(false);
const [internalRegisterDeviceTable, { reload: reloadDevice }] = useTable({
  title: '设备',
  rowKey: 'id',
  columns: deviceColumns,
  api: (params) => {
    const ids = deviceIds.value?.length ? deviceIds.value.join(',') : undefined;
    return fetchAccDeviceList({ ...params, ids });
  },
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

function registerDeviceTable(...args: any[]) {
  (internalRegisterDeviceTable as any)(...args);
  deviceTableReady.value = true;
  reloadDevice();
}

// 定时刷新，实时更新列表
let timer: any = null;
const REFRESH_INTERVAL = 15000; // 15s
onMounted(() => {
  // 初次加载，如果带有 groupId 参数，按权限组过滤
  loadGroupIdsIfNeeded().then(() => {
    if (memberTableReady.value) reloadMember();
    if (deviceTableReady.value) reloadDevice();
  });
  timer = setInterval(() => {
    if (memberTableReady.value) reloadMember();
    if (deviceTableReady.value) reloadDevice();
  }, REFRESH_INTERVAL);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 监听路由参数变化（从权限组页面跳转附带 groupId）
watch(
  () => route.query.groupId,
  async () => {
    await loadGroupIdsIfNeeded();
    if (memberTableReady.value) reloadMember();
    if (deviceTableReady.value) reloadDevice();
  }
);
</script>

<style scoped>
.realtime-page {
  padding: 12px;
}
.block-card {
  background: #fff;
}
</style>