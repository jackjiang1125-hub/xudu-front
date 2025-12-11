<template>
  <PageWrapper contentFullHeight>
    <div class="account-page">
      <a-row :gutter="16" class="h-full">
        <a-col :span="6" class="h-full">
          <a-card bordered class="dept-card" :bodyStyle="{ padding: '10px 8px 8px' }">
            <div class="dept-card-header">
              <span class="title">部门筛选</span>
              <a-tag v-if="checkedDeptKeys.length" color="processing">
                已选 {{ checkedDeptKeys.length }} 个部门
              </a-tag>
              <a-tag v-else color="default">全部部门</a-tag>
            </div>
            <BasicTree
              :treeData="deptTreeData"
              checkable
              search
              :defaultExpandLevel="1"
              :checkedKeys="checkedDeptKeys"
              :expandedKeys="expandedKeys"
              @update:checkedKeys="onDeptCheck"
              @update:expandedKeys="onExpandChange"
            />
          </a-card>
        </a-col>

        <a-col :span="18" class="h-full">
          <a-card bordered class="list-card" :bodyStyle="{ padding: '10px 0 0' }">
            <BasicTable @register="registerTable">
              <template #type="{ text }">
                <a-tag color="blue">{{ formatType(text) }}</a-tag>
              </template>
              <template #level="{ text }">
                <a-tag color="purple">{{ formatLevel(text) }}</a-tag>
              </template>
              <template #status="{ text }">
                <a-tag :color="getStatusColor(text)">{{ formatStatus(text) }}</a-tag>
              </template>
              <template #action="{ record }">
                <TableAction :actions="getTableActions(record)" />
              </template>
            </BasicTable>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';

  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { BasicTree } from '/@/components/Tree';
  import type { TreeItem } from '/@/components/Tree';
  import { useMessage } from '/@/hooks/web/useMessage';

  import {
    accountLevelOptions,
    accountStatusOptions,
    accountTypeOptions,
    fallbackDeptTree,
    posAccountColumns,
    posAccountSearchFormSchema,
  } from './posAccount.data';
  import { getPosAccountList, getSysDepartments } from '/@/api/pos/posAccount';
  import type { PosAccountRecord, SysDepartModel } from '/@/api/pos/model/posAccountModel';

  const router = useRouter();
  const { createMessage } = useMessage();

  const deptTreeData = ref<TreeItem[]>([]);
  const checkedDeptKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);

  onMounted(() => {
    loadDepartments();
  });

  const [registerTable, { reload }] = useTable({
    rowKey: 'id',
    api: fetchAccountList,
    columns: posAccountColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 120,
      schemas: posAccountSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    showIndexColumn: false,
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
    beforeFetch: (params) => {
      const payload: Record<string, any> = { ...params };
      if (Array.isArray(payload.registerTimeRange) && payload.registerTimeRange.length === 2) {
        const [start, end] = payload.registerTimeRange;
        payload.registerTimeStart = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
        payload.registerTimeEnd = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
      }
      delete payload.registerTimeRange;
      if (checkedDeptKeys.value.length) {
        payload.deptIds = checkedDeptKeys.value.join(',');
      }
      return payload;
    },
  });

  function buildDeptTree(list: SysDepartModel[]) {
    const nodeMap = new Map<string, TreeItem & { children?: TreeItem[] }>();
    const roots: TreeItem[] = [];
    list.forEach((item) => {
      nodeMap.set(item.id, {
        title: item.departName,
        key: item.id,
        children: [],
      });
    });
    list.forEach((item) => {
      const node = nodeMap.get(item.id)!;
      if (item.parentId && nodeMap.has(item.parentId)) {
        const parent = nodeMap.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const leafKeys: string[] = [];
    const expandKeys: string[] = [];
    const loop = (items: TreeItem[]) => {
      items.forEach((item) => {
        expandKeys.push(String(item.key));
        const children = (item as any).children as TreeItem[] | undefined;
        if (children && children.length) {
          loop(children);
        } else {
          leafKeys.push(String(item.key));
        }
      });
    };
    loop(roots);
    return { tree: roots, leafKeys, expandKeys };
  }

  async function loadDepartments() {
    try {
      const list = await getSysDepartments();
      if (!list || !list.length) {
        applyDeptState(fallbackDeptTree);
        return;
      }
      const { tree, expandKeys } = buildDeptTree(list);
      deptTreeData.value = tree;
      expandedKeys.value = expandKeys;
      checkedDeptKeys.value = [];
    } catch (error) {
      console.warn('load dept tree failed', error);
      createMessage.warning('部门数据加载失败，已使用默认结构');
      applyDeptState(fallbackDeptTree);
    }
  }

  function applyDeptState(tree: TreeItem[]) {
    deptTreeData.value = tree;
    const expandKeys: string[] = [];
    const loop = (items: TreeItem[]) => {
      items.forEach((item) => {
        expandKeys.push(String(item.key));
        const children = (item as any).children as TreeItem[] | undefined;
        if (children && children.length) {
          loop(children);
        }
      });
    };
    loop(tree);
    expandedKeys.value = expandKeys;
    checkedDeptKeys.value = [];
  }

  function onDeptCheck(keys: string[]) {
    checkedDeptKeys.value = keys;
    reload({ page: 1 });
  }

  function onExpandChange(keys: string[]) {
    expandedKeys.value = keys;
  }

  async function fetchAccountList(params: Record<string, any>) {
    try {
      if (!checkedDeptKeys.value.length) {
        return { records: [], total: 0, pageNo: 1, pageSize: params?.pageSize || 10 };
      }
      return await getPosAccountList(params);
    } catch (error) {
      console.warn('load account list failed', error);
      createMessage.warning('暂无账户数据或接口暂不可用');
      return { records: [], total: 0, pageNo: 1, pageSize: params?.pageSize || 10 };
    }
  }

  function formatFromOptions<T extends string>(collection: { label: string; value: T }[], value: T) {
    const match = collection.find((item) => item.value === value);
    return match ? match.label : value;
  }

  function formatType(value: string) {
    return formatFromOptions(accountTypeOptions as any, value);
  }

  function formatLevel(value: string) {
    return formatFromOptions(accountLevelOptions as any, value);
  }

  function formatStatus(value: string) {
    return formatFromOptions(accountStatusOptions as any, value);
  }

  function getStatusColor(value: string) {
    switch (value) {
      case 'active':
        return 'green';
      case 'suspended':
        return 'orange';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  }

  function getTableActions(record: PosAccountRecord): ActionItem[] {
    return [
      {
        label: '账户操作',
        onClick: () => handleGoDetail(record),
      },
    ];
  }

  function handleGoDetail(record: PosAccountRecord) {
    router.push({
      path: '/pos/posAccountDetail',
      query: {
        accountId: record.id,
      },
    });
  }
</script>

<style scoped>
  .account-page {
    height: 100%;
  }

  .dept-card,
  .list-card {
    height: 100%;
  }

  .dept-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .dept-card-header .title {
    font-weight: 600;
    font-size: 14px;
  }
</style>
