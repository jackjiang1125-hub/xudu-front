<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="900px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { formSchema } from './accdoor.data';
  import { addDoor, updateDoor, getDoorDetail } from './accdoor.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref<boolean>(false);
  const rowId = ref<number | null>(null);
  const { createMessage } = useMessage();

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    isUpdate.value = !!data?.isUpdate;
    rowId.value = data?.id ?? null;
    setModalProps({ confirmLoading: false });
    if (rowId.value) {
      const detail = await getDoorDetail({ id: rowId.value });
      if (detail && detail.result) {
        await setFieldsValue(detail.result);
      }
    } else if (data) {
      // 预置新增时的默认值（如有需要）
      await setFieldsValue({ disableAlarmReminder: false });
    }
  });

  const title = computed(() => (unref(isUpdate) ? '编辑门信息' : '新增门信息'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (values.id) {
        await updateDoor(values);
        createMessage.success('更新成功');
      } else {
        await addDoor(values);
        createMessage.success('新增成功');
      }
      emit('success');
      closeModal();
    } catch (e) {
      // 验证失败或请求异常
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
<style scoped></style>