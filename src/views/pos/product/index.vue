<template>
  <PageWrapper title="商品管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="table-header">
          <a-alert type="info" message="商品列表仅展示示例数据，后续可替换为接口返回。" show-icon />
          <a-space>
            <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">
              新增商品
            </a-button>
            <a-button preIcon="ant-design:upload-outlined" @click="handleImport">
              批量导入
            </a-button>
            <a-button preIcon="ant-design:reload-outlined" @click="reload">
              刷新
            </a-button>
          </a-space>
        </div>
      </template>
      <template #salesType="{ text }">
        <a-tag color="processing">{{ formatSalesType(text) }}</a-tag>
      </template>
      <template #status="{ text }">
        <a-tag :color="text === 'available' ? 'success' : 'default'">
          {{ formatStatus(text) }}
        </a-tag>
      </template>
      <template #productName="{ record }">
        <div class="name-cell">
          <div class="name">{{ record.productName }}</div>
          <a-space :size="4" wrap>
            <a-tag v-for="tag in record.tags" :key="tag" color="blue" bordered>{{ tag }}</a-tag>
          </a-space>
        </div>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="商品详情" :footer="null" width="720">
      <a-descriptions v-if="detailRecord" bordered size="small" :column="2">
        <a-descriptions-item label="商品编码">{{ detailRecord.productCode }}</a-descriptions-item>
        <a-descriptions-item label="条形码">{{
          detailRecord.barcode || '无'
        }}</a-descriptions-item>
        <a-descriptions-item label="商品名称">{{ detailRecord.productName }}</a-descriptions-item>
        <a-descriptions-item label="所属分类">{{ detailRecord.categoryName }}</a-descriptions-item>
        <a-descriptions-item label="销售类型">{{ formatSalesType(detailRecord.salesType) }}</a-descriptions-item>
        <a-descriptions-item label="单位规格">{{ detailRecord.unit }} / {{ detailRecord.specification }}</a-descriptions-item>
        <a-descriptions-item label="销售价(元)">
          {{ Number(detailRecord.price).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="会员价(元)">
          {{ Number(detailRecord.memberPrice).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="成本价(元)">
          {{ Number(detailRecord.costPrice).toFixed(2) }}
        </a-descriptions-item>
        <a-descriptions-item label="库存数量">{{ detailRecord.inventory }}</a-descriptions-item>
        <a-descriptions-item label="安全库存">{{ detailRecord.safetyStock }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ detailRecord.manager }}</a-descriptions-item>
        <a-descriptions-item label="供应商">{{ detailRecord.supplier }}</a-descriptions-item>
        <a-descriptions-item label="更新状态">
          <a-tag :color="detailRecord.status === 'available' ? 'success' : 'default'">
            {{ formatStatus(detailRecord.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ detailRecord.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ detailRecord.updatedAt }}</a-descriptions-item>
        <a-descriptions-item label="标签" :span="2">
          <a-space :size="4" wrap>
            <a-tag v-for="tag in detailRecord.tags" :key="tag" bordered color="blue">
              {{ tag }}
            </a-tag>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="备注信息" :span="2">
          {{ detailRecord.remark || '暂无备注' }}
        </a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="请选择一条商品记录查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    mockProductList,
    productColumns,
    productSearchFormSchema,
    salesTypeOptions,
    type ProductItem,
  } from './product.data';

  const productStore = ref<ProductItem[]>([...mockProductList]);
  const detailVisible = ref(false);
  const detailRecord = ref<ProductItem | null>(null);
  const { createMessage } = useMessage();

  const fetchProductList = async (params: Record<string, any> = {}) => {
    const { pageNo = 1, pageSize = 10, productName, categoryCode, status, salesType, supplier } =
      params;
    let items = [...productStore.value];

    if (productName) {
      const keyword = toSafeLower(productName);
      items = items.filter(
        (item) =>
          toSafeLower(item.productName).includes(keyword) ||
          toSafeLower(item.productCode).includes(keyword),
      );
    }

    if (categoryCode) {
      items = items.filter((item) => item.categoryCode === categoryCode);
    }

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    if (salesType) {
      items = items.filter((item) => item.salesType === salesType);
    }

    if (supplier) {
      const keyword = toSafeLower(supplier);
      items = items.filter((item) => toSafeLower(item.supplier).includes(keyword));
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
    title: '商品列表',
    rowKey: 'id',
    api: fetchProductList,
    columns: productColumns.map((column) =>
      column.dataIndex === 'productName' ? { ...column, slots: { customRender: 'productName' } } : column,
    ),
    useSearchForm: true,
    formConfig: {
      labelWidth: 110,
      schemas: productSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    actionColumn: {
      width: 220,
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

  function formatSalesType(value: string) {
    const target = salesTypeOptions.find((item) => item.value === value);
    return target ? target.label : value;
  }

  function formatStatus(value: string) {
    return value === 'available' ? '在售' : '停售';
  }

  function handleCreate() {
    createMessage.info('示例界面，新增功能请接入后端接口后实现。');
  }

  function handleImport() {
    createMessage.info('请根据业务需求接入批量导入功能。');
  }

  function handleView(record: ProductItem) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleEdit(record: ProductItem) {
    createMessage.info(`编辑功能待接入，目标商品：${record.productName}`);
  }

  function handleAdjustInventory(record: ProductItem) {
    createMessage.info(`调整库存功能待接入，当前库存：${record.inventory}`);
  }

  function handleToggle(record: ProductItem) {
    const target = productStore.value.find((item) => item.id === record.id);
    if (!target) return;
    target.status = target.status === 'available' ? 'disabled' : 'available';
    target.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    createMessage.success(
      `已将商品「${target.productName}」${target.status === 'available' ? '上架' : '下架'}`,
    );
    reload();
  }

  function getTableActions(record: ProductItem) {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: record.status === 'available' ? '下架' : '上架',
        color: record.status === 'available' ? 'warning' : 'success',
        onClick: handleToggle.bind(null, record),
      },
      {
        label: '调整库存',
        onClick: handleAdjustInventory.bind(null, record),
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

  .name-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .name-cell .name {
    font-weight: 500;
  }
</style>
