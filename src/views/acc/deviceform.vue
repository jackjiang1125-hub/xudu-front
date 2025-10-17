<template>
  <BasicModal @register="registerModal" :title="modalTitle" :footer="null" :width="720">
    <a-spin :spinning="loading">
      <Description @register="registerDesc" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Description, useDescription } from '/@/components/Description';
  import { detailSchema } from './device.data';
  import { getDeviceDetail, type AccDeviceModel } from './devce.api';
  import { dateUtil } from '/@/utils/dateUtil';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface DetailPayload {
    id?: string;
    sn?: string;
    record?: AccDeviceModel;
    [key: string]: unknown;
  }

  const { createMessage } = useMessage();
  const modalTitle = ref('设备详情');
  const loading = ref(false);

  const [registerDesc, { setDescProps }] = useDescription({
    column: 2,
    schema: detailSchema,
    data: {},
    labelStyle: {
      width: '150px',
    },
  });

  const [registerModal, { setModalProps }] = useModalInner(async (payload?: DetailPayload) => {
    modalTitle.value = '设备详情';
    setDescProps({ data: {} });
    setModalProps({ confirmLoading: false });
    loading.value = true;

    try {
      const params = resolveParams(payload);
      const detail = await loadDetail(params, payload?.record);
      if (detail && detail.deviceName) {
        modalTitle.value = `设备详情 - ${detail.deviceName}`;
      }
      setDescProps({ data: formatDetail(detail) });
    } catch (error) {
      console.error('获取设备详情失败', error);
      createMessage.error('设备详情加载失败');
    } finally {
      loading.value = false;
    }
  });

  function resolveParams(payload?: DetailPayload) {
    const params: Record<string, any> = {};
    if (!payload) {
      return params;
    }
    if (payload.id) {
      params.id = payload.id;
    }
    if (payload.sn) {
      params.sn = payload.sn;
    }
    if (payload.record?.id && params.id === undefined) {
      params.id = payload.record.id;
    }
    if (payload.record?.sn && params.sn === undefined) {
      params.sn = payload.record.sn;
    }
    return params;
  }

  async function loadDetail(params: Record<string, any>, fallback?: AccDeviceModel | null) {
    const hasQuery = Object.keys(params).length > 0;
    if (hasQuery) {
      const data = await getDeviceDetail(params);
      if (data) {
        return data;
      }
    }
    return fallback ?? null;
  }

  function formatDetail(detail?: AccDeviceModel | null) {
    if (!detail) {
      return {};
    }
    const result: Record<string, any> = { ...detail };
    result.lastRegistryTime = formatDate(result.lastRegistryTime);
    result.lastHeartbeatTime = formatDate(result.lastHeartbeatTime);
    result.authorized = formatAuthorized(detail.authorized);
    return result;
  }

  function formatDate(value: unknown) {
    if (!value) {
      return '';
    }
    try {
      return dateUtil(value as string).format('YYYY-MM-DD HH:mm:ss');
    } catch (error) {
      return String(value ?? '');
    }
  }

  function formatAuthorized(value: unknown) {
    if (value === 1 || value === '1' || value === true) {
      return '已授权';
    }
    if (value === 0 || value === '0' || value === false) {
      return '未授权';
    }
    return value ?? '未知';
  }
</script>
