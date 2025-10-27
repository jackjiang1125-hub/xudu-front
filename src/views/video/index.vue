<template>
  <div>
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
    >
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd">Add Video</a-button>
        <a-button
          type="primary"
          danger
          :disabled="!hasSelected"
          @click="handleBatchDelete"
        >
          Delete Selected
        </a-button>
        <a-button type="default" @click="handleExport">Export</a-button>
        <a-button type="default" @click="handleImport">Import</a-button>
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
    <NvrPlayer @register="registerNvrPlayer" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { Modal } from 'ant-design-vue';
import { columns, searchFormSchema } from './video.data';
import { listVideos, deleteVideo, deleteBatchVideos, exportVideos, importVideos } from './video.api';
import { initDictOptions } from '/@/utils/dict/index';
import VideoForm from './VideoForm.vue';
import VideoPlayer from './VideoPlayer.vue';
import NvrPlayer from './NvrPlayer.vue';

const { createMessage } = useMessage();

type DictKey = 'manufacturer' | 'model' | 'type';

interface VideoRecord {
  id?: string;
  name?: string;
  type?: string;
  app?: string;
  stream?: string;
  ip?: string;
  deviceIp?: string;
  port?: string;
  webrtcUrl?: string;
  webRtcUrl?: string;
  webrtcApi?: string;
  children?: VideoRecord[];
  parentId?: string;
  __isChild?: boolean;
  manufacturer?: string;
  manufacturer_dictText?: string;
  manufacturerText?: string;
  model?: string;
  model_dictText?: string;
  modelText?: string;
  type_dictText?: string;
  typeText?: string;
  [key: string]: any;
}

const dictCodeMap: Record<DictKey, string> = {
  manufacturer: 'xudu_manufacturer',
  model: 'xudu_model_video',
  type: 'xudu_video_type',
};

const dictMaps = reactive<Record<DictKey, Record<string, string>>>(
  {
    manufacturer: {},
    model: {},
    type: {},
  }
);

const dictLoaded = ref(false);
let dictLoadingPromise: Promise<void> | null = null;

const loadDicts = async () => {
  if (dictLoaded.value) return;
  if (!dictLoadingPromise) {
    dictLoadingPromise = Promise.all(
      (Object.keys(dictCodeMap) as DictKey[]).map(async (key) => {
        try {
          const items = (await initDictOptions(dictCodeMap[key])) || [];
          const map: Record<string, string> = {};
          items.forEach((item: any) => {
            const valueKey = item?.value ?? item?.key;
            const textValue = item?.text ?? item?.label ?? '';
            if (valueKey !== undefined && valueKey !== null) {
              map[String(valueKey)] = String(textValue ?? '');
            }
          });
          dictMaps[key] = map;
        } catch (err) {
          console.error(`加载字典 ${dictCodeMap[key]} 失败`, err);
          dictMaps[key] = {};
        }
      })
    )
      .then(() => {
        dictLoaded.value = true;
      })
      .finally(() => {
        dictLoadingPromise = null;
      });
  }
  await dictLoadingPromise;
};

const getDictText = (key: DictKey, value: unknown, dictText?: string): string => {
  if (dictText) return String(dictText);
  if (value === undefined || value === null || value === '') return '';
  const map = dictMaps[key];
  const mapped = map[String(value)];
  return mapped !== undefined && mapped !== null && mapped !== '' ? mapped : String(value);
};

const normalizeVideoNode = (item: VideoRecord, parent?: VideoRecord): VideoRecord => {
  const typeValue = String(item?.type ?? '').trim().toLowerCase();

  const normalized: VideoRecord = {
    ...item,
    manufacturerText: getDictText('manufacturer', item.manufacturer, item.manufacturer_dictText),
    modelText: getDictText('model', item.model, item.model_dictText),
    typeText: getDictText('type', item.type, item.type_dictText),
  };

  if (parent?.id && !normalized.parentId) {
    normalized.parentId = parent.id;
  }

  if (parent) {
    normalized.__isChild = true;
  } else {
    delete normalized.__isChild;
  }

  const rawChildren = Array.isArray(item?.children) ? (item.children as VideoRecord[]) : [];
  if (rawChildren.length > 0) {
    normalized.children = rawChildren.map((child) => normalizeVideoNode(child, normalized));
  } else {
    delete normalized.children;
  }

  if (typeValue === 'nvr' || typeValue === 'ipc') {
    normalized.type = typeValue;
  }

  return normalized;
};

const handleAfterFetch = async (items: Record<string, any>[]) => {
  await loadDicts();
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => normalizeVideoNode(item as VideoRecord));
};

function getRowClassName(row: VideoRecord & { record?: VideoRecord }) {
  const current = (row?.record ?? row) as VideoRecord;
  const typeValue = String(current?.type ?? '').toLowerCase();
  const classes: string[] = [];

  if (typeValue === 'nvr') {
    classes.push('video-nvr-row');
  }
  if (typeValue === 'ipc') {
    classes.push('video-ipc-row');
  }
  if (current?.__isChild || (current?.parentId && typeValue !== 'nvr')) {
    classes.push('video-child-row');
  }

  return classes.join(' ');
}

onMounted(() => {
  loadDicts();
});

const [registerTable, { reload, getSelectRows }] = useTable({
  api: listVideos,
  columns,
  formConfig: {
    schemas: searchFormSchema,
  },
  rowKey: 'id',
  isTreeTable: true,
  childrenColumnName: 'children',
  rowClassName: getRowClassName,
  afterFetch: handleAfterFetch,
});
const [registerForm, { openModal }] = useModal();
const [registerPlayer, { openModal: openPlayerModal }] = useModal();
const [registerNvrPlayer, { openModal: openNvrModal }] = useModal();

const rowSelection = {
  type: 'checkbox' as const,
  checkStrictly: true,
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    console.log('Selected keys:', selectedRowKeys);
    console.log('Selected rows:', selectedRows);
  },
};

const hasSelected = computed(() => {
  const selectedRows = getSelectRows();
  return !!selectedRows && selectedRows.length > 0;
});

const handleAdd = () => {
  openModal(true, {
    isUpdate: false,
  });
};

const handleEdit = (record: any) => {
  openModal(true, {
    record,
    isUpdate: true,
  });
};

const handleView = (record: any) => {
  openModal(true, {
    record,
    isUpdate: false,
    showFooter: false,
  });
};

const handlePlay = (record: VideoRecord) => {
  const typeValue = String(record?.type ?? '').toLowerCase();
  if (typeValue === 'xudu_video_nvr') {
    openNvrModal(true, { record });
    return;
  }
  openPlayerModal(true, { record });
};

const handleDelete = (record: VideoRecord) => {
  Modal.confirm({
    title: 'Confirm Delete',
    content: 'Remove this video record?',
    onOk() {
      return deleteVideo(record.id)
        .then(() => {
          createMessage.success('Video deleted');
          reload();
        })
        .catch((error) => {
          createMessage.error(`Delete failed: ${error?.message || error}`);
          return Promise.reject(error);
        });
    },
  });
};

const handleBatchDelete = () => {
  const selectedRows = getSelectRows();
  if (!selectedRows || selectedRows.length === 0) {
    createMessage.warning('Select at least one video to delete.');
    return;
  }

  Modal.confirm({
    title: 'Confirm Bulk Delete',
    content: `Remove ${selectedRows.length} selected video record(s)?`,
    onOk() {
      const ids = selectedRows.map((row) => row.id);
      return deleteBatchVideos(ids)
        .then(() => {
          createMessage.success('Selected videos deleted');
          reload();
        })
        .catch((error) => {
          createMessage.error(`Bulk delete failed: ${error?.message || error}`);
          return Promise.reject(error);
        });
    },
  });
};

const handleExport = () => {
  exportVideos()
    .then(() => {
      createMessage.success('Export started');
    })
    .catch((error) => {
      createMessage.error(`Export failed: ${error?.message || error}`);
    });
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      importVideos(file)
        .then(() => {
          createMessage.success('Import succeeded');
          reload();
        })
        .catch((error) => {
          createMessage.error(`Import failed: ${error?.message || error}`);
        });
    }
  };
  input.click();
};

const handleSuccess = () => {
  reload();
};
</script>

<style scoped>
  :deep(.video-nvr-row td) {
    background-color: #f0f5ff;
    font-weight: 600;
  }

  :deep(.video-nvr-row td:first-child) {
    border-left: 3px solid #2f54eb;
  }

  :deep(.video-ipc-row td) {
    background-color: #fafafa;
  }

  :deep(.video-ipc-row td:first-child) {
    border-left: 3px solid #52c41a;
  }

  :deep(.video-child-row > td) {
    background-color: #f7f9ff;
  }

  :deep(.video-type-tag) {
    font-weight: 600;
    color: #fff;
  }

  :deep(.video-type-tag.video-type-nvr) {
    background-color: #2f54eb;
    border-color: #2f54eb;
  }

  :deep(.video-type-tag.video-type-ipc) {
    background-color: #389e0d;
    border-color: #389e0d;
  }

  :deep(.video-name-cell) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.video-name-text) {
    font-size: 14px;
    color: #303133;
  }

  :deep(.video-name-badge) {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: 12px;
    font-size: 12px;
    line-height: 20px;
    background-color: #f0f2f5;
    color: #606266;
  }

  :deep(.video-name-badge-nvr) {
    background-color: #e8f3ff;
    color: #1677ff;
    font-weight: 600;
  }

  :deep(.video-name-badge-ipc),
  :deep(.video-name-badge-child) {
    background-color: #f6ffed;
    color: #389e0d;
  }

  :deep(.video-name-badge-nvr ~ .video-name-text) {
    font-weight: 600;
  }

  :deep(.video-child-row .video-name-text) {
    font-weight: 500;
  }
</style>
