<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './device.data';
import { addWecDevice, editWecDevice } from './device.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ record?: Record<string, any> }>();
const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: true,
  actionColOptions: { span: 24 },
  submitButtonOptions: { text: '保存' },
});

watch(() => props.record, async (val) => {
  await resetFields();
  if (val && (val as any).id) {
    await setFieldsValue(val);
  }
}, { immediate: true, deep: true });

async function handleSubmit(values: Record<string, any>) {
  // 确保编辑时 ID 存在
  const id = values.id || props.record?.id;
  if (id) {
    values.id = id;
    await editWecDevice(values);
    createMessage.success('编辑成功');
  } else {
    await addWecDevice(values);
    createMessage.success('新增成功');
  }
  emit('success');
}
</script>
