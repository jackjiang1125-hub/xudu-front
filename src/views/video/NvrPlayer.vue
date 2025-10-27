<template>
  <BasicModal
    @register="registerModal"
    :title="modalTitle"
    width="1400px"
    :showOkBtn="false"
    :destroyOnClose="true"
    :closable="true"
    wrapClassName="nvr-play-modal"
    @cancel="handleClose"
  >
    <section v-if="nvrRecord" class="nvr-summary">
      <a-descriptions :column="3" size="small" bordered>
        <a-descriptions-item label="Name">
          {{ nvrRecord.name || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="Type">
          <a-tag color="geekblue">NVR</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Manufacturer">
          {{ nvrRecord.manufacturerText || nvrRecord.manufacturer_dictText || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="IP">
          {{ nvrRecord.ip || nvrRecord.deviceIp || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="Port">
          {{ nvrRecord.port || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="App / Stream">
          <span class="mono">{{ formatAppStream(nvrRecord) }}</span>
        </a-descriptions-item>
      </a-descriptions>
    </section>

    <section class="toolbar">
      <div class="toolbar-left">
        <a-button type="primary" @click="handlePlayAll" :loading="batchLoading.play">
          {{ batchLoading.play ? 'Playing...' : 'Play All' }}
        </a-button>
        <a-button danger class="ml-8" @click="handleStopAll" :loading="batchLoading.stop">
          {{ batchLoading.stop ? 'Stopping...' : 'Stop All' }}
        </a-button>
      </div>
      <div class="toolbar-right">
        <a-typography-text type="secondary">
          {{ childItems.length }} channel(s)
        </a-typography-text>
      </div>
    </section>

    <a-spin :spinning="loadingChildren">
      <div v-if="!loadingChildren && !childItems.length" class="empty-tip">
        No child camera detected.
      </div>
      <div v-else class="grid-container">
        <div
          v-for="item in childItems"
          :key="item.key"
          class="grid-item"
          :class="{ playing: item.playing }"
        >
          <header class="grid-header">
            <span class="name" :title="item.name || item.deviceName">
              {{ item.name || item.deviceName || 'Unnamed camera' }}
            </span>
            <a-tag v-if="item.type" color="green">{{ item.type }}</a-tag>
          </header>

          <div class="player-wrapper">
            <WebrtcPlayer
              :ref="(el) => setPlayerRef(el, item.key)"
              :webrtcApi="item.activeApi"
              :muted="true"
            />
          </div>

          <footer class="grid-footer">
            <a-space>
              <a-button type="primary" size="small" @click="togglePlay(item)" :loading="item.loading">
                {{ item.playing ? 'Stop' : 'Play' }}
              </a-button>
              <a-button
                size="small"
                @click="refreshStream(item)"
                :loading="item.refreshing"
                :disabled="!item.playing"
              >
                Refresh
              </a-button>
            </a-space>
            <span class="status-text">
              <template v-if="item.loading">Loading</template>
              <template v-else-if="item.error">{{ item.error }}</template>
              <template v-else-if="item.playing">Playing</template>
              <template v-else>Idle</template>
            </span>
          </footer>
        </div>
      </div>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, reactive, onBeforeUnmount } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import WebrtcPlayer from './WebrtcPlayer.vue';
import { preparePlay } from './video.api';

interface VideoRecord {
  id?: string;
  name?: string;
  type?: string;
  children?: VideoRecord[];
  parentId?: string;
  manufacturer?: string;
  manufacturerText?: string;
  manufacturer_dictText?: string;
  typeText?: string;
  type_dictText?: string;
  ip?: string;
  deviceIp?: string;
  port?: string;
  app?: string;
  stream?: string;
  webRtcUrl?: string;
  webrtcUrl?: string;
  [key: string]: any;
}

interface ChildItem extends VideoRecord {
  key: string;
  loading: boolean;
  refreshing: boolean;
  playing: boolean;
  activeApi: string;
  error: string;
}

const { createMessage } = useMessage();

const modalTitle = ref('NVR Multi-channel Preview');
const loadingChildren = ref(false);
const nvrRecord = ref<VideoRecord | null>(null);
const childItems = ref<ChildItem[]>([]);

const batchLoading = reactive({ play: false, stop: false });
const playerMap = new Map<string, InstanceType<typeof WebrtcPlayer>>();

const [registerModal, { closeModal }] = useModalInner(async (data?: { record?: VideoRecord }) => {
  resetState();
  const incoming = data?.record;
  nvrRecord.value = incoming || null;
  modalTitle.value = incoming?.name ? `NVR Preview ${incoming.name}` : 'NVR Multi-channel Preview';
  await buildChildren(incoming);
});

function resetState() {
  stopAllPlayers();
  childItems.value = [];
  loadingChildren.value = false;
  batchLoading.play = false;
  batchLoading.stop = false;
  playerMap.clear();
}

async function buildChildren(record?: VideoRecord | null) {
  if (!record) return;
  loadingChildren.value = true;
  try {
    const rawChildren = Array.isArray(record.children) ? record.children : [];
    childItems.value = rawChildren.map((child, index) => ({
      ...child,
      key: child.id || `${record.id || 'nvr'}_${index}`,
      loading: false,
      refreshing: false,
      playing: false,
      activeApi: '',
      error: '',
    }));
  } finally {
    loadingChildren.value = false;
  }
}

function setPlayerRef(el: InstanceType<typeof WebrtcPlayer> | null, key: string) {
  if (!key) return;
  if (el) {
    playerMap.set(key, el);
  } else {
    playerMap.delete(key);
  }
}

function stopChild(item: ChildItem) {
  item.activeApi = '';
  item.playing = false;
  item.error = '';
  const player = playerMap.get(item.key);
  player?.stop?.();
}

async function playChild(item: ChildItem, silent = false) {
  if (!item.id) {
    if (!silent) createMessage.warning('Missing camera id.');
    return;
  }

  item.loading = true;
  item.error = '';

  try {
    const result = await preparePlay(item.id, 'WEBRTC', false);
    const url = resolveWebrtcUrl(result);

    if (!url) {
      item.error = 'No WebRTC url returned.';
      if (!silent) createMessage.warning((item.name || 'Camera') + ' url unavailable.');
      return;
    }

    if (window?.location?.protocol === 'https:' && !url.startsWith('https://')) {
      console.warn('Suggested to serve HTTPS WebRTC URL when page is HTTPS.');
    }

    item.activeApi = url;
    item.playing = true;
  } catch (error: any) {
    console.error(error);
    item.error = error?.message || 'Play failed.';
    if (!silent) createMessage.error((item.name || 'Camera') + ' failed to start.');
  } finally {
    item.loading = false;
  }
}

function resolveWebrtcUrl(payload: any): string {
  const source = payload?.urls || payload?.result?.urls || payload?.result || payload;
  if (!source) return '';
  return (
    source.webrtc ||
    source.webrtcUrl ||
    source.whep ||
    source.playUrl ||
    source.webrtcApi ||
    source.webrtc_url ||
    ''
  );
}

async function togglePlay(item: ChildItem) {
  if (item.playing) {
    stopChild(item);
  } else {
    await playChild(item);
  }
}

async function refreshStream(item: ChildItem) {
  if (!item.playing) return;
  item.refreshing = true;
  try {
    stopChild(item);
    await playChild(item, true);
  } finally {
    item.refreshing = false;
  }
}

async function handlePlayAll() {
  if (!childItems.value.length) return;
  batchLoading.play = true;
  try {
    for (const item of childItems.value) {
      await playChild(item, true);
    }
    createMessage.success('Play requests dispatched.');
  } finally {
    batchLoading.play = false;
  }
}

async function handleStopAll() {
  if (!childItems.value.length) return;
  batchLoading.stop = true;
  try {
    stopAllPlayers();
    createMessage.success('All channels stopped.');
  } finally {
    batchLoading.stop = false;
  }
}

function stopAllPlayers() {
  childItems.value.forEach((item) => stopChild(item));
}

function handleClose() {
  stopAllPlayers();
  closeModal();
}

function formatAppStream(record: VideoRecord) {
  const app = record.app || '-';
  const stream = record.stream || '-';
  return `${app} / ${stream}`;
}

onBeforeUnmount(() => {
  stopAllPlayers();
  playerMap.clear();
});
</script>

<style scoped>
.nvr-summary {
  margin-bottom: 16px;
}

.nvr-summary :deep(.ant-descriptions-item-label) {
  min-width: 120px;
}

.mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  font-size: 12px;
}

.ml-8 {
  margin-left: 8px;
}

.grid-container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.grid-item.playing {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.grid-header .name {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-wrapper {
  height: 320px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}

.grid-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.status-text {
  font-size: 12px;
  color: #8c8c8c;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320px;
  color: #8c8c8c;
  font-size: 14px;
}
</style>



