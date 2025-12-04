<template>
  <div class="user-manage-container">
    <!-- 左侧统计/筛选侧边栏 -->
    <div class="manage-sidebar">
      <div class="sidebar-header">
        <div class="app-title">名单管理</div>
        <div class="subtitle">Black & White List</div>
      </div>

      <div class="kpi-group">
        <div class="kpi-card total">
          <div class="kpi-icon">👥</div>
          <div class="kpi-content">
            <div class="label">总人数</div>
            <div class="value">{{ total }}</div>
          </div>
        </div>
        <div class="kpi-card whitelist">
          <div class="kpi-icon">🛡️</div>
          <div class="kpi-content">
            <div class="label">白名单</div>
            <div class="value">{{ whiteCount }}</div>
          </div>
        </div>
        <div class="kpi-card blacklist">
          <div class="kpi-icon">🚫</div>
          <div class="kpi-content">
            <div class="label">黑名单</div>
            <div class="value">{{ blackCount }}</div>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <div class="filter-title">快速筛选</div>
        <div 
          :class="['filter-item', currentFilter === 'all' ? 'active' : '']"
          @click="handleFilterChange('all')"
        >
          <span>全部人员</span>
          <span class="count">{{ total }}</span>
        </div>
        <div 
          :class="['filter-item', currentFilter === '1' ? 'active' : '']"
          @click="handleFilterChange('1')"
        >
          <span class="dot white"></span>
          <span>白名单</span>
          <span class="count">{{ whiteCount }}</span>
        </div>
        <div 
          :class="['filter-item', currentFilter === '2' ? 'active' : '']"
          @click="handleFilterChange('2')"
        >
          <span class="dot black"></span>
          <span>黑名单</span>
          <span class="count">{{ blackCount }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧表格内容区 -->
    <div class="manage-content">
      <div class="content-header">
        <div class="header-title">{{ filterTitle }}列表</div>
        <div class="header-actions">
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索姓名/工号..."
            style="width: 240px"
            @search="handleSearch"
          />
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增人员</a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="import">批量导入</a-menu-item>
                <a-menu-item key="export">导出名单</a-menu-item>
              </a-menu>
            </template>
            <a-button>更多操作 <DownOutlined /></a-button>
          </a-dropdown>
        </div>
      </div>

      <div class="table-wrapper">
        <BasicTable @register="registerTable">
          <template #action="{ record }">
            <TableAction :actions="getTableActions(record)" />
          </template>
        </BasicTable>
      </div>
    </div>
  </div>

  <BasicDrawer v-model:visible="drawerVisible" title="人员信息" width="600px" :showFooter="false">
    <UserForm :record="currentRecord" @success="handleSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { DownOutlined } from '@ant-design/icons-vue';
import { columns, searchFormSchema } from './user.data';
import UserForm from './UserForm.vue';
import { listUsers, deleteUser, importUsers, type WecUserModel } from './user.api';

const { createMessage, createConfirm } = useMessage();

// 状态
const currentFilter = ref('all'); // all, 1(白), 2(黑)
const keyword = ref('');
const total = ref(0);
const whiteCount = ref(0);
const blackCount = ref(0);

const [registerTable, { reload, setProps, getDataSource }] = useTable({
  api: listUsers,
  rowKey: 'id',
  columns,
  actionColumn: { width: 160, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, showAdvancedButton: true }, // 保持原有搜索配置，但在界面上隐藏默认搜索栏，使用自定义搜索
  useSearchForm: false, // 禁用默认搜索栏，使用自定义头部
  showTableSetting: true,
  bordered: true,
  showIndexColumn: false,
  onChange: () => {
    // 列表变化时更新统计（简单模拟，实际应由接口返回）
    updateStats();
  }
});

const drawerVisible = ref(false);
const currentRecord = ref<Record<string, any>>({});

const filterTitle = computed(() => {
  if (currentFilter.value === '1') return '白名单';
  if (currentFilter.value === '2') return '黑名单';
  return '全部人员';
});

// 方法
function handleFilterChange(key: string) {
  currentFilter.value = key;
  const searchInfo: any = {};
  if (key !== 'all') {
    searchInfo.userType = key; // 假设 userType 1=白名单 2=黑名单，需根据实际字段调整
  }
  if (keyword.value) {
    searchInfo.realName = keyword.value;
  }
  setProps({ searchInfo });
  reload();
}

function handleSearch() {
  handleFilterChange(currentFilter.value);
}

function updateStats() {
  // 模拟统计数据更新，实际项目中建议单独调用统计接口
  const data = getDataSource();
  if (data) {
    // 这里仅为示例，实际应从后端获取准确总数
    // total.value = ...
  }
  // 临时模拟数据
  if (total.value === 0) {
    total.value = 128;
    whiteCount.value = 120;
    blackCount.value = 8;
  }
}

function handleAdd() { currentRecord.value = {}; drawerVisible.value = true; }
function handleEdit(record: WecUserModel) { currentRecord.value = { ...record }; drawerVisible.value = true; }
function handleSaved() { drawerVisible.value = false; reload(); updateStats(); }

function handleDelete(record: WecUserModel) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除人员【${record.realName}】吗？`,
    async onOk() {
      await deleteUser(String(record.id));
      createMessage.success('删除成功');
      reload();
      updateStats();
    },
  });
}

async function handleMenuClick({ key }: any) {
  if (key === 'import') {
    await importUsers({});
    createMessage.success('已触发导入');
  } else if (key === 'export') {
    createMessage.success('正在导出...');
  }
}

function getTableActions(record: WecUserModel) {
  return [
    { label: '编辑', onClick: handleEdit.bind(null, record) },
    { label: '删除', color: 'error', onClick: handleDelete.bind(null, record) },
  ];
}

onMounted(() => {
  updateStats();
});
</script>

<style scoped>
.user-manage-container {
  display: flex;
  height: calc(100vh - 110px);
  background: #f0f2f5;
  gap: 16px;
  padding: 16px;
}

/* Sidebar */
.manage-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.sidebar-header { margin-bottom: 24px; }
.app-title { font-size: 20px; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }
.subtitle { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; }

.kpi-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.kpi-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 1px solid #eee;
  transition: all 0.2s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.kpi-card.total .kpi-icon { background: #e6f7ff; color: #1890ff; }
.kpi-card.whitelist .kpi-icon { background: #f6ffed; color: #52c41a; }
.kpi-card.blacklist .kpi-icon { background: #fff1f0; color: #f5222d; }

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}
.kpi-content { flex: 1; }
.kpi-content .label { font-size: 12px; color: #666; }
.kpi-content .value { font-size: 20px; font-weight: 700; color: #1a1a1a; }

.filter-group { flex: 1; }
.filter-title { font-size: 12px; color: #999; margin-bottom: 12px; font-weight: 600; }
.filter-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  color: #666;
  transition: all 0.2s;
}
.filter-item:hover { background: #f5f5f5; color: #1a1a1a; }
.filter-item.active { background: #e6f7ff; color: #1890ff; font-weight: 600; }
.filter-item .count { margin-left: auto; font-size: 12px; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 10px; }
.filter-item.active .count { background: #fff; color: #1890ff; }
.dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
.dot.white { background: #52c41a; }
.dot.black { background: #f5222d; }

/* Content */
.manage-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.content-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-title { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.header-actions { display: flex; align-items: center; gap: 12px; }

.table-wrapper { flex: 1; padding: 16px; overflow: hidden; display: flex; flex-direction: column; }
</style>
