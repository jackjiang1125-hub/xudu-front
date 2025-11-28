<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './location.data';
import { addLocation, editLocation } from './location.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ record?: Record<string, any> }>();
const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: true,
  submitButtonOptions: { text: '保存', preIcon: '' },
  actionColOptions: { span: 24 },
});

watch(() => props.record, (val) => {
  if (val && (val as any).id) setFieldsValue(val);
  else resetFields();
}, { immediate: true });

async function handleSubmit(values: Record<string, any>) {
  if (values.id) {
    await editLocation(values);
    createMessage.success('编辑成功');
  } else {
    await addLocation(values);
    createMessage.success('新增成功');
  }
  emit('success');
}
</script>
