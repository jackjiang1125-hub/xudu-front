<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增读头</a-button>
        <a-button
          type="primary"
          color="error"
          preIcon="ant-design:delete-outlined"
          :disabled="!hasSelected"
          @click="batchHandleDelete"
        >
          批量删除
        </a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '编辑',
              onClick: handleEdit.bind(null, record),
            },
            {
              label: '详情',
              onClick: handleDetail.bind(null, record),
            },
          ]"
          :dropDownActions="[
            {
              label: '删除',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                placement: 'topLeft',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <AccReaderModal @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" name="acc-reader" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import AccReaderModal from './AccReaderModal.vue';
  import { columns, searchFormSchema } from './accreader.data';
  import { listReaders, deleteReader, deleteBatchReaders } from './accreader.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const checkedKeys = ref<Array<string | number>>([]);
  
  // 列表页面hooks
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '读头管理',
      api: listReaders,
      columns,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        return Object.assign(params);
      },
    },
  });

  const [registerTable, { reload, getSelectRows }] = tableContext;

  // 注册弹窗
  const [registerModal, { openModal }] = useModal();

  // 选中行
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 50,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  // 是否有选中项
  const hasSelected = computed(() => checkedKeys.value.length > 0);

  /**
   * 选择列配置
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteReader({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  function batchHandleDelete() {
    if (!hasSelected.value) {
      createMessage.warning('请选择要删除的数据');
      return;
    }
    
    const ids = checkedKeys.value.join(',');
    deleteBatchReaders({ ids }, () => {
      checkedKeys.value = [];
      handleSuccess();
    });
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    reload();
  }
</script>

<style scoped></style>