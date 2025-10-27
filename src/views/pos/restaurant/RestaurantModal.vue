<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" :labelWidth="110" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './restaurant.data';
import { addRestaurant, editRestaurant } from './restaurant.api';
import { useMessage } from '/@/hooks/web/useMessage';
import type { RestaurantRecord } from './restaurant.data';

const props = defineProps<{
  record: Partial<RestaurantRecord>;
}>();
const emit = defineEmits<{
  success: [data?: RestaurantRecord];
  cancel: [];
}>();

const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields, validate, setFieldsError }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: true,
  actionColOptions: {
    span: 24,
  },
  submitButtonOptions: {
    text: '确定',
  },
  cancelButtonOptions: {
    text: '取消',
    onClick: () => emit('cancel'),
  },
});

watch(() => props.record, (val) => {
  if (val && val.id) {
    setFieldsValue(val);
  } else {
    resetFields();
  }
}, { immediate: true });

async function handleSubmit(values) {
  // 先进行基本表单验证
  const valid = await validate();
  if (!valid) {
    return;
  }
  
  try {
    // 提交数据
    const submitData = { ...values };
    
    // 清理数据中的星号字符
    Object.keys(submitData).forEach(key => {
      if (typeof submitData[key] === 'string') {
        submitData[key] = submitData[key].replace(/\*/g, '');
      }
    });
    
    // 根据是否有id判断是新增还是编辑
    if (values.id) {
      // 编辑模式
      const response = await editRestaurant(submitData);
      createMessage.success('餐厅信息更新成功');
      emit('success', response);
    } else {
      // 新增模式
      const response = await addRestaurant(submitData);
      createMessage.success('餐厅新增成功');
      emit('success', response);
    }
  } catch (error) {
    createMessage.error('操作失败，请重试');
    console.error('保存餐厅信息失败:', error);
  }
}
</script>