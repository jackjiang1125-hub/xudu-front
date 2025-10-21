<template>
  <div class="p-2">
    <BasicTable @register="registerTable">
      <template #tableTitle>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <AccDoorModal @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="acc-door-list" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { columns, searchFormSchema } from './accdoor.data';
  import { listDoor, deleteDoor, getDoorDetail } from './accdoor.api';
  import AccDoorModal from './AccDoorModal.vue';
  import { Modal } from 'ant-design-vue';

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    tableProps: {
      title: '门列表',
      api: listDoor,
      columns,
      formConfig: { labelWidth: 120, schemas: searchFormSchema },
      showIndexColumn: true,
      actionColumn: { width: 160, title: '操作', slots: { customRender: 'action' } },
    },
  });

  const [registerTable, { reload }] = tableContext;
  const [registerModal, { openModal }] = useModal();

  function handleCreate() {
    openModal(true, { isUpdate: false });
  }

  function handleEdit(record) {
    openModal(true, { isUpdate: true, id: record.id });
  }

  function handleDetail(record) {
    getDoorDetail({ id: record.id }).then((res) => {
      const data = res?.result || {};
      const content = Object.keys(data)
        .map((k) => `${k}: ${data[k]}`)
        .join('\n');
      Modal.info({ title: '门详情', content: content.replace(/\n/g, '<br/>') });
    });
  }

  function handleDelete(record) {
    deleteDoor({ id: record.id }, reload);
  }

  function getTableAction(record) {
    return [
      { label: '编辑', icon: 'ant-design:edit-outlined', onClick: handleEdit.bind(null, record) },
      { label: '详情', icon: 'ant-design:info-circle-outlined', onClick: handleDetail.bind(null, record) },
    ];
  }
</script>
<style scoped></style>