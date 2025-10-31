<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './transaction.data';
import { addTransaction, editTransaction } from './transaction.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ record: Record<string, any> }>();
const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: true,
  actionColOptions: { span: 24 },
});

watch(() => props.record, (val) => {
  if (val && val.id) setFieldsValue(val);
  else resetFields();
}, { immediate: true });

async function handleSubmit(values) {
  if (values.id) { await editTransaction(values); createMessage.success('编辑成功'); }
  else { await addTransaction(values); createMessage.success('新增成功'); }
  emit('success');
}
</script>