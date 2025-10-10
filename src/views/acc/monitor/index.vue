<template>
  <PageWrapper dense contentFull overflowHidden title="Realtime Access Monitor">
    <div class="monitor-vertical">
      <section class="device-wall">
        <header class="section-header">
          <div class="title">
            <Icon icon="mdi:door" class="title-icon" />
            <span>Device Overview</span>
          </div>
          <a-space>
            <a-select v-model:value="statusFilter" allowClear placeholder="Filter status" style="width: 150px">
              <a-select-option value="online">Online</a-select-option>
              <a-select-option value="offline">Offline</a-select-option>
              <a-select-option value="disabled">Disabled</a-select-option>
            </a-select>
            <a-input-search v-model:value="keyword" placeholder="Search name or SN" style="width: 200px" />
          </a-space>
        </header>

        <div class="device-grid">
          <a-empty v-if="!filteredDevices.length" description="No device matches the filter" />
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
                  <a-divider>Quick Actions</a-divider>
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
            <span>Realtime Event Stream</span>
          </div>
          <a-space>
            <a-tag color="blue">Refresh: {{ refreshSeconds }}s</a-tag>
            <a-switch v-model:checked="autoScroll" checked-children="Follow" un-checked-children="Pause" />
          </a-space>
        </header>
        <BasicTable @register="handleRegisterEventTable" />
      </section>
    </div>

    <Teleport to="body">
      <transition name="fade-slide">
        <div v-if="faceNotification" class="face-toast">
          <div class="face-photo-wrapper">
            <img :src="faceNotification.avatar" alt="avatar" class="face-photo" />
          </div>
          <div class="face-info">
            <div class="face-row"><span class="face-label">Name:</span>{{ faceNotification.name }}</div>
            <div class="face-row"><span class="face-label">Department:</span>{{ faceNotification.department }}</div>
            <div class="face-row"><span class="face-label">Device:</span>{{ faceNotification.deviceName }}</div>
            <div class="face-row"><span class="face-label">Time:</span>{{ faceNotification.time }}</div>
          </div>
        </div>
      </transition>
    </Teleport>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    deviceStatusMeta,
    mockDoorDevices,
    type DoorDevice,
    actionDefinitions,
    eventColumns,
    mockInitialEvents,
    type EventRecord,
    mockFaceProfiles,
  } from './deviceMonitor.data';
  import { random } from 'lodash-es';

  const { createMessage } = useMessage();

  const deviceList = ref<DoorDevice[]>([...mockDoorDevices]);
  const keyword = ref('');
  const statusFilter = ref<string | undefined>();

  const eventData = ref<EventRecord[]>([...mockInitialEvents]);
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
    title: 'Realtime Events',
    columns: eventColumns,
    dataSource: eventData.value,
    rowKey: 'id',
    pagination: {
      pageSize: 8,
      showSizeChanger: false,
    },
    showIndexColumn: true,
  });

  function handleRegisterEventTable(...args: any[]) {
    registerEventTable(...args);
    tableReady.value = true;
    refreshEventTable();
  }

  function refreshEventTable() {
    if (!tableReady.value) return;
    setTableData(eventData.value.slice());
    const paginationRef = getPaginationRef();
    if (autoScroll.value && paginationRef?.value) {
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

  function handleDeviceAction(action: string, device: DoorDevice) {
    const copy: Record<string, string> = {
      open: 'Remote open command sent',
      close: 'Remote close command sent',
      lock: 'Device locked',
      unlock: 'Device unlocked',
      fetch: 'Fetching recent logs...',
    };
    createMessage.success(`${device.name}: ${copy[action] ?? 'Action triggered'}`);
    pushMockEvent(action, device);
  }

  function showFaceToast(record: EventRecord) {
    if (!record.extra) return;
    faceNotification.value = {
      avatar: record.extra.avatar ?? 'https://cdn.jsdelivr.net/gh/placeholderjs/face@main/male/64.png',
      name: record.extra.name ?? record.person,
      department: record.extra.department ?? 'Unknown Department',
      time: record.time,
      deviceName: record.deviceName,
    };
    if (faceTimer) clearTimeout(faceTimer);
    faceTimer = setTimeout(() => {
      faceNotification.value = null;
    }, 5000);
  }

  function pushMockEvent(action: string, device: DoorDevice, extra?: EventRecord['extra']) {
    const mapping: Record<string, string> = {
      open: 'Remote Open',
      close: 'Remote Close',
      lock: 'Remote Lock',
      unlock: 'Unlock',
      fetch: 'Query Logs',
      heartbeat: 'Heartbeat',
      face: 'Face Access Granted',
    };
    const event: EventRecord = {
      id: `evt-${Date.now()}`,
      type: mapping[action] ?? 'System Event',
      person: action === 'fetch' ? 'System' : action === 'heartbeat' ? 'Device' : extra?.name ?? 'Security Center',
      time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      deviceName: device.name,
      deviceSn: device.sn,
      result: deviceStatusMeta[device.status].label,
      extra,
    };
    eventData.value = [event, ...eventData.value].slice(0, 60);
    refreshEventTable();
    if (action === 'face' && extra) {
      showFaceToast(event);
    }
  }

  function startMockStream() {
    intervalHandle = setInterval(() => {
      const idx = random(0, deviceList.value.length - 1);
      const device = deviceList.value[idx];
      const prevStatus = device.status;
      if (Math.random() < 0.25) {
        const statuses: DoorDevice['status'][] = ['online', 'offline', 'disabled'];
        device.status = statuses[random(0, statuses.length - 1)];
        device.lastHeartbeat = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      const roll = Math.random();
      if (roll < 0.3) {
        const faceProfile = mockFaceProfiles[random(0, mockFaceProfiles.length - 1)];
        pushMockEvent('face', device, faceProfile);
      } else {
        pushMockEvent('heartbeat', device);
      }
      if (prevStatus !== device.status) {
        createMessage.warning(`${device.name} status changed to ${deviceStatusMeta[device.status].label}`);
      }
    }, refreshSeconds.value * 1000);
  }

  onMounted(() => {
    refreshEventTable();
    startMockStream();
  });

  onBeforeUnmount(() => {
    if (intervalHandle) clearInterval(intervalHandle);
    if (faceTimer) clearTimeout(faceTimer);
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