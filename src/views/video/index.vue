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

const { createMessage } = useMessage();

type DictKey = 'manufacturer' | 'model' | 'type';

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


const handleAfterFetch = async (items: Record<string, any>[]) => {
  await loadDicts();
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((item) => ({
    ...item,
    manufacturerText: getDictText('manufacturer', item.manufacturer, item.manufacturer_dictText),
    modelText: getDictText('model', item.model, item.model_dictText),
    typeText: getDictText('type', item.type, item.type_dictText),
  }));
};

onMounted(() => {
  loadDicts();
});

const [registerTable, { reload, getSelectRows }] = useTable({
  afterFetch: handleAfterFetch,
});
const [registerForm, { openModal }] = useModal();
const [registerPlayer, { openModal: openPlayerModal }] = useModal();

const rowSelection = {
  type: 'checkbox' as const,
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    console.log('selectedRowKeys changed:', selectedRowKeys);
    console.log('selectedRows:', selectedRows);
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

const handlePlay = (record: any) => {
  console.log('点击播放按钮，记录信息', record);
  openPlayerModal(true, { record });
};

const handleDelete = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该视频流吗？',
    onOk() {
      deleteVideo(record.id)
        .then(() => {
          reload();
        })
        .catch((error) => {
          createMessage.error('删除失败：' + error.message);
        });
    },
  });
};

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
      const ids = selectedRows.map((row) => row.id);
      deleteBatchVideos(ids)
        .then(() => {
          createMessage.success('批量删除成功');
          reload();
        })
        .catch((error) => {
          createMessage.error('批量删除失败：' + error.message);
        });
    },
  });
};

const handleExport = () => {
  exportVideos()
    .then(() => {
      createMessage.success('导出成功');
    })
    .catch((error) => {
      createMessage.error('导出失败：' + error.message);
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
          createMessage.success('导入成功');
          reload();
        })
        .catch((error) => {
          createMessage.error('导入失败：' + error.message);
        });
    }
  };
  input.click();
};

const handleSuccess = () => {
  reload();
};
</script>
