<template>
  <div class="webrtc-wrap">
    <video ref="videoRef" class="webrtc-video" :muted="muted" playsinline controls></video>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps<{
  webrtcApi: string;     // ZLM webrtc 播放接口
  muted?: boolean;       // 为了自动播放建议 true
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
let pc: RTCPeerConnection | null = null;
let sessionToken = 0;

const muted = props.muted ?? true;

function clearVideo() {
  const v = videoRef.value;
  if (!v) return;
  try {
    v.pause();
    // @ts-ignore
    v.srcObject = null;
    v.removeAttribute('src');
    v.load();
  } catch {}
}

function stop() {
  sessionToken += 1;
  try { pc?.close(); } catch {}
  pc = null;
  clearVideo();
}

async function start() {
  if (!props.webrtcApi) throw new Error('webrtcApi 不能为空');
  stop();

  await nextTick();
  const v = videoRef.value!;
  const token = ++sessionToken;
  const peer = new RTCPeerConnection({
    iceServers: [],
  });
  pc = peer;

  peer.addTransceiver('video', { direction: 'recvonly' });
  peer.ontrack = (e) => {
    // @ts-ignore
    v.srcObject = e.streams[0];
  };

  const offer = await peer.createOffer({ offerToReceiveVideo: true });
  if (token !== sessionToken) {
    try { peer.close(); } catch {}
    return;
  }
  await peer.setLocalDescription(offer);

  const res = await fetch(props.webrtcApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: offer.sdp || '',
  });
  if (!res.ok) {
    throw new Error(`webrtc api error: ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  let remoteType: RTCSdpType = 'answer';
  let remoteSdp = '';

  if (contentType.includes('application/json')) {
    const data = await res.json();
    remoteSdp = data?.sdp || data?.data?.sdp || '';
    remoteType = (data?.type || data?.data?.type || 'answer') as RTCSdpType;
    if (!remoteSdp) {
      throw new Error(data?.msg || 'webrtc api 返回数据异常');
    }
  } else {
    remoteSdp = await res.text();
    if (remoteSdp && remoteSdp.trim().startsWith('{')) {
      try {
        const data = JSON.parse(remoteSdp);
        remoteSdp = data?.sdp || data?.data?.sdp || '';
        remoteType = (data?.type || data?.data?.type || 'answer') as RTCSdpType;
      } catch (error) {
        console.warn('Failed to parse webrtc api response', error);
      }
    }
  }

  if (!remoteSdp) {
    throw new Error('未获取到远端 SDP');
  }

  if (!remoteSdp.trim().startsWith('v=')) {
    try {
      remoteSdp = atob(remoteSdp);
    } catch (error) {
      console.warn('尝试 base64 解码 SDP 失败', error);
    }
  }

  if (token !== sessionToken) {
    try { peer.close(); } catch {}
    return;
  }
  await peer.setRemoteDescription({
    type: remoteType,
    sdp: remoteSdp,
  });

  // Some browsers still require a manual play trigger
  await v.play().catch(() => {});
}

watch(
  () => props.webrtcApi,
  async (url) => {
    if (url) {
      try { await start(); } catch (e) { console.error(e); }
    } else {
      stop();
    }
  },
  { immediate: true }
);

onBeforeUnmount(stop);

defineExpose({ start, stop });
</script>

<style scoped>
.webrtc-wrap { background: #000; }
.webrtc-video { width: 100%; height: 100%; display: block; background: #000; }
</style>
