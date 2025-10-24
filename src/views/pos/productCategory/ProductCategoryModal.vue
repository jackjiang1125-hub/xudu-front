<template>
  <BasicForm @register="registerForm" @submit="handleSubmit" :labelWidth="110" />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './productCategory.data';
import { useMessage } from '/@/hooks/web/useMessage';
import type { ProductCategoryItem } from './productCategory.data';
import { checkCategoryCode } from './productCategory.api';

const props = defineProps<{
  record?: ProductCategoryItem | null;
}>();

const emit = defineEmits(['success', 'cancel']);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, validate, setFieldsError }] = useForm({
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

// 监听记录变化，设置表单值
watch(
  () => props.record,
  (val) => {
    if (val && val.id) {
      setFieldsValue(val);
    }
  },
  { immediate: true },
);

async function handleSubmit(values: any) {
  // 先进行基本表单验证
  const valid = await validate();
  if (!valid) {
    return;
  }
  
  // 清除之前可能存在的错误提示
  setFieldsError({ categoryCode: '' });
  
  // 进行分类编号唯一性校验
  try {
    const checkResult = await checkCategoryCode({
      categoryCode: values.categoryCode,
      excludeId: values.id || ''
    });
    
    // 唯一性校验：当success为true或result为true时，表示编号已存在
    if (checkResult && (checkResult.success === true || checkResult.result === true)) {
      // 设置字段级错误提示
      setFieldsError({
        categoryCode: '该分类编号已存在，请重新输入'
      });
      // 保持弹窗打开状态，不触发success事件
      return;
    }
  } catch (error) {
    console.error('校验分类编号失败:', error);
    // 设置错误提示
    setFieldsError({
      categoryCode: '校验失败，请稍后重试'
    });
    return;
  }
  
  // 清洗数据：移除分类编号、分类名称和展示别名前后的星号
  const cleanValues = {
    ...values,
    categoryCode: values.categoryCode ? String(values.categoryCode).replace(/^\*+|\*+$/g, '') : values.categoryCode,
    categoryName: values.categoryName ? String(values.categoryName).replace(/^\*+|\*+$/g, '') : values.categoryName,
    alias: values.alias ? String(values.alias).replace(/^\*+|\*+$/g, '') : values.alias
  };
  
  // 验证通过，提交表单数据并关闭弹窗
  emit('success', cleanValues);
}
</script>