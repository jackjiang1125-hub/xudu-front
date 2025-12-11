<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="920"
    @ok="handleOk"
  >
    <a-row :gutter="12">
      <!-- 左侧：部门树 -->
      <a-col :span="7">
        <a-card
          size="small"
          class="selector-left-card"
          :bordered="false"
          title="部门/班级"
        >
          <a-spin :spinning="deptLoading">
            <a-tree
              v-if="deptTree.length"
              :tree-data="deptTree"
              :field-names="treeFieldNames"
              :checkable="isDeptMode"
              v-model:selectedKeys="deptSelectedKeys"
              v-model:checkedKeys="deptCheckedKeys"
              :default-expand-all="true"
              block-node
              @select="onDeptSelect"
              @check="onDeptCheck"
            />
            <a-empty v-else description="暂无部门数据" />
          </a-spin>
        </a-card>
      </a-col>

      <!-- 右侧：主内容 -->
      <a-col :span="17">
        <a-card size="small" :bordered="false" class="selector-right-card">
          <template #title>
            <a-space>
              <span v-if="isPersonMode">成员选择</span>
              <span v-else>部门选择</span>
              <a-tag v-if="isPersonMode" color="blue" class="selector-tag">
                仅显示 user_type=2 的业务人员
              </a-tag>
            </a-space>
          </template>

          <!-- 🔹 按人模式 -->
          <template v-if="isPersonMode">
            <!-- 查询条件 -->
            <a-form
              layout="inline"
              class="selector-search-form"
              @submit.prevent
            >
              <a-form-item label="姓名">
                <a-input
                  v-model:value="userQuery.realname"
                  allowClear
                  placeholder="姓名模糊查询"
                  @pressEnter="reloadUser"
                  style="width: 160px"
                />
              </a-form-item>
              <a-form-item label="账号">
                <a-input
                  v-model:value="userQuery.username"
                  allowClear
                  placeholder="账号/工号"
                  @pressEnter="reloadUser"
                  style="width: 160px"
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" size="small" @click="reloadUser">
                  查询
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button size="small" @click="resetUser">
                  重置
                </a-button>
              </a-form-item>
            </a-form>

            <!-- 人员列表（分页 + 多选） -->
            <a-table
              size="small"
              :loading="userLoading"
              :columns="userColumns"
              :data-source="userList"
              row-key="id"
              :pagination="userPagination"
              :row-selection="userRowSelection"
              :scroll="{ y: 260 }"
              @change="onUserTableChange"
            />

            <!-- 已选成员预览 -->
            <a-divider orientation="left" style="margin: 12px 0 8px">
              已选成员预览
            </a-divider>
            <a-alert
              banner
              type="info"
              :show-icon="false"
              style="margin-bottom: 6px"
            >
              已选择 <b>{{ selectedUserCount }}</b> 人
            </a-alert>
            <a-table
              size="small"
              :columns="userPreviewColumns"
              :data-source="selectedUserList"
              row-key="id"
              :pagination="{ pageSize: 8 }"
              bordered
            />
          </template>

          <!-- 🔹 按部门模式 -->
          <template v-else>
            <a-alert
              type="info"
              show-icon
              style="margin-bottom: 8px"
              message="当前为按部门/班级模式：左侧勾选部门树，右侧展示已选部门列表。"
            />
            <a-table
              size="small"
              :columns="deptPreviewColumns"
              :data-source="selectedDeptList"
              row-key="id"
              :pagination="{ pageSize: 10 }"
              bordered
            />
          </template>
        </a-card>
      </a-col>
    </a-row>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    userColumns,
    userPreviewColumns,
    deptPreviewColumns,
  } from './userSelector.data';
  import {
    fetchDeptTree,
    queryUserPage,
    getUsersByIds,
    type SysUserModel,
  } from '/@/api/sys/userSelector.api';

  const emit = defineEmits<{
    (e: 'register', fn: any): void;
    (e: 'ok', payload: { type: 'person' | 'dept'; ids: string[]; rows?: any[] }): void;
  }>();

  const { createMessage } = useMessage();

  /** 模式：按人 / 按部门 */
  const innerMode = ref<'person' | 'dept'>('person');
  const isPersonMode = computed(() => innerMode.value === 'person');
  const isDeptMode = computed(() => innerMode.value === 'dept');
  const modalTitle = computed(() =>
    innerMode.value === 'person' ? '选择成员' : '选择部门/班级',
  );

  /** 部门树 */
  const deptTree = ref<any[]>([]);
  const deptLoading = ref(false);
  const treeFieldNames = { title: 'title', key: 'key', children: 'children' };
  const deptSelectedKeys = ref<string[]>([]);
  const deptCheckedKeys = ref<(string | number)[]>([]);

  /** 人员查询 & 列表 */
  const userQuery = reactive({
    departId: '',
    realname: '',
    username: '',
  });
  const userLoading = ref(false);
  const userList = ref<SysUserModel[]>([]);
  const userPage = reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });

  const userPagination = computed(() => ({
    current: userPage.pageNo,
    pageSize: userPage.pageSize,
    total: userPage.total,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 人`,
  }));

  /** 已选人员 / 部门（跨页不丢） */
  const selectedUserMap = ref<Record<string, SysUserModel>>({});
  const selectedDeptMap = ref<Record<string, any>>({});

  const selectedUserList = computed(() => Object.values(selectedUserMap.value));
  const selectedDeptList = computed(() => Object.values(selectedDeptMap.value));

  const selectedUserCount = computed(() => selectedUserList.value.length);
  const selectedUserKeys = computed(() => Object.keys(selectedUserMap.value));

  // table rowSelection
  const userRowSelection = computed(() => ({
    selectedRowKeys: selectedUserKeys.value,
    onChange: handleUserSelectChange,
  }));

  /** Modal 注册：接收打开参数 */
  const [registerModal, { closeModal, setModalProps }] = useModalInner(
    async (data?: { mode?: 'person' | 'dept'; selectedIds?: string[] }) => {
      setModalProps({ confirmLoading: false });

      innerMode.value = data?.mode === 'dept' ? 'dept' : 'person';

      // 重置状态
      selectedUserMap.value = {};
      selectedDeptMap.value = {};
      deptSelectedKeys.value = [];
      deptCheckedKeys.value = [];
      userQuery.departId = '';
      userQuery.realname = '';
      userQuery.username = '';
      userPage.pageNo = 1;

      // 优先加载部门树
      if (!deptTree.value.length) {
        await loadDeptTree();
      }

      const selectedIds = data?.selectedIds || [];

      if (innerMode.value === 'person') {
        // 反查已选成员预览
        if (selectedIds.length) {
          await loadSelectedUsersByIds(selectedIds);
        }
        await loadUserPage();
      } else {
        // 按部门模式：根据已选ID在部门树中反查节点，带上 orgCode / orgType
        const map: Record<string, any> = {};
        selectedIds.forEach((id) => {
          const node = findDeptNodeByKey(deptTree.value, id);
          if (node) {
            map[id] = {
              id,
              key: node.key ?? node.id ?? id,
              title: node.title ?? node.departName,
              orgCode: node.orgCode,
              orgType: node.orgType,
              path: node.title ?? node.departName,
            };
          } else {
            // 找不到就简单占位
            map[id] = {
              id,
              key: id,
              title: `部门/班级 ${id}`,
              orgCode: '',
              orgType: '',
              path: `部门路径 / ${id}`,
            };
          }
        });
        selectedDeptMap.value = map;
        deptCheckedKeys.value = selectedIds;
      }
    },
  );

  /** 递归查找部门节点 */
  function findDeptNodeByKey(tree: any[], key: string): any | null {
    const strKey = String(key);
    for (const node of tree) {
      if (String(node.key ?? node.id) === strKey) {
        return node;
      }
      if (node.children && node.children.length) {
        const found = findDeptNodeByKey(node.children, strKey);
        if (found) return found;
      }
    }
    return null;
  }

  /** 加载部门树 */
  async function loadDeptTree() {
    deptLoading.value = true;
    try {
      const list: any = await fetchDeptTree();
      deptTree.value = Array.isArray(list) ? list : [];
    } catch (e) {
      console.error('加载部门树失败', e);
      deptTree.value = [];
      createMessage.error('加载部门数据失败');
    } finally {
      deptLoading.value = false;
    }
  }

  /** 加载人员分页（只要 user_type=2） */
  async function loadUserPage() {
    if (!isPersonMode.value) return;
    userLoading.value = true;
    try {
      const page: any = await queryUserPage({
        pageNo: userPage.pageNo,
        pageSize: userPage.pageSize,
        departId: userQuery.departId || undefined,
        realname: userQuery.realname || undefined,
        username: userQuery.username || undefined,
        userType: 2, // 后端可以按此过滤
      });

      let records: SysUserModel[] = Array.isArray(page.records) ? page.records : [];

      // 前端兜底过滤一层
      records = records.filter(
        (u: any) => u.userType === 2 || u.userType === '2',
      );

      userList.value = records;
      userPage.total = typeof page.total === 'number' ? page.total : records.length;
      userPage.pageNo = page.current || userPage.pageNo;
      userPage.pageSize = page.size || userPage.pageSize;
    } catch (e) {
      console.error('加载人员失败', e);
      userList.value = [];
      userPage.total = 0;
      createMessage.error('加载人员数据失败');
    } finally {
      userLoading.value = false;
    }
  }

  function reloadUser() {
    userPage.pageNo = 1;
    loadUserPage();
  }

  function resetUser() {
    userQuery.realname = '';
    userQuery.username = '';
    userPage.pageNo = 1;
    loadUserPage();
  }

  /** 部门树点击：按人模式下联动过滤人员 */
  function onDeptSelect(keys: any[]) {
    if (!isPersonMode.value) return;
    const key = keys && keys.length ? String(keys[0]) : '';
    deptSelectedKeys.value = key ? [key] : [];
    userQuery.departId = key;
    userPage.pageNo = 1;
    loadUserPage();
  }

  /** 部门树勾选：按部门模式下更新选中部门（带 orgCode / orgType） */
  function onDeptCheck(checked: any, info: any) {
    if (!isDeptMode.value) return;
    const checkedNodes = info.checkedNodes || [];
    const map: Record<string, any> = {};
    checkedNodes.forEach((node: any) => {
      const id = String(node.key ?? node.id);
      map[id] = {
        id,
        key: id,
        title: node.title ?? node.departName,
        orgCode: node.orgCode,
        orgType: node.orgType,
        path: node.title ?? node.departName, // 右侧列表的“路径”列，简单用名称占位
      };
    });
    selectedDeptMap.value = map;
  }

  /** 人员表分页切换 */
  function onUserTableChange(pagination: any) {
    userPage.pageNo = pagination.current || 1;
    userPage.pageSize = pagination.pageSize || userPage.pageSize;
    loadUserPage();
  }

  /** 跨页多选：维护 selectedUserMap */
  function handleUserSelectChange(keys: (string | number)[], rows: SysUserModel[]) {
    const keySet = new Set<string>(keys.map((k) => String(k)));
    const currentIds = userList.value.map((u) => String(u.id));

    const newMap: Record<string, SysUserModel> = {};
    // 保留非当前页的已选
    Object.entries(selectedUserMap.value).forEach(([id, val]) => {
      if (!currentIds.includes(id)) {
        newMap[id] = val as SysUserModel;
      }
    });
    // 当前页根据 keySet 决定是否加入
    userList.value.forEach((row) => {
      const id = String(row.id);
      if (keySet.has(id)) {
        newMap[id] = row;
      }
    });

    selectedUserMap.value = newMap;
  }

  /** 根据 ID 反查用户（用于编辑时回填预览） */
  async function loadSelectedUsersByIds(ids: string[]) {
    if (!ids.length) {
      selectedUserMap.value = {};
      return;
    }
    try {
      const list: SysUserModel[] = await getUsersByIds(ids);
      const map: Record<string, SysUserModel> = {};
      (list || []).forEach((u) => {
        const id = String(u.id);
        map[id] = u;
      });
      selectedUserMap.value = map;
    } catch (e) {
      console.error('根据ID加载用户失败', e);
      selectedUserMap.value = {};
    }
  }

  /** 确认选择 */
  function handleOk() {
    let ids: string[] = [];
    let rows: any[] = [];

    if (isPersonMode.value) {
      ids = Object.keys(selectedUserMap.value);
      rows = Object.values(selectedUserMap.value);
    } else {
      ids = Object.keys(selectedDeptMap.value);
      rows = Object.values(selectedDeptMap.value);
    }

    emit('ok', {
      type: innerMode.value,
      ids,
      rows,
    });
    closeModal();
  }
</script>

<style scoped>
  .selector-left-card {
    height: 100%;
    min-height: 400px;
    overflow: hidden;
  }

  .selector-right-card {
    min-height: 400px;
  }

  .selector-tag {
    font-size: 12px;
  }

  .selector-search-form {
    margin-bottom: 8px;
  }
</style>
