<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './command.data';
import { addCommand, editCommand } from './command.api';
import { useMessage } from '/@/hooks/web/useMessage';

const props = defineProps<{ 
  record: Record<string, any>;
  readonly?: boolean;
}>();

const emit = defineEmits(['success']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields, getFieldsValue }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: !props.readonly,
  actionColOptions: { span: 24 },
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
});

// 监听record变化，设置表单值
watch(
  () => props.record,
  (val) => {
    if (val && val.id) {
      setFieldsValue(val);
    } else {
      resetFields();
    }
  },
  { immediate: true }
);

async function handleSubmit(values: any) {
  try {
    if (values.id) {
      await editCommand(values);
      createMessage.success('更新成功');
    } else {
      await addCommand(values);
      createMessage.success('创建成功');
    }
    emit('success');
  } catch (error) {
    console.error('保存失败:', error);
  }
}
</script>
