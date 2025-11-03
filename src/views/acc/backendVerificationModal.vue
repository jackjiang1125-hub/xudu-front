<template>
  <BasicModal
    v-bind="$attrs"
    title="设置后台验证参数"
    @register="registerModal"
    @ok="submitForm"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
import { setBackendVerification } from './devce.api';

const emit = defineEmits(['success']);
const { createMessage } = useMessage();

let snsRef: string[] = [];

const formSchema = [
  {
    field: 'autoServerMode',
    label: '后台验证',
    labelWidth: 120,
    component: 'JSwitch',
    // 默认不启动后台验证
    defaultValue: '0',
    componentProps: {
      options: ['1', '0'],
      labelOptions: ['启用', '禁用'],
    },
  },
  {
    field: 'offlinePolicy',
    label: '控制器离线策略',
    // 增加该项的 label 区域宽度
    labelWidth: 120,
    // 使用已注册的 Select 组件
    component: 'Select',
    defaultValue: 'standard',
    componentProps: {
      style: { width: '220px' },
      options: [
        { label: '标准通行权限', value: 'standard' },
        { label: '拒绝用户通行', value: 'reject' },
      ],
    },
    // 兼容 JSwitch 不同取值（'1'/'0'、'Y'/'N'、true/false）
    ifShow: ({ values }) => {
      const v = values?.autoServerMode;
      return v === '1' || v === 1 || v === true || v === 'Y';
    },
  },
];

const [registerForm, { validate, resetFields }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
  actionColOptions: { span: 24 },
});

const [registerModal, { setModalProps }] = useModalInner(async (data: any) => {
  snsRef = Array.isArray(data?.sns) ? data.sns : [];
  resetFields();
  setModalProps({ okText: '下发配置' });
});

async function submitForm() {
  const values = await validate();
  const enabled = values.autoServerMode === '1';
  const payload = { sns: snsRef, enabled, offlinePolicy: values.offlinePolicy };
  try {
    const res: any = await setBackendVerification(payload);
    const total = res?.total ?? snsRef.length;
    const success = res?.success ?? total;
    const failedList: string[] = res?.failed ?? [];
    if (failedList.length > 0) {
      createMessage.error(`下发失败 ${failedList.length} 台：${failedList.join(',')}`);
    }
    createMessage.success(`已下发后台验证参数，成功 ${success}/${total}`);
    emit('success');
  } catch (e) {
    console.error(e);
    createMessage.error('下发失败，请稍后重试');
  }
}
</script>