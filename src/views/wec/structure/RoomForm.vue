<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { roomFormSchema } from './structure.data';
import { addRoom, editRoom, batchAddRooms } from './structure.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ record?: Record<string, any> }>();
const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields }] = useForm({
  schemas: roomFormSchema,
  showActionButtonGroup: true,
  submitButtonOptions: { text: '保存', preIcon: '' },
  actionColOptions: { span: 24 },
});

watch(() => props.record, async (val) => {
  await resetFields();
  if (val) await setFieldsValue(val);
}, { immediate: true });

async function handleSubmit(values: Record<string, any>) {
  if (values.id) {
    await editRoom(values);
    createMessage.success('编辑成功');
  } else {
    if (values.batchCreate === '1') {
      await batchAddRooms({ floorId: String(values.floorId), startNo: Number(values.startNo), endNo: Number(values.endNo) });
      createMessage.success('批量新增成功');
    } else {
      await addRoom(values);
      createMessage.success('新增成功');
    }
  }
  emit('success');
}
</script>
