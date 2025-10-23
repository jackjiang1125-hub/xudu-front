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
        <!-- 用你之前稳定可用的 WebrtcPlayer -->
        <WebrtcPlayer
          v-if="webrtcApi"
          ref="webrtcRef"
          :webrtcApi="webrtcApi"
          :muted="true"
        />
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { preparePlay } from './video.api';

// ✅ 引入你之前的可用组件
import WebrtcPlayer from './WebrtcPlayer.vue';

interface Props {
  record?: any;
}

const props = withDefaults(defineProps<Props>(), {
  record: () => ({}),
});
const emit = defineEmits(['success', 'register']);
const { createMessage } = useMessage();

// 状态
const loading = ref(false);
const error = ref('');
const webrtcApi = ref<string>('');   // 传给子组件使用的 webrtc 播放接口
const webrtcRef = ref<InstanceType<typeof WebrtcPlayer> | null>(null);

const modalTitle = computed(() => {
  return props.record?.name ? `播放视频 - ${props.record.name}` : '播放视频';
});

const [registerModal, { closeModal }] = useModalInner(async (data) => {
  if (data?.record) await startPlay(data.record);
});

// 开始播放：调用后端准备 → 拿 webrtc 接口 URL → 交给子组件
const startPlay = async (record: any) => {
  if (!record?.id) {
    error.value = '视频流信息不完整';
    return;
  }
  loading.value = true;
  error.value = '';
  webrtcApi.value = '';

  try {
    // 让后端准备好（按 WEBRTC 目标）
    const result = await preparePlay(record.id, 'WEBRTC', false);

    // ✅ 兼容返回字段：优先 urls.webrtc，其次 urls.webrtcUrl / urls.whep
    const url =
      result?.urls?.webrtc ||
      result?.urls?.webrtcUrl ||
      result?.urls?.whep ||
      '';

    if (!url) throw new Error('后端未返回 WebRTC 播放地址');

    // 如果你的页面是 HTTPS，尽量返回 HTTPS 的播放端点，避免混合内容被拦截
    if (location.protocol === 'https:' && !url.startsWith('https://')) {
      console.warn('当前为 HTTPS 页面，建议后端返回 HTTPS 的 webrtc 端点以避免被拦截。');
    }

    webrtcApi.value = url;

    // 大多数情况下，WebrtcPlayer 内部 watch(webrtcApi) 会自动 start()
    // 如果你的实现需要手动触发，也可以：await webrtcRef.value?.start?.();
    createMessage.success('视频流准备完成');
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || '播放准备失败';
    createMessage.error('播放准备失败: ' + error.value);
    // 出错时确保停掉可能的连接
    webrtcRef.value?.stop?.();
  } finally {
    loading.value = false;
  }
};

const retryPlay = async () => {
  if (props.record) await startPlay(props.record);
};

const handleOk = () => {
  handleCancel();
};

const handleCancel = () => {
  // 关闭前停止播放 & 释放 PeerConnection
  webrtcRef.value?.stop?.();
  webrtcApi.value = '';
  closeModal();
};

// 暴露给父组件（可选）
defineExpose({ startPlay });
</script>

<style lang="less" scoped>
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
