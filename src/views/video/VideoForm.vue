<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    :okText="isUpdate ? '更新' : '保存'"
    :cancelText="'取消'"
    :width="800"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { formSchema } from './video.data';
import { addVideo, editVideo, getVideoById } from './video.api';

const emit = defineEmits(['success', 'register']);

const { createMessage } = useMessage();
const isUpdate = ref(false);
const rowId = ref('');

const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  showActionButtonGroup: false,
  actionColOptions: {
    span: 23,
  },
});

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  resetFields();
  setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter });
  isUpdate.value = !!data?.isUpdate;

  if (unref(isUpdate)) {
    rowId.value = data.record.id;
    const recordData = { ...data.record };
    
    // 处理所属模块字段的字典显示
    if (recordData.model) {
      const modelDict = getDictItemsByCode('xudu_model_video') || [];
      const modelOption = modelDict.find(item => item.value === recordData.model);
      if (modelOption) {
        recordData.model = modelOption.text;
      }
    }
    
    setFieldsValue(recordData);
  } else {
    // 新增时设置默认值
    setFieldsValue({
      app: 'xudu',
      status: 'offline',
    });
  }
});

const getTitle = computed(() => (!unref(isUpdate) ? '新增视频流' : '编辑视频流'));

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    
    // 处理所属模块字段，将显示文本转换回字典key值
    if (values.model) {
      const modelDict = getDictItemsByCode('xudu_model_video') || [];
      const modelOption = modelDict.find(item => item.text === values.model);
      if (modelOption) {
        values.model = modelOption.value;
      }
    }
    
    if (unref(isUpdate)) {
      await editVideo({ ...values, id: rowId.value });
      createMessage.success('更新成功');
    } else {
      await addVideo(values);
      createMessage.success('保存成功');
    }
    
    closeModal();
    emit('success');
  } catch (error) {
    //createMessage.error('操作失败：' + error.message);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
