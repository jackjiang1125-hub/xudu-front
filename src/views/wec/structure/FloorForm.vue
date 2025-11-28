<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { floorFormSchema } from './structure.data';
import { addFloor, editFloor, batchAddFloors } from './structure.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ record?: Record<string, any> }>();
const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields }] = useForm({
  schemas: floorFormSchema,
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
    await editFloor(values);
    createMessage.success('编辑成功');
  } else {
    if (values.batchCreate === '1') {
      await batchAddFloors({ buildingId: String(values.buildingId), startNo: Number(values.startNo), endNo: Number(values.endNo) });
      createMessage.success('批量新增成功');
    } else {
      await addFloor(values);
      createMessage.success('新增成功');
    }
  }
  emit('success');
}
</script>
