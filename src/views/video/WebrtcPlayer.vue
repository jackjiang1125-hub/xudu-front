<template>
  <div class="webrtc-wrap">
    <video ref="videoRef" class="webrtc-video" :muted="muted" playsinline controls></video>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps<{
  webrtcApi: string;
  muted?: boolean;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
let pc: RTCPeerConnection | null = null;
let sessionToken = 0;
let isStarting = false;
let resourceUrl: string | null = null;

const muted = props.muted ?? true;

function clearVideo() {
  const v = videoRef.value;
  if (!v) return;
  try {
    const stream = v.srcObject as MediaStream | null;
     v.pause();
    if (stream) {
      try { stream.getTracks().forEach((t) => t.stop()); } catch {}
    }
     // @ts-ignore
     v.srcObject = null;
     v.removeAttribute('src');
     v.load();
  } catch {}
}


async function stop() {
  sessionToken += 1;
  await sendStopSignal();
  try {
    const v = videoRef.value;
    const stream = (v?.srcObject as MediaStream) || null;
    if (pc) {
      try { pc.getTransceivers().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
      try { pc.getSenders().forEach((s) => { try { s.track?.stop(); } catch {} }); } catch {}
      try { pc.getReceivers().forEach((r) => { try { r.track?.stop(); } catch {} }); } catch {}
      try { pc.ontrack = null; pc.onicecandidate = null; pc.onconnectionstatechange = null; } catch {}
      try { pc.close(); } catch {}
    }
    if (stream) {
      try { stream.getTracks().forEach((t) => t.stop()); } catch {}
    }
    } catch (e) {
    console.warn('stop webrtc error', e);
    } finally {
    pc = null;
    clearVideo();
    }
}

async function sendStopSignal() {
  try {
    const url = resourceUrl || props.webrtcApi;
    if (!url) return;
    await fetch(url, { method: 'DELETE' }).catch(() => {});
  } catch (error) {
    console.warn('failed to send stop signal', error);
  } finally {
    resourceUrl = null;
  }
}

async function start() {
  if (isStarting) return;
  if (!props.webrtcApi) throw new Error('webrtcApi is required');
  isStarting = true;

  try {
    await stop();

    await nextTick();
    const v = videoRef.value;
    if (!v) throw new Error('video element not found');

    const token = ++sessionToken;
    const peer = new RTCPeerConnection({
      iceServers: [],
    });
    pc = peer;

    peer.addTransceiver('video', { direction: 'recvonly' });
    peer.addTransceiver('audio', { direction: 'recvonly' });
    peer.ontrack = (e) => {
      // @ts-ignore
      const stream = e.streams[0];
      v.srcObject = stream;
      stream?.getAudioTracks()?.forEach((t) => (t.enabled = true));
      v.muted = muted;
    };

    const offer = await peer.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
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
    // Try to capture resource URL for later teardown (WHEP)
    resourceUrl = res.headers.get('Location') || res.headers.get('location') || resourceUrl;
 
     const contentType = res.headers.get('content-type') || '';
     let remoteType: RTCSdpType = 'answer';
     let remoteSdp = '';
 
     if (contentType.includes('application/json')) {
       const data = await res.json();
       remoteSdp = data?.sdp || data?.data?.sdp || '';
       remoteType = (data?.type || data?.data?.type || 'answer') as RTCSdpType;
      resourceUrl = data?.location || data?.data?.location || resourceUrl;
       if (!remoteSdp) {
         throw new Error(data?.msg || 'webrtc api returned invalid data');
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
      throw new Error('remote SDP not found');
    }

    if (!remoteSdp.trim().startsWith('v=')) {
      try {
        remoteSdp = atob(remoteSdp);
      } catch (error) {
        console.warn('failed to decode base64 SDP', error);
      }
    }

    if (token !== sessionToken) {
      try { peer.close(); } catch {}
      return;
    }
    const hasAudioLine = /(^|\n)m=audio/gi.test(remoteSdp);
    if (!hasAudioLine) {
      console.warn('远端SDP未包含音频轨道(m=audio)，浏览器将禁用音量控件。');
    }
    await peer.setRemoteDescription({
      type: remoteType,
      sdp: remoteSdp,
    });

    await v.play().catch(() => {});
  } finally {
    isStarting = false;
  }
}

const handleVideoPlay = async () => {
  if (pc || isStarting) return;
  if (!props.webrtcApi) return;
  try {
    await start();
  } catch (error) {
    console.error(error);
  }
};

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

watch(
  () => videoRef.value,
  (el, prev) => {
    prev?.removeEventListener('play', handleVideoPlay);
    el?.addEventListener('play', handleVideoPlay);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  videoRef.value?.removeEventListener('play', handleVideoPlay);
  stop();
});

defineExpose({ start, stop });
</script>

<style scoped>
.webrtc-wrap { background: #000; }
.webrtc-video { width: 100%; height: 100%; display: block; background: #000; }
</style>




