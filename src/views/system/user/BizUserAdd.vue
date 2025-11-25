<template>
  <div>
    <BasicForm @register="registerForm" @submit="handleSubmit" />
  </div>
</template>

<script lang="ts" name="biz-user-add" setup>
import { onMounted } from 'vue';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './user.data';
import { saveOrUpdateUser } from './user.api';
import { useMessage } from '/@/hooks/web/useMessage';
import { useRouter } from 'vue-router';

const router = useRouter();
const { createMessage } = useMessage();

const bizFormSchema = formSchema.filter((s) => s.field !== 'userType');

const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({
  labelWidth: 90,
  schemas: bizFormSchema,
  showActionButtonGroup: true,
  actionColOptions: { span: 24 },
});

onMounted(async () => {
  await resetFields();
  await setFieldsValue({ userType: 2 });
});

async function handleSubmit(values) {
  const data = await validate();
  await saveOrUpdateUser({ ...data, userType: 2 }, false);
  createMessage.success('新增成功');
  router.back();
}
</script>

<style scoped></style>
