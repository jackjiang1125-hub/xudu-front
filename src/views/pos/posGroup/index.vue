<template> 
  <div class="cons-group-page">
    <a-card :bordered="false" class="page-header-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-typography-title :level="4" style="margin-bottom: 4px">
            消费人群
          </a-typography-title>
          <a-typography-text type="secondary">
            用于对园区 / 校园内的就餐人员进行人群分组管理，为消费规则绑定提供可复用的“人群集合”
          </a-typography-text>
        </a-col>
      </a-row>
    </a-card>

    <a-card :bordered="false" class="content-card">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <PlusOutlined />
              新建人群
            </a-button>
          </a-space>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge
              :status="record.status === 1 ? 'success' : 'default'"
              :text="record.status === 1 ? '启用' : '停用'"
            />
          </template>

          <template v-else-if="column.key === 'action'">
            <TableAction
              :actions="[
                {
                  label: '编辑',
                  onClick: () => handleEdit(record),
                },
                {
                  label: record.status === 1 ? '停用' : '启用',
                  onClick: () => toggleStatus(record),
                },
              ]"
            />
          </template>
        </template>
      </BasicTable>
    </a-card>

    <GroupForm @register="registerModal" @success="reloadTable" />
  </div>
</template>

<script setup lang="ts">
  import { BasicTable, useTable, type BasicColumn, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import GroupForm from './components/GroupForm.vue';
  import { PlusOutlined } from '@ant-design/icons-vue';

  interface GroupRecord {
    id?: string;
    groupName: string;
    code: string;
    typeText: string;
    memberModeText: string;
    memberCount: number;
    status: number;
  }

  const columns: BasicColumn[] = [
    { title: '人群名称', dataIndex: 'groupName', width: 200 },
    { title: '编码', dataIndex: 'code', width: 160 },
    { title: '人群类型', dataIndex: 'typeText', width: 140 },
    { title: '成员规则', dataIndex: 'memberModeText', width: 160 },
    { title: '预估人数', dataIndex: 'memberCount', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 160, fixed: 'right' },
  ];

  async function fakeGroupListApi(params: Recordable) {
    console.log('加载消费人群列表参数', params);
    const list: GroupRecord[] = [
      {
        id: '1',
        groupName: '普通学生人群',
        code: 'STU_NORMAL',
        typeText: '学生',
        memberModeText: '按人',
        memberCount: 1200,
        status: 1,
      },
      {
        id: '2',
        groupName: '教职工人群',
        code: 'STAFF',
        typeText: '教职工',
        memberModeText: '按部门',
        memberCount: 180,
        status: 1,
      },
    ];
    return {
      list,
      total: list.length,
    };
  }

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '消费人群列表',
    api: fakeGroupListApi,
    columns,
    useSearchForm: false,
    showTableSetting: true,
    bordered: false,
    striped: false,
    showIndexColumn: false,
  });

  const [registerModal, { openModal }] = useModal();

  function handleAdd() {
    openModal(true, {});
  }

  function handleEdit(record: GroupRecord) {
    openModal(true, { record });
  }

  function toggleStatus(record: GroupRecord) {
    record.status = record.status === 1 ? 0 : 1;
  }
</script>

<style scoped>
  .cons-group-page {
    padding: 12px;
  }

  .page-header-card {
    margin-bottom: 12px;
  }

  .content-card {
    margin-top: 0;
  }
</style>
