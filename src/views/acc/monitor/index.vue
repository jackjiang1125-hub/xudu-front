<template>
  <PageWrapper dense contentFull overflowHidden title="">
    <div class="monitor-vertical">
      <section class="device-wall">
        <header class="section-header">
          <div class="title">
            <Icon icon="mdi:door" class="title-icon" />
            <span>设备总览</span>
          </div>
          <a-space>
            <a-select v-model:value="statusFilter" allowClear placeholder="筛选状态" style="width: 150px">
              <a-select-option value="online">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
              <a-select-option value="disabled">禁用</a-select-option>
            </a-select>
            <a-input-search v-model:value="keyword" placeholder="搜索名称或SN" style="width: 200px" />
          </a-space>
        </header>

        <div class="device-grid">
          <a-empty v-if="!filteredDevices.length" description="无设备满足筛选" />
          <template v-else>
            <a-popover
              v-for="device in filteredDevices"
              :key="device.id"
              placement="rightTop"
              trigger="hover"
            >
              <template #title>
                <div class="popover-title">
                  <span>{{ device.name }}</span>
                  <a-tag :color="deviceStatusMeta[device.status].color">{{ deviceStatusMeta[device.status].label }}</a-tag>
                </div>
              </template>
              <template #content>
                <div class="popover-content">
                  <p>{{ device.location }}</p>
                  <p>SN: {{ device.sn }}</p>
                  <p>Last heartbeat: {{ device.lastHeartbeat }}</p>
                  <a-divider>快速操作</a-divider>
                  <a-space wrap>
                    <a-button
                      v-for="action in getActionsByStatus(device.status)"
                      :key="action.key"
                      size="small"
                      type="primary"
                      ghost
                      @click="handleDeviceAction(action.key, device)"
                    >
                      {{ action.label }}
                    </a-button>
                  </a-space>
                </div>
              </template>
              <div class="device-card" :class="`device-${device.status}`">
                <div class="device-cover">
                  <Icon :icon="getCoverIcon(device.status)" class="device-icon" />
                  <span class="device-status-label">{{ deviceStatusMeta[device.status].label }}</span>
                </div>
                <div class="device-info">
                  <div class="device-name" :title="device.name">{{ device.name }}</div>
                  <div class="device-location" :title="device.location">{{ device.location }}</div>
                  <div class="device-sn">SN: {{ device.sn }}</div>
                </div>
              </div>
            </a-popover>
          </template>
        </div>
      </section>

      <section class="event-panel">
        <header class="section-header">
          <div class="title">
            <Icon icon="mdi:flash" class="title-icon flash" />
            <span>实时事件流</span>
          </div>
          <a-space>
            <a-tag color="blue">刷新: {{ refreshSeconds }}s</a-tag>
            <a-switch v-model:checked="autoScroll" checked-children="跟随" un-checked-children="暂停" />
          </a-space>
        </header>
        <BasicTable @register="handleRegisterEventTable" />
      </section>
    </div>

    <Teleport to="body">
      <transition name="fade-slide">
        <div v-if="faceNotification" class="face-toast">
          <div class="face-photo-wrapper">
            <img :src="faceNotification.avatar" alt="avatar" class="face-photo" @error="handleFaceImageError" />
          </div>
          <div class="face-info">
            <div class="face-row"><span class="face-label">姓名:</span>{{ faceNotification.name }}</div>
            <div class="face-row"><span class="face-label">部门:</span>{{ faceNotification.department }}</div>
            <div class="face-row"><span class="face-label">设备:</span>{{ faceNotification.deviceName }}</div>
            <div class="face-row"><span class="face-label">时间:</span>{{ faceNotification.time }}</div>
          </div>
        </div>
      </transition>
    </Teleport>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    deviceStatusMeta,
    type DoorDevice,
    actionDefinitions,
    eventColumns,
    type EventRecord,
  } from './deviceMonitor.data';
  import { onWebSocket, offWebSocket } from '/@/hooks/web/useWebSocket';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { listDoor, remoteOpenDoor, remoteCloseDoor, remoteCancelAlarm, remoteHoldOpen, remoteLockDoor, remoteUnlockDoor, enableTodayAlwaysOpen, disableTodayAlwaysOpen } from '../accdoor/accdoor.api';
  import { listDevices } from '/@/views/acc/devce.api';

  const { createMessage } = useMessage();

  const deviceList = ref<DoorDevice[]>([]);
  const snNameMap = ref<Record<string, string>>({});
  const keyword = ref('');
  const statusFilter = ref<string | undefined>();

  const eventData = ref<EventRecord[]>([]);
  const autoScroll = ref(true);
  const refreshSeconds = ref(5);
  let intervalHandle: ReturnType<typeof setInterval> | null = null;
  let faceTimer: ReturnType<typeof setTimeout> | null = null;

  interface FaceToast {
    avatar: string;
    name: string;
    department: string;
    time: string;
    deviceName: string;
  }

  const faceNotification = ref<FaceToast | null>(null);
  // 默认占位图（超过重试次数后使用）
  import headerImg from '/@/assets/images/header.jpg';

  // 图片加载失败日志与重试状态
  const failedImageLogs = ref<{ time: string; url: string; attempt: number; status?: number; error?: any }[]>([]);
  const imageRetryState = {
    interval: null as ReturnType<typeof setInterval> | null,
    attempts: 0,
    controller: null as AbortController | null,
    url: '' as string,
    inFlight: false,
  };

  const filteredDevices = computed(() => {
    const kw = keyword.value.trim().toLowerCase();
    return deviceList.value.filter((item) => {
      const matchStatus = statusFilter.value ? item.status === statusFilter.value : true;
      const matchKeyword = !kw || item.name.toLowerCase().includes(kw) || item.sn.toLowerCase().includes(kw);
      return matchStatus && matchKeyword;
    });
  });

  const tableReady = ref(false);

  const [registerEventTable, { setTableData, getPaginationRef }] = useTable({
    title: '事件列表',
    columns: eventColumns,
    dataSource: eventData.value,
    rowKey: 'id',
    pagination: {
      pageSize: 8,
      showSizeChanger: false,
    },
    showIndexColumn: true,
  });

  function handleRegisterEventTable(instance: any, ext: any) {
    registerEventTable(instance, ext);
    tableReady.value = true;
    refreshEventTable();
  }

  function refreshEventTable() {
    if (!tableReady.value) return;
    setTableData(eventData.value.slice());
    const paginationRef = getPaginationRef() as unknown as { value?: any };
    if (
      autoScroll.value &&
      paginationRef &&
      paginationRef.value &&
      typeof paginationRef.value !== 'boolean'
    ) {
      paginationRef.value.current = 1;
    }
  }

  function getActionsByStatus(status: string) {
    return actionDefinitions.filter((action) => action.statusAllow.includes(status as any));
  }

  function getCoverIcon(status: string) {
    switch (status) {
      case 'online':
        return 'mdi:shield-check';
      case 'offline':
        return 'mdi:wifi-off';
      case 'disabled':
        return 'mdi:lock-alert';
      default:
        return 'mdi:door';
    }
  }

  async function handleDeviceAction(action: string, device: DoorDevice) {
    try {
      const ids = [String(device.id)];
      switch (action) {
        case 'open':
          await remoteOpenDoor(ids);
          createMessage.success(`${device.name}: 已下发远程开门命令`);
          break;
        case 'close':
          await remoteCloseDoor(ids);
          createMessage.success(`${device.name}: 已下发远程关门命令`);
          break;
        case 'cancelAlarm':
          await remoteCancelAlarm(ids);
          createMessage.success(`${device.name}: 已下发取消报警命令`);
          break;
        case 'holdOpen':
          await remoteHoldOpen(ids);
          createMessage.success(`${device.name}: 已下发远程常开命令`);
          break;
        case 'lock':
          await remoteLockDoor(ids);
          createMessage.success(`${device.name}: 已下发远程锁定命令`);
          break;
        case 'unlock':
          await remoteUnlockDoor(ids);
          createMessage.success(`${device.name}: 已下发远程解锁命令`);
          break;
        case 'enableTodayAlwaysOpen':
          await enableTodayAlwaysOpen(ids);
          createMessage.success(`${device.name}: 已下发启动当天常开时间段命令`);
          break;
        case 'disableTodayAlwaysOpen':
          await disableTodayAlwaysOpen(ids);
          createMessage.success(`${device.name}: 已下发禁用当天常开时间段命令`);
          break;
        case 'fetch':
          createMessage.success(`${device.name}: 正在拉取近期日志...`);
          break;
        default:
          createMessage.success(`${device.name}: 操作已触发`);
      }
    } catch (e) {
      createMessage.error('操作失败，请稍后重试');
    }
  }

  function showFaceToast(record: EventRecord) {
    if (!record.extra) return;
    // 显示弹窗并挂载图片 URL
    faceNotification.value = {
      avatar: record.extra.avatar ?? headerImg,
      name: record.extra.name ?? record.person,
      department: record.extra.department ?? 'Unknown Department',
      time: record.time,
      deviceName: record.deviceName,
    };
    if (faceTimer) clearTimeout(faceTimer);
    faceTimer = setTimeout(() => {
      faceNotification.value = null;
      // 弹窗关闭时清理重试与未完成请求
      stopImageRetry();
    }, 5000);
  }

  function stopImageRetry() {
    if (imageRetryState.interval) {
      clearInterval(imageRetryState.interval);
      imageRetryState.interval = null;
    }
    if (imageRetryState.controller) {
      try { imageRetryState.controller.abort(); } catch (e) {}
      imageRetryState.controller = null;
    }
    imageRetryState.attempts = 0;
    imageRetryState.inFlight = false;
    imageRetryState.url = '';
  }

  async function check404(url: string): Promise<number | undefined> {
    try {
      const controller = new AbortController();
      imageRetryState.controller = controller;
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
      return res.status;
    } catch (e) {
      // 网络或跨域错误，无法获取状态码，返回 undefined
      return undefined;
    }
  }

  function startImageRetry(originalUrl: string) {
    stopImageRetry();
    imageRetryState.url = originalUrl;
    imageRetryState.attempts = 0;
    imageRetryState.interval = setInterval(async () => {
      if (!faceNotification.value || imageRetryState.inFlight) return;
      imageRetryState.inFlight = true;
      const attempt = imageRetryState.attempts + 1;
      const bustUrl = `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}_r=${Date.now()}`;
      let status: number | undefined;
      try {
        status = await check404(bustUrl);
      } catch (e) {
        status = undefined;
      }
      if (status === 200) {
        // 成功，更新图片并停止重试
        faceNotification.value = faceNotification.value && { ...faceNotification.value, avatar: bustUrl };
        stopImageRetry();
      } else {
        // 失败记录日志
        failedImageLogs.value.push({ time: new Date().toISOString(), url: bustUrl, attempt, status });
        if (attempt >= 10) {
          // 超过10次失败，切换为占位图并停止
          faceNotification.value = faceNotification.value && { ...faceNotification.value, avatar: headerImg };
          stopImageRetry();
        } else {
          imageRetryState.attempts = attempt;
        }
      }
      imageRetryState.inFlight = false;
    }, 200);
  }

  async function handleFaceImageError() {
    // 仅在 404 时启动重试机制；无法获取状态时也记录失败
    const url = faceNotification.value?.avatar;
    if (!url) return;
    const status = await check404(url);
    failedImageLogs.value.push({ time: new Date().toISOString(), url, attempt: 0, status });
    if (status === 404) {
      startImageRetry(url);
    }
  }

  // 弹窗关闭/消失时，清理重试与未完成请求
  watch(() => faceNotification.value, (val) => {
    if (!val) {
      stopImageRetry();
    }
  });

  function mapVerifyType(verifyType?: number): string {
    // 保留空壳以兼容旧调用，但不再使用，改用字典渲染
    return verifyType != null ? String(verifyType) : '未知';
  }

  function handleWebSocketMessage(data: any) {
    try {
      if (!data || data.cmd !== 'acc_rtlog') return;
      const sn = data.sn || '';
      const time = data.logTime || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const pin = data.pin || '';
      const deviceName = snNameMap.value[sn] || sn; // 映射设备名称
      const verifyType = Number(data.verifyType);
      const resultLabel = data.inoutStatus === 1 ? '进' : data.inoutStatus === 0 ? '出' : `事件代码(${data.eventCode ?? ''})`;

      let avatarUrl: string | undefined;
      const media = data.mediaFile;
      if (media) {
        const m = String(media);
        avatarUrl = /^(https?:|data:)/.test(m) ? m : getFileAccessHttpUrl(m);
      }
      const extra = avatarUrl
        ? {
            avatar: avatarUrl,
            name: pin ? `${pin}` : '未知人员',
            department: '门禁',
          }
        : undefined;

      const event: EventRecord = {
        id: data.msgId || `evt-${Date.now()}`,
        verifyType,
        eventCode: data.eventCode != null ? String(data.eventCode) : '',
        inoutStatus: data.inoutStatus != null ? Number(data.inoutStatus) : undefined,
        person: pin ? `${pin}` : '系统',
        time,
        deviceName,
        deviceSn: sn,
        result: resultLabel,
        extra,
      };
      eventData.value = [event, ...eventData.value].slice(0, 100);
      refreshEventTable();
      // 要求：收到数据后，延迟1秒再显示弹窗消息（毫秒级）
      if (extra) {
        setTimeout(() => {
          // 显示弹窗
          showFaceToast(event);
        }, 1000);
      }
      // 更新设备心跳状态
      const idx = deviceList.value.findIndex((d) => d.sn === sn);
      if (idx >= 0) {
        deviceList.value[idx].status = 'online';
        deviceList.value[idx].lastHeartbeat = time;
      }
    } catch (e) {
      console.warn('处理WebSocket消息失败', e);
    }
  }

  async function fetchDoors() {
    try {
      const res = await listDoor({ pageNo: 1, pageSize: 100 });
      const records = Array.isArray(res?.records)
        ? res.records
        : Array.isArray(res?.result?.records)
        ? res.result.records
        : [];
      const mapped: DoorDevice[] = records.map((vo: any) => {
        const sn: string = vo.deviceSn || '';
        const name: string = vo.doorName || vo.deviceName || sn || '未命名门';
        snNameMap.value[sn] = name;
        return {
          id: String(vo.id ?? sn ?? name),
          name,
          location: String(vo.ipAddress ?? ''),
          sn,
          status: 'offline',
          lastHeartbeat: '',
        } as DoorDevice;
      });
      deviceList.value = mapped;
    } catch (e) {
      console.warn('加载门列表失败', e);
    }
  }

  async function syncAccDeviceStatus() {
    try {
      const res = await listDevices({ pageNo: 1, pageSize: 200 });
      const records = Array.isArray(res?.records)
        ? res.records
        : Array.isArray(res?.result?.records)
        ? res.result.records
        : [];
      const statusMap = new Map<string, { online: boolean; hb?: string }>();
      for (const it of records) {
        const sn = String(it?.sn || it?.deviceCode || '');
        if (!sn) continue;
        const online = it?.online === true || it?.online === 'true' || it?.online === 1;
        const hbRaw = it?.lastHeartbeatTime;
        const hb = hbRaw != null ? String(hbRaw).replace('T', ' ') : undefined;
        statusMap.set(sn, { online, hb });
      }
      deviceList.value = deviceList.value.map((d) => {
        const st = statusMap.get(d.sn);
        if (!st) return d;
        return {
          ...d,
          status: st.online ? 'online' : 'offline',
          lastHeartbeat: st.hb || d.lastHeartbeat || '',
        };
      });
    } catch (e) {
      console.warn('同步设备在线状态失败', e);
    }
  }

