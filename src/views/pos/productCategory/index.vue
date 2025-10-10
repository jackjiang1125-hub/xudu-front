<template>
  <PageWrapper title="商品分类管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="table-header">
          <a-alert type="info" message="演示数据仅用于界面展示，后端接口接入后可替换为真实数据。" show-icon />
          <a-space>
            <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">
              新增分类
            </a-button>
            <a-button preIcon="ant-design:reload-outlined" @click="reload">
              刷新
            </a-button>
          </a-space>
        </div>
      </template>
      <template #status="{ text }">
        <a-tag :color="text === 'enabled' ? 'success' : 'default'">
          {{ formatStatus(text) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
    </BasicTable>
    <BasicModal v-model:visible="detailVisible" title="分类详情" :footer="null" width="640">
      <a-descriptions v-if="detailRecord" bordered :column="2" size="small">
        <a-descriptions-item label="分类编号">{{ detailRecord.categoryCode }}</a-descriptions-item>
        <a-descriptions-item label="分类名称">{{ detailRecord.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="展示别名">{{ detailRecord.alias }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ detailRecord.manager }}</a-descriptions-item>
        <a-descriptions-item label="商品数量">{{ detailRecord.productCount }}</a-descriptions-item>
        <a-descriptions-item label="排序号">{{ detailRecord.displayOrder }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="detailRecord.status === 'enabled' ? 'success' : 'default'">
            {{ formatStatus(detailRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detailRecord.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ detailRecord.updatedAt }}</a-descriptions-item>
        <a-descriptions-item label="分类简介" :span="2">
          {{ detailRecord.description || '暂无简介' }}
        </a-descriptions-item>
        <a-descriptions-item label="备注信息" :span="2">
          {{ detailRecord.remark || '暂无备注' }}
        </a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="请选择一条分类记录查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    categoryColumns,
    categorySearchFormSchema,
    mockProductCategoryList,
    type ProductCategoryItem,
  } from './productCategory.data';

  dayjs.extend(isBetween);

  const categoryStore = ref<ProductCategoryItem[]>([...mockProductCategoryList]);
  const detailVisible = ref(false);
  const detailRecord = ref<ProductCategoryItem | null>(null);
  const { createMessage } = useMessage();

  const fetchCategoryList = async (params: Record<string, any> = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      categoryName,
      categoryCode,
      manager,
      status,
      createdAtRange,
    } = params;

    let items = [...categoryStore.value];

    if (categoryName) {
      const keyword = toSafeLower(categoryName);
      items = items.filter(
        (item) =>
          toSafeLower(item.categoryName).includes(keyword) ||
          toSafeLower(item.alias).includes(keyword),
      );
    }

    if (categoryCode) {
      const keyword = toSafeLower(categoryCode);
      items = items.filter((item) => toSafeLower(item.categoryCode).includes(keyword));
    }

    if (manager) {
      const keyword = toSafeLower(manager);
      items = items.filter((item) => toSafeLower(item.manager).includes(keyword));
    }

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    if (Array.isArray(createdAtRange) && createdAtRange.length === 2) {
      const [startValue, endValue] = createdAtRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => dayjs(item.createdAt).isBetween(start, end, null, '[]'));
      }
    }

    const total = items.length;
    const currentPage = Number(pageNo) || 1;
    const size = Number(pageSize) || 10;
    const startIndex = (currentPage - 1) * size;
    const records = items.slice(startIndex, startIndex + size);

    return {
      records,
      total,
    };
  };

  const [registerTable, { reload }] = useTable({
    title: '商品分类列表',
    rowKey: 'id',
    api: fetchCategoryList,
    columns: categoryColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: categorySearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    actionColumn: {
      width: 180,
      title: '操作',
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
  });

  function toSafeLower(value: unknown) {
    return String(value ?? '').toLowerCase();
  }

  function formatStatus(value: string) {
    return value === 'enabled' ? '启用' : '停用';
  }

  function handleCreate() {
    createMessage.info('示例数据，新增功能请接入后端接口后再实现。');
  }

  function handleView(record: ProductCategoryItem) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleToggle(record: ProductCategoryItem) {
    const target = categoryStore.value.find((item) => item.id === record.id);
    if (!target) return;
    target.status = target.status === 'enabled' ? 'disabled' : 'enabled';
    target.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    createMessage.success(
      `已将分类「${target.categoryName}」${target.status === 'enabled' ? '启用' : '停用'}`,
    );
    reload();
  }

  function getTableActions(record: ProductCategoryItem) {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: record.status === 'enabled' ? '停用' : '启用',
        color: record.status === 'enabled' ? 'warning' : 'success',
        onClick: handleToggle.bind(null, record),
      },
    ];
  }
</script>

<style scoped>
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .table-header .ant-alert {
    flex: 1;
  }
</style>
