<template>
  <PageWrapper title="餐厅档案">
    <BasicTable @register="registerTable">
      <!-- 工具栏 -->
      <template #toolbar>
        <a-space>
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">
            新增餐厅
          </a-button>
          <a-button 
            type="primary" 
            danger 
            preIcon="ant-design:delete-outlined" 
            @click="handleBatchDelete"
            :disabled="!hasSelectedRows"
          >
            批量删除
            <template v-if="selectedCount > 0" #suffix>
              <span class="selected-count">{{ selectedCount }}</span>
            </template>
          </a-button>

        </a-space>
      </template>
      
      <!-- 自定义列渲染 -->
      <template #category="{ text }">
        <a-tag color="processing">{{ formatCategory(text) }}</a-tag>
      </template>
      <template #serviceType="{ text }">
        <a-tag color="purple">{{ formatServiceType(text) }}</a-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </BasicTable>

    <!-- 详情模态框 -->
    <BasicModal v-model:visible="detailVisible" title="餐厅详情" :footer="null" width="600">
      <div v-if="detailRecord">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="餐厅编码">{{ detailRecord.restaurantCode }}</a-descriptions-item>
          <a-descriptions-item label="餐厅名称">{{ detailRecord.restaurantName }}</a-descriptions-item>
          <a-descriptions-item label="经营模式">{{ formatCategory(detailRecord.category) }}</a-descriptions-item>
          <a-descriptions-item label="餐厅类型">{{ formatServiceType(detailRecord.diningServiceType) }}</a-descriptions-item>
          <a-descriptions-item label="备注信息" :span="2">{{ detailRecord.remark || '暂无备注' }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <a-empty v-else description="请选择餐厅查看详情" />
    </BasicModal>
    
    <!-- 表单模态框 -->
    <BasicModal v-model:visible="drawerVisible" :title="currentRecord.id ? '编辑餐厅' : '新增餐厅'" width="600px" centered>
      <RestaurantModal :record="currentRecord" @success="handleSaved" @cancel="handleCancel" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import RestaurantModal from './RestaurantModal.vue';
  import { deleteRestaurant, deleteBatchRestaurants, listRestaurants } from './restaurant.api';
  import {
    diningServiceTypeOptions,
    restaurantCategoryOptions,
    restaurantColumns,
    restaurantSearchFormSchema,
    type RestaurantRecord
  } from './restaurant.data';

  dayjs.extend(isBetween);

  const detailVisible = ref(false);
  const detailRecord = ref<RestaurantRecord | null>(null);

  // 直接使用API获取数据
  const fetchRestaurantList = async (params: Record<string, any> = {}) => {
    const response = await listRestaurants(params);
    return response;
  };

  // 响应式引用，用于跟踪选中的行
  const selectedRowKeys = ref<string[]>([]);
  
  // 直接解构出需要的表格方法
  const [registerTable, { reload, getSelectRows, clearSelectedRowKeys }] = useTable({
    api: fetchRestaurantList,
    columns: restaurantColumns,
    rowKey: 'id',
    useSearchForm: true,
    formConfig: {
      labelWidth: 120,
      schemas: restaurantSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    rowSelection: {
        type: 'checkbox',
        selectedRowKeys: selectedRowKeys.value,
        // 添加行选择变化时的回调
        onChange: (selectedRowKeys, selectedRows) => {
          // 更新选中的行键
          selectedRowKeys.value = selectedRowKeys;
          // 更新选中数量
          selectedCount.value = selectedRows.length;
          
          // 当选择超过一定数量时给出提示
          if (selectedRows.length > 10 && selectedRows.length % 10 === 0) {
            createMessage.info(`已选择 ${selectedRows.length} 条记录`);
          }
        },
        // 全选时的回调
        onSelectAll: (selected, selectedRows, changeRows) => {
          // 更新选中数量
          selectedCount.value = selectedRows.length;
          
          // 全选大量数据时给出提示
          if (selected && selectedRows.length > 10) {
            createMessage.warning(`已全选 ${selectedRows.length} 条记录，大量删除可能需要较长时间`);
          }
        },
        // 可选：配置是否可以选择行的条件
        getCheckboxProps: (record) => ({
          // 可以根据记录状态禁用某些行的选择
          disabled: false
        })
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
    loading: false
  });
  
  // 简单的方法检查辅助函数
  const isFunction = (fn: any): fn is Function => {
    return typeof fn === 'function';
  };


  function toLower(value: unknown) {
    return String(value ?? '').toLowerCase();
  }

  function formatCategory(value: string) {
    const match = restaurantCategoryOptions.find((item) => item.value === value);
    return match ? match.label : value;
  }

  function formatServiceType(value: string) {
    const match = diningServiceTypeOptions.find((item) => item.value === value);
    return match ? match.label : value;
  }



  // 查看详情功能（暂未使用）
  // function handleView(record: RestaurantRecord) {
  //   detailRecord.value = { ...record };
  //   detailVisible.value = true;
  // }

  // 新增餐厅相关
  const drawerVisible = ref(false);
  const currentRecord = ref<any>({});
  const { createConfirm, createMessage } = useMessage();

  // 计算已选择的记录数量
  const selectedCount = ref(0);
  const hasSelectedRows = computed(() => selectedCount.value > 0);
  
  // 监听选择变化，更新选中数量
  const updateSelectedCount = () => {
    try {
      if (isFunction(getSelectRows)) {
        const selectedRows = getSelectRows();
        selectedCount.value = Array.isArray(selectedRows) ? selectedRows.length : 0;
      } else {
        selectedCount.value = 0;
      }
    } catch (error) {
      console.error('获取选中行失败:', error);
      selectedCount.value = 0;
    }
  };
  
  // 在组件挂载时重置选择状态
  if (import.meta.env.DEV) {
    // 开发环境下，可以添加一些调试信息
    console.log('餐厅管理页面已加载');
  }

  function handleAdd() {
    currentRecord.value = {};
    drawerVisible.value = true;
  }

  function handleEdit(record: RestaurantRecord) {
    currentRecord.value = { ...record };
    drawerVisible.value = true;
  }

  function handleDelete(record: RestaurantRecord) {
    createConfirm({
      title: '确认删除',
      content: `确定要删除餐厅【${record.restaurantName}】吗？`,
      async onOk() {
        await deleteRestaurant(record.id);
        createMessage.success('删除成功');
        if (isFunction(reload)) {
          reload();
        }
      },
    });
  }

  function handleSaved() {
    drawerVisible.value = false;
    if (isFunction(reload)) {
      reload();
    }
  }
  
  function handleCancel() {
    drawerVisible.value = false;
  }

  function handleBatchDelete() {
    // 获取选中的行数据
    let selectedRows: RestaurantRecord[] = [];
    try {
      selectedRows = getSelectRows() || [];
      
      // 判断是否有选择数据
      if (selectedRows.length === 0) {
        createMessage.warning('请选择要删除的餐厅');
        return;
      }
    } catch (error) {
      console.error('获取选中行失败:', error);
      createMessage.error('获取选中数据失败，请重试');
      return;
    }

    // 限制单次删除数量，避免操作过多数据
    const MAX_DELETE_COUNT = 50;
    if (selectedRows.length > MAX_DELETE_COUNT) {
      createMessage.warning(`单次最多只能删除${MAX_DELETE_COUNT}条数据，请减少选择数量`);
      return;
    }

    // 优化餐厅名称显示，过多时简化展示
    const restaurantNames = selectedRows
      .map((row) => row.restaurantName || '未命名餐厅')
      .join('、');
    
    const displayNames = selectedRows.length > 10 
      ? `${restaurantNames.substring(0, 100)}...` 
      : restaurantNames;
      
    // 获取选中的ID列表
    const ids = selectedRows.map((row) => row.id).join(',');

    createConfirm({
      title: '确认批量删除',
      content: `确定要删除选中的<strong>${selectedRows.length}</strong>个餐厅吗？<br/>${selectedRows.length <= 10 ? `包含：${displayNames}` : `部分餐厅：${displayNames}`}`,
      async onOk() {
        try {
          // 显示删除中的状态提示
          createMessage.loading('正在执行批量删除，请稍候...', { duration: 0 });
          
          // 调用批量删除API
          await deleteBatchRestaurants(ids);
          
          // 删除成功后清除加载提示
          createMessage.destroy();
          createMessage.success(`成功删除${selectedRows.length}个餐厅`);
          
          // 重置选择状态
          selectedCount.value = 0;
          // 清空选中行
          if (isFunction(clearSelectedRowKeys)) {
            clearSelectedRowKeys();
          }
          selectedRowKeys.value = [];
          
          // 重新加载数据
          if (isFunction(reload)) {
            await reload();
          }
        } catch (error: any) {
          // 清除加载提示
          createMessage.destroy();
          
          // 错误处理增强
          const errorMsg = error?.message || error?.errorMsg || '批量删除失败，请重试';
          createMessage.error(errorMsg);
          console.error('批量删除失败:', error);
        }
      },
    });
  }


</script>

<style scoped>
.selected-count {
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  border-radius: 10px;
  padding: 0 8px;
  font-size: 12px;
  margin-left: 5px;
}
</style>