onMounted(async () => {
  refreshEventTable();
  onWebSocket(handleWebSocketMessage);
  await fetchDoors();
  await syncAccDeviceStatus();
  setTimeout(() => {
    syncAccDeviceStatus();
  }, 1000);
  intervalHandle = setInterval(() => {
    syncAccDeviceStatus();
  }, refreshSeconds.value * 1000);
});

  onBeforeUnmount(() => {
    // 解绑 WebSocket 监听，避免内存泄漏与重复回调
    offWebSocket(handleWebSocketMessage);
    if (intervalHandle) clearInterval(intervalHandle);
    if (faceTimer) clearTimeout(faceTimer);
    stopImageRetry();
  });
</script>

<style scoped>
  .monitor-vertical {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 170px);
  }

  .device-wall,
  .event-panel {
    background: linear-gradient(145deg, #101522 0%, #1d2437 100%);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 18px 30px rgba(0, 0, 0, 0.35);
    color: #fff;
  }

  .device-wall {
    flex: 3;
    min-height: 360px;
  }

  .event-panel {
    flex: 2;
    background: rgba(12, 18, 32, 0.96);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
  }

  .title-icon {
    font-size: 24px;
    color: #36cfc9;
  }

  .title-icon.flash {
    animation: pulse 1.5s infinite;
    color: #ffec3d;
  }

  .device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .device-card {
    position: relative;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }

  .device-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35);
  }

  .device-cover {
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .device-icon {
    font-size: 54px;
  }

  .device-status-label {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.4);
  }

  .device-info {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
  }

  .device-name {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
  }

  .device-location {
    font-size: 13px;
    opacity: 0.85;
    margin-bottom: 4px;
  }

  .device-sn {
    font-size: 12px;
    opacity: 0.7;
  }

  .device-online .device-cover {
    background: linear-gradient(135deg, rgba(82, 196, 26, 0.25), rgba(82, 196, 26, 0.05));
  }

  .device-offline .device-cover {
    background: linear-gradient(135deg, rgba(245, 34, 45, 0.25), rgba(245, 34, 45, 0.05));
    filter: grayscale(0.35);
  }

  .device-disabled .device-cover {
    background: linear-gradient(135deg, rgba(250, 173, 20, 0.25), rgba(250, 173, 20, 0.05));
  }

  .popover-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .popover-content {
    max-width: 260px;
    display: grid;
    gap: 6px;
  }

  .face-toast {
    position: fixed;
    right: 24px;
    bottom: 24px;
    display: grid;
    grid-template-rows: 160px auto;
    gap: 12px;
    width: 280px;
    padding: 18px;
    background: rgba(7, 12, 26, 0.92);
    backdrop-filter: blur(6px);
    color: #fff;
    border-radius: 16px;
    box-shadow: 0 18px 26px rgba(0, 0, 0, 0.45);
    z-index: 9999;
  }

  .face-photo-wrapper {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .face-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .face-info {
    display: grid;
    gap: 6px;
    font-size: 13px;
  }

  .face-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  .face-label {
    font-weight: 600;
    min-width: 78px;
    color: #8ac8ff;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }

  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(14px);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      text-shadow: 0 0 0 rgba(255, 255, 255, 0.4);
    }
    50% {
      transform: scale(1.05);
      text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
    }
    100% {
      transform: scale(1);
      text-shadow: 0 0 0 rgba(255, 255, 255, 0.4);
    }
  }
</style>