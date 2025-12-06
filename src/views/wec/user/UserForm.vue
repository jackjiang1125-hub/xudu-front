<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter title="人员信息" width="600px" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { formSchema } from './user.data';
import { addUser, editUser } from './user.api';
import { useMessage } from '/@/hooks/web/useMessage';

const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
const { createMessage } = useMessage();

const [registerForm, { setFieldsValue, resetFields, updateSchema }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  showActionButtonGroup: false,
  actionColOptions: { span: 24 },
});

const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  resetFields();
  setDrawerProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;

  if (unref(isUpdate)) {
    setFieldsValue({
      ...data.record,
    });
    updateSchema({
      field: 'cardNo',
      componentProps: { disabled: true },
    });
  } else {
    updateSchema({
      field: 'cardNo',
      componentProps: { disabled: false },
    });
  }
});

async function handleSubmit() {
  try {
    const values = await validate();
    setDrawerProps({ confirmLoading: true });
    // TODO: Remove this check once validation is fully working
    if (unref(isUpdate)) {
      await editUser(values);
      createMessage.success('编辑成功');
    } else {
      await addUser(values);
      createMessage.success('新增成功');
    }
    closeDrawer();
    emit('success');
  } finally {
    setDrawerProps({ confirmLoading: false });
  }
}
</script>
