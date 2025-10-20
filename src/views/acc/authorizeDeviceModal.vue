<template>
  <BasicModal @register="registerModal" :title="title" :width="800" @ok="handleSubmit">
    <a-spin :spinning="loading">
      <Description @register="registerDesc" />
      <div style="margin-top: 16px">
        <BasicForm @register="registerForm" />
      </div>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Description, useDescription } from '/@/components/Description';
  import { BasicForm, useForm, type FormSchema } from '/@/components/Form';
  import { detailSchema } from './device.data';
  import { addAccDevice, type AccDeviceModel } from './devce.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { dateUtil } from '/@/utils/dateUtil';

  interface AuthorizePayload {
    record?: AccDeviceModel;
    sn?: string;
    [key: string]: unknown;
  }

  const emit = defineEmits(['register', 'success']);
  const { createMessage } = useMessage();

  const title = ref('设备授权');
  const loading = ref(false);
  const currentSn = ref<string>('');
  const fallbackRecord = ref<AccDeviceModel | null>(null);

  const [registerDesc, { setDescProps }] = useDescription({
    column: 2,
    schema: detailSchema,
    data: {},
    labelStyle: { width: '150px' },
  });

  const formSchema: FormSchema[] = [
    {
      label: '设备名称',
      field: 'deviceName',
      component: 'Input',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请输入设备名称（可修改）',
        allowClear: true,
      },
    },
    {
      label: '是否重置设备数据',
      field: 'resetData',
      component: 'RadioGroup',
      defaultValue: false,
      colProps: { span: 24 },
      componentProps: {
        options: [
          { label: '否', value: false },
          { label: '是', value: true },
        ],
      },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (payload?: AuthorizePayload) => {
    setModalProps({ confirmLoading: false });
    await resetFields();
    title.value = '设备授权';
    loading.value = true;

    // 设置上下文
    currentSn.value = String(payload?.sn ?? payload?.record?.sn ?? '');
    fallbackRecord.value = payload?.record ?? null;

    try {
      // 直接使用列表返回的数据初始化详情与表单
      const detail = fallbackRecord.value;
      if (detail && detail.deviceName) {
        title.value = `设备授权 - ${detail.deviceName}`;
      }
      setDescProps({ data: formatDetail(detail) });
      await setFieldsValue({
        deviceName: detail?.deviceName ?? '',
        resetData: false,
      });
    } catch (error) {
      console.error('初始化授权弹窗失败', error);
      createMessage.error('初始化失败');
    } finally {
      loading.value = false;
    }
  });

  async function loadDetail(sn: string, fallback?: AccDeviceModel | null) {
    return fallback || null;
  }

  function formatDetail(detail?: AccDeviceModel | null) {
    if (!detail) return {};
    const result: Record<string, any> = { ...detail };
    result.lastRegistryTime = formatDate(detail.lastRegistryTime);
    result.lastHeartbeatTime = formatDate(detail.lastHeartbeatTime);
    result.authorized = formatAuthorized(detail.authorized);
    return result;
  }

  function formatDate(value: unknown) {
    if (!value) return '';
    try {
      return dateUtil(value as string).format('YYYY-MM-DD HH:mm:ss');
    } catch (error) {
      return String(value ?? '');
    }
  }

  function formatAuthorized(value: unknown) {
    if (value === 1 || value === '1' || value === true) return '已授权';
    if (value === 0 || value === '0' || value === false) return '未授权';
    return value ?? '未知';
  }

  async function handleSubmit() {
    try {
      const values = await validate();
      const sn = unref(currentSn);
      const deviceName = values?.deviceName as string | undefined;
      const reset = Boolean(values?.resetData);
      const ipAddress = fallbackRecord.value?.ipAddress;
      const registryCode = fallbackRecord.value?.registryCode;
      // 已简化为直接保存，不再使用扩展字段 extras
       setModalProps({ confirmLoading: true });

      // 直接保存门禁设备（提交 AccDeviceVO 对象到 /acc/device/add）
      await addAccDevice({
        sn,
        deviceName,
        ipAddress,
        registryCode,
        isReset: reset,
        remark: reset ? 'RESET_DEVICE_DATA' : undefined,
      });

      createMessage.success(`设备 ${deviceName ?? sn} 已保存`);
      closeModal();
      emit('success');
    } catch (error) {
      console.error('授权失败', error);
      createMessage.error('授权失败，请稍后重试');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>