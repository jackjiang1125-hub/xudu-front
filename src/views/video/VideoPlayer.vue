<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="800"
    :height="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
  <div class="video-player-container">
      <div v-if="loading" class="loading-container">
        <a-spin size="large" />
        <p>正在准备视频流...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <a-result
          status="error"
          :title="error"
          sub-title="视频流加载失败，请检查设备连接状态"
        >
          <template #extra>
            <a-button type="primary" @click="retryPlay">重试</a-button>
          </template>
        </a-result>
      </div>

      <div v-else class="video-container">
        <WebrtcPlayer
          v-if="webrtcApi"
          ref="webrtcRef"
          :webrtcApi="webrtcApi"
          :muted="false"
        />
      </div>
    </div>
    <div v-if="cameraDetails.length" class="camera-details">
      <a-descriptions :column="2" size="small" :bordered="true">
        <a-descriptions-item
          v-for="item in cameraDetails"
          :key="item.label"
          :label="item.label"
        >
          <template v-if="item.copyValue">
            <span class="ellipsis-text" :title="item.copyValue">{{ item.value }}</span>
            <a-button type="link" size="small" @click="handleCopy(item.copyValue)">复制</a-button>
          </template>
          <template v-else>
            {{ item.value }}
          </template>
        </a-descriptions-item>
      </a-descriptions>
    </div>
    
  </BasicModal>
</template>

<script lang="ts" setup>

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { preparePlay } from './video.api';
import { initDictOptions } from '/@/utils/dict/index';
import WebrtcPlayer from './WebrtcPlayer.vue';

interface Props {
  record?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  record: () => ({}),
});
const emit = defineEmits(['success', 'register']);
const { createMessage } = useMessage();

const loading = ref(false);
const error = ref('');
const webrtcApi = ref<string>('');
const webrtcRef = ref<InstanceType<typeof WebrtcPlayer> | null>(null);
const currentRecord = ref<Record<string, any> | null>(null);
type DetailItem = { label: string; value: string; copyValue?: string };

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

const mapDictText = (key: DictKey, value: unknown, dictText?: string): string => {
  if (dictText) return String(dictText);
  if (value === undefined || value === null || value === '') return '';
  const map = dictMaps[key];
  const mapped = map[String(value)];
  return mapped !== undefined && mapped !== null && mapped !== '' ? mapped : String(value);
};

onMounted(() => {
  loadDicts();
});

const modalTitle = computed(() => {
  const record = currentRecord.value || props.record;
  return record?.name ? `播放视频 - ${record.name}` : '播放视频';
});

const formatUrl = (value: string) => {
  if (!value) return '';
  const max = 48;
  if (value.length <= max) return value;
  return `${value.slice(0, 24)}...${value.slice(-12)}`;
};

const cameraDetails = computed<DetailItem[]>(() => {
  const record = currentRecord.value || props.record;
  if (!record || typeof record !== 'object' || Object.keys(record).length === 0) {
    return [];
  }

  const normalize = (value: unknown) => {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const details: DetailItem[] = [
    { label: '视频流名称', value: normalize(record.name) },
    {
      label: '设备IP',
      value: normalize(record.ip || record.deviceIp),
    },
    { label: '端口', value: normalize(record.port) },
    {
      label: '制造商',
      value: normalize(
        mapDictText('manufacturer', record.manufacturer, record.manufacturer_dictText || record.manufacturerText)
      ),
    },
    {
      label: '所属模块',
      value: normalize(mapDictText('model', record.model, record.model_dictText || record.modelText)),
    },
    {
      label: '监控类型',
      value: normalize(mapDictText('type', record.type, record.type_dictText || record.typeText)),
    },
    { label: '应用名', value: normalize(record.app) },
    { label: '流名称', value: normalize(record.stream) },
    { label: '视频编码', value: normalize(record.videoCodec) },
    { label: '音频编码', value: normalize(record.audioCodec) },
    { label: '创建时间', value: normalize(record.createTime) },
  ];

  const webrtcFull = normalize(record.webRtcUrl || record.webrtcUrl);
  if (webrtcFull) {
    details.push({
      label: 'WebRTC地址',
      value: formatUrl(webrtcFull),
      copyValue: webrtcFull,
    });
  }

  const hlsFull = normalize(record.hlsUrl);
  if (hlsFull) {
    details.push({
      label: 'HLS地址',
      value: formatUrl(hlsFull),
      copyValue: hlsFull,
    });
  }

  return details.filter((item) => item.value);
});

const [registerModal, { closeModal }] = useModalInner(async (data) => {
  if (data?.record) {
    await loadDicts();
    currentRecord.value = data.record;
    await startPlay(data.record);
  }
});

const startPlay = async (record: Record<string, any>) => {
  await loadDicts();
  currentRecord.value = record || null;

  if (!record?.id) {
    error.value = '视频流信息不完整';
    return;
  }
  loading.value = true;
  error.value = '';
  webrtcApi.value = '';

  try {
    const result = await preparePlay(record.id, 'WEBRTC', false);

    const url =
      result?.urls?.webrtc ||
      result?.urls?.webrtcUrl ||
      result?.urls?.whep ||
      '';

    if (!url) throw new Error('后端未返回 WebRTC 播放地址');

    if (location.protocol === 'https:' && !url.startsWith('https://')) {
      console.warn('当前为 HTTPS 页面，建议后端返回 HTTPS 的 webrtc 端点以避免被拦截。');
    }

    webrtcApi.value = url;
    createMessage.success('视频流准备完成');
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || '播放准备失败';
    createMessage.error('播放准备失败: ' + error.value);
    webrtcRef.value?.stop?.();
  } finally {
    loading.value = false;
  }
};

const handleCopy = async (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    createMessage.success('复制成功');
  } catch (error) {
    console.error(error);
    createMessage.error('复制失败');
  }
};

const retryPlay = async () => {
  const record = currentRecord.value || props.record;
  if (record && typeof record === 'object' && Object.keys(record).length > 0) {
    await startPlay(record);
  }
};

const handleOk = () => {
  handleCancel();
};

const handleCancel = async () => {
  try { await webrtcRef.value?.stop?.(); } catch (e) { console.error(e); }
  webrtcApi.value = '';
  currentRecord.value = null;
  closeModal();
};

defineExpose({ startPlay });
</script>

<style lang="less" scoped>
.camera-details {
  margin-bottom: 16px;

  :deep(.ant-descriptions-item-content) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.ellipsis-text {
  max-width: 320px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-player-container {
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  border-radius: 4px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.error-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(video) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
}
</style>
