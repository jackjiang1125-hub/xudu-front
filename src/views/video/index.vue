<template>
  <div>
    <BasicTable
      @register="registerTable"
      :columns="columns"
      :api="listVideos"
      :formConfig="{ schemas: searchFormSchema }"
      :rowSelection="rowSelection"
    >
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd">新增视频流</a-button>
        <a-button
          type="primary"
          danger
          :disabled="!hasSelected"
          @click="handleBatchDelete"
        >
          批量删除
        </a-button>
        <a-button type="default" @click="handleExport">导出视频流</a-button>
        <a-button type="default" @click="handleImport">导入视频流</a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click.stop="handleEdit(record)">编辑</a-button>
          <a-button type="link" @click.stop="handlePlay(record)">播放</a-button>
          <a-button type="link" danger @click.stop="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </BasicTable>
    
    <VideoForm @register="registerForm" @success="handleSuccess" />
    <VideoPlayer @register="registerPlayer" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { Modal } from 'ant-design-vue';
import { columns, searchFormSchema } from './video.data';
import { listVideos, deleteVideo, deleteBatchVideos, exportVideos, importVideos } from './video.api';
import VideoForm from './VideoForm.vue';
import VideoPlayer from './VideoPlayer.vue';

const { createMessage } = useMessage();
const [registerTable, { reload, getSelectRows }] = useTable();
const [registerForm, { openModal }] = useModal();
const [registerPlayer, { openModal: openPlayerModal }] = useModal();

// 行选择配置
const rowSelection = {
  type: 'checkbox',
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    console.log('selectedRows: ', selectedRows);
  },
};

// 是否有选中项
const hasSelected = computed(() => {
  const selectedRows = getSelectRows();
  return selectedRows && selectedRows.length > 0;
});

// 新增
const handleAdd = () => {
  openModal(true, {
    isUpdate: false,
  });
};

// 编辑
const handleEdit = (record: any) => {
  openModal(true, {
    record,
    isUpdate: true,
  });
};

// 查看
const handleView = (record: any) => {
  openModal(true, {
    record,
    isUpdate: false,
    showFooter: false,
  });
};

// 播放
const handlePlay = (record: any) => {
  console.log('点击播放按钮，记录信息:', record);
  console.log('准备打开播放模态框...');
  openPlayerModal(true, { record });
  console.log('播放模态框已打开');
};

// 删除
const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该视频流吗？',
    onOk() {
      deleteVideo(record.id).then(() => {
        reload();
      }).catch((error) => {
        createMessage.error('删除失败：' + error.message);
      });
    },
  });
};

// 批量删除
const handleBatchDelete = () => {
  const selectedRows = getSelectRows();
  if (!selectedRows || selectedRows.length === 0) {
    createMessage.warning('请选择要删除的视频流');
    return;
  }
  
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.length} 个视频流吗？`,
    onOk() {
      const ids = selectedRows.map(row => row.id);
      deleteBatchVideos(ids).then(() => {
        createMessage.success('批量删除成功');
        reload();
      }).catch((error) => {
        createMessage.error('批量删除失败：' + error.message);
      });
    },
  });
};

// 导出
const handleExport = () => {
  exportVideos().then(() => {
    createMessage.success('导出成功');
  }).catch((error) => {
    createMessage.error('导出失败：' + error.message);
  });
};

// 导入
const handleImport = () => {
  // 创建文件输入元素
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      importVideos(file).then(() => {
        createMessage.success('导入成功');
        reload();
      }).catch((error) => {
        createMessage.error('导入失败：' + error.message);
      });
    }
  };
  input.click();
};

// 操作成功回调
const handleSuccess = () => {
  reload();
};
</script>
