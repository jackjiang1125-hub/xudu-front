<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './accreader.data';
  import { addReader, updateReader, getReaderDetail } from './accreader.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const isUpdate = ref(true);
  const rowId = ref('');

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
    autoSubmitOnEnter: true,
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      rowId.value = data.record.id;
      // 获取详细信息
      try {
        const result = await getReaderDetail({ id: data.record.id });
        if (result) {
          setFieldsValue({
            ...result,
          });
        }
      } catch (error) {
        console.error('获取读头详情失败:', error);
      }
    } else {
      // 新增时设置默认值
      setFieldsValue({
        type: 'in', // 默认为入
      });
    }
  });

  const getTitle = computed(() => (!unref(isUpdate) ? '新增读头' : '编辑读头'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      if (unref(isUpdate)) {
        values.id = rowId.value;
        await updateReader(values);
        createMessage.success('编辑成功');
      } else {
        await addReader(values);
        createMessage.success('新增成功');
      }

      closeModal();
      emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>