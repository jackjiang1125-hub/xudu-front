<template>
  <PageWrapper title="商品分类管理">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="table-header">
          <a-space>
            <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">
              新增分类
            </a-button>
            <a-button type="primary" danger preIcon="ant-design:delete-outlined" @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
              批量删除 ({{ selectedRowKeys.length }})
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

    <BasicModal
      v-model:visible="formVisible"
      :title="currentRecord?.id ? '编辑分类' : '新增分类'"
      width="640px"
      :footer="null"
    >
      <ProductCategoryModal
        :key="modalKey.value"
        :record="currentRecord"
        @success="handleModalSuccess"
        @cancel="() => {
          formVisible.value = false;
          // 取消时也更新key，强制重新创建组件
          modalKey.value++;
        }"
      />
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
    type ProductCategoryItem,
  } from './productCategory.data';
import {
  listProductCategory,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
  deleteBatchProductCategory
} from './productCategory.api';
import ProductCategoryModal from './ProductCategoryModal.vue';

  dayjs.extend(isBetween);


  const formVisible = ref(false);
  const currentRecord = ref<ProductCategoryItem | null>(null);
  const modalKey = ref(0); // 添加key用于强制组件重新渲染
  const { createMessage, createConfirm } = useMessage();

  const fetchCategoryList = async (params: Record<string, any> = {}) => {
    try {
      // 直接调用后端API获取数据
      const result = await listProductCategory(params);
      console.log('API返回的原始数据:', result);
      
      // 确保返回的数据格式符合BasicTable组件的要求
      // JeecgBoot通常返回格式: {code: 200, data: {records: [...], total: ...}, message: 'success'}
      if (result && result.data) {
        return result.data;
      }
      return result;
    } catch (error) {
      console.error('获取分类列表失败:', error);
      // 返回空数据，避免表格显示错误
      return { records: [], total: 0 };
    }
  };

  const selectedRowKeys = ref<string[]>([]);
  const rowSelection = ref({
    selectedRowKeys: selectedRowKeys,
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys;
    },
  });

  const [registerTable, { reload, getSelectRows }] = useTable({
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
    rowSelection: rowSelection.value,
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
    // 先关闭弹窗
    formVisible.value = false;
    
    // 增加key值强制组件重新创建
    modalKey.value++;
    
    // 确保currentRecord完全清空
    currentRecord.value = null;
    
    // 短暂延迟后打开弹窗
    setTimeout(() => {
      formVisible.value = true;
    }, 100); // 稍微增加延迟时间，确保组件完全销毁和重建
  }

  function handleEdit(record: ProductCategoryItem) {
    // 先关闭弹窗
    formVisible.value = false;
    
    // 增加key值强制组件重新创建
    modalKey.value++;
    
    // 设置当前记录
    currentRecord.value = { ...record };
    
    // 短暂延迟后打开弹窗
    setTimeout(() => {
      formVisible.value = true;
    }, 100);
  }

  function handleModalSuccess(values: any) {
    // 先关闭弹窗
    formVisible.value = false;
    
    // 增加key值强制组件重新创建
    modalKey.value++;
    
    // 清空当前记录
    currentRecord.value = null;
    
    if (values.id) {
      // 调用后端API编辑数据
      editProductCategory(values).then(() => {
        createMessage.success('编辑分类成功');
        reload();
      });
    } else {
      // 调用后端API新增数据
      addProductCategory(values).then(() => {
        createMessage.success('新增分类成功');
        reload();
      });
    }
  }



  function handleBatchDelete() {
    const selectedRows = getSelectRows();
    if (!selectedRows || selectedRows.length === 0) {
      createMessage.warning('请先选择要删除的分类');
      return;
    }
    
    createConfirm({
      title: '确认删除',
      content: `确定要删除选中的${selectedRows.length}条商品分类吗？`,
      async onOk() {
        const ids = selectedRows.map(row => row.id);
        // 调用后端API批量删除
        await deleteBatchProductCategory(ids);
        createMessage.success(`成功删除 ${selectedRows.length} 个分类`);
        selectedRowKeys.value = [];
        reload();
      },
    });
  }

  function handleDelete(record: ProductCategoryItem) {
    createConfirm({
      title: '确认删除',
      content: `确定要删除分类「${record.categoryName}」吗？此操作不可恢复。`,
      async onOk() {
        // 调用后端API删除
        await deleteProductCategory(record.id);
        createMessage.success('删除分类成功');
        reload();
      },
    });
  }

  function getTableActions(record: ProductCategoryItem) {
    return [
      {
        label: '修改',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        color: 'danger',
        onClick: handleDelete.bind(null, record),
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
</style>
