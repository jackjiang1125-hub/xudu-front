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
          <a-button 
            type="primary" 
            danger
            preIcon="ant-design:delete-outlined" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchAction({ key: 'delete' })"
          >
            批量删除
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="handleAddFromSystem('1')">添加到白名单</a-menu-item>
                <a-menu-item key="2" @click="handleAddFromSystem('2')">添加到黑名单</a-menu-item>
              </a-menu>
            </template>
            <a-button type="primary" preIcon="ant-design:plus-outlined">从系统中选择 <DownOutlined /></a-button>
          </a-dropdown>
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

  <UserForm @register="registerDrawer" @success="handleSaved" />

  <!-- 系统用户选择弹窗 -->
  <UserSelectModalBiz 
    :key="userSelectModalKey"
    :multi="true" 
    @register="registerUserSelectModal" 
    @selected="onUserSelected" 
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { DownOutlined } from '@ant-design/icons-vue';
import { columns, searchFormSchema } from './user.data';
import UserForm from './UserForm.vue';
import { listUsers, deleteUser, deleteBatch, importUsers, getStatistics, addFromSystem, type WecUserModel } from './user.api';
import UserSelectModalBiz from '/@/components/Form/src/jeecg/components/userSelect/UserSelectModalBiz.vue';
import { useModal } from '/@/components/Modal';

const { createMessage, createConfirm } = useMessage();
const userSelectModalKey = ref(0); // Key to force re-render to clear selection

// 状态
const currentFilter = ref('all'); // all, 1(白), 2(黑)
const keyword = ref('');
const total = ref(0);
const whiteCount = ref(0);
const blackCount = ref(0);

const selectedRowKeys = ref<string[]>([]);
const [registerTable, { reload, setProps, getDataSource, getSelectRowKeys, clearSelectedRowKeys }] = useTable({
  api: listUsers,
  rowKey: 'id',
  columns,
  actionColumn: { width: 160, fixed: 'right', title: '操作', slots: { customRender: 'action' } },
  formConfig: { labelWidth: 120, schemas: searchFormSchema, showAdvancedButton: true },
  useSearchForm: false, 
  showTableSetting: true,
  bordered: true,
  showIndexColumn: false,
  rowSelection: { 
    type: 'checkbox',
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys;
    }
  },
  onChange: () => {
    updateStats();
  }
});

function handleBatchAction({ key }) {
  if (key === 'delete') {
    const ids = selectedRowKeys.value;
    if (!ids || ids.length === 0) return;
    createConfirm({
      title: '确认删除',
      content: `确定要删除选中的 ${ids.length} 条记录吗？`,
      iconType: 'warning',
      async onOk() {
        await deleteBatch(ids.join(','));
        createMessage.success('删除成功');
        clearSelectedRowKeys();
        selectedRowKeys.value = [];
        reload();
        updateStats();
      },
    });
  }
}

const [registerDrawer, { openDrawer }] = useDrawer();

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
    searchInfo.userType = key;
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

async function updateStats() {
  try {
    const res = await getStatistics();
    if (res) {
      total.value = res.total || 0;
      whiteCount.value = res.white_count || 0;
      blackCount.value = res.black_count || 0;
    }
  } catch (e) {
    console.error('Failed to fetch statistics', e);
  }
}

function handleEdit(record: WecUserModel) {
  openDrawer(true, {
    record,
    isUpdate: true,
  });
}

function handleSaved() {
  reload();
  updateStats();
}

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
    // Trigger file upload manually or use JImportModal
    createMessage.info('请使用系统通用的导入功能或开发专用导入组件');
  } else if (key === 'export') {
    createMessage.success('正在导出...');
    // Call export API
  } else if (key === 'addFromSystem') {
    openUserSelectModal(true);
  }
}

// User Select Modal
const [registerUserSelectModal, { openModal: openUserSelectModal, closeModal: closeUserSelectModal }] = useModal();
const targetUserType = ref('1'); // 1=White, 2=Black

function handleAddFromSystem(type: string) {
  targetUserType.value = type;
  userSelectModalKey.value += 1; // Force component re-creation to clear selection
  // Need to wait for nextTick for re-render, but openModal might work if component is ready
  // However, re-creating component might lose the register hook reference temporarily
  // Better approach: Use a small timeout or nextTick before opening
  setTimeout(() => {
    openUserSelectModal(true, {});
  }, 50);
}

async function onUserSelected(users: any[]) {
  if (!users || users.length === 0) return;
  const ids = users.map((u: any) => u.id);
  try {
    await addFromSystem({ userIds: ids, userType: targetUserType.value });
    createMessage.success(`已添加 ${ids.length} 名人员到${targetUserType.value === '1' ? '白名单' : '黑名单'}`);
    closeUserSelectModal();
    
    // Clear selection cache if the component supports it, or just rely on reload
    // Ideally UserSelectModalBiz should handle clearing its own selection on close/re-open
    
    reload();
    updateStats();
  } catch (e) {
    createMessage.error('添加失败');
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
