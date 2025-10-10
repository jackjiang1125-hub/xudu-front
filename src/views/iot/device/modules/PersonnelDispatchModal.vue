<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="mb-4">
      <div class="text-sm text-gray-600 mb-2">目标设备</div>
      <div class="flex flex-wrap gap-2">
        <a-tag v-for="device in selectedDevices" :key="device.id" color="blue">
          {{ device.sn }} - {{ device.deviceName }}
        </a-tag>
      </div>
    </div>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
import { dispatchPersonnel } from '../device.api';

const emit = defineEmits(['success', 'register']);

const { createMessage } = useMessage();
const selectedDevices = ref<any[]>([]);

const formSchema = [
  {
    field: 'userNo',
    label: '工号',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入工号',
    },
  },
  {
    field: 'userName',
    label: '姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入姓名',
    },
  },
  {
    field: 'cardNo',
    label: '卡号',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入卡号',
    },
  },
  {
    field: 'password',
    label: '密码',
    component: 'JInput',
    componentProps: {
      type: 'password',
      placeholder: '请输入密码',
    },
  },
  {
    field: 'timezoneId',
    label: '时区ID',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入时区ID',
    },
  },
  {
    field: 'doorId',
    label: '门ID',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入门ID',
    },
  },
  {
    field: 'deviceId',
    label: '设备ID',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入设备ID',
    },
  },
  {
    field: 'accessGroup',
    label: '门禁组',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入门禁组',
    },
  },
  {
    field: 'privilege',
    label: '权限',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入权限',
    },
  },
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择开始时间',
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择结束时间',
    },
  },
  {
    field: 'userPic',
    label: '用户照片',
    component: 'JImageUpload',
    componentProps: {
      maxCount: 1,
      accept: 'image/jpeg,image/png',
    },
  },
  {
    field: 'bioPhoto',
    label: '比对照片',
    component: 'JImageUpload',
    componentProps: {
      maxCount: 1,
      accept: 'image/jpeg,image/png',
    },
  },
];

const [registerForm, { validate, setFieldsValue, resetFields }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  showActionButtonGroup: false,
  actionColOptions: {
    span: 24,
  },
});

const [registerModal, { setModalProps, closeModal }] = useModalInner((data) => {
  resetFields();
  setModalProps({ confirmLoading: false });
  selectedDevices.value = data?.devices || [];
  if (data?.formData) {
    setFieldsValue(data.formData);
  }
});

const modalTitle = ref('人员信息下发');

interface PhotoInfo {
  content: string;
  name: string;
  type: string;
  size: number;
}

function extractImageContent(value: unknown): string | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item) {
        continue;
      }
      if (typeof item === 'string') {
        return item;
      }
      if (typeof item === 'object') {
        const fileLike = item as Record<string, any>;
        return (
          fileLike.url ||
          fileLike.thumbUrl ||
          fileLike.response?.message ||
          null
        );
      }
    }
    return null;
  }
  if (typeof value === 'string') {
    const parts = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
    return parts.length > 0 ? parts[0] : null;
  }
  return null
}

function getFileNameFromContent(content: string, fallbackName: string): string {
  if (!content || content.startsWith('data:image/')) {
    return fallbackName;
  }
  const normalized = content.split('?')[0];
  const segments = normalized.split('/');
  const last = segments[segments.length - 1];
  return last || fallbackName;
}

function guessMimeType(content: string, fileName: string): string {
  // if (content.startsWith('data:image/')) {
  //   const match = content.match(/^data:(image\\/[a-zA-Z0-9.+-]+);/);
  //   if (match) {
  //     return match[1];
  //   }
  // }
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lower.endsWith('.bmp')) {
    return 'image/bmp';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

function buildPhotoInfo(value: unknown, fallbackName: string): PhotoInfo | null {
  const raw = extractImageContent(value);
  if (!raw) {
    return null;
  }
  const content = raw.trim();
  if (!content) {
    return null;
  }
  const fileName = getFileNameFromContent(content, fallbackName);
  return {
    content,
    name: fileName,
    type: guessMimeType(content, fileName),
    size: 0,
  };
}

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });

    const userPic = buildPhotoInfo(values.userPic, 'user_pic.jpg');
    const bioPhoto = buildPhotoInfo(values.bioPhoto, 'bio_photo.jpg');

    console.log('Resolved userPic payload:', userPic);
    console.log('Resolved bioPhoto payload:', bioPhoto);

    const privilegeValue = values.privilege ?? values.permission ?? null;

    const personnelData = {
      pin: values.userNo,
      name: values.userName,
      cardno: values.cardNo,
      password: values.password,
      group: values.accessGroup,
      privilege: privilegeValue,
      starttime: values.startTime,
      endtime: values.endTime,
      authorizeTimezoneId: values.timezoneId ? parseInt(values.timezoneId) : null,
      authorizeDoorId: values.doorId ? parseInt(values.doorId) : null,
      devId: values.deviceId ? parseInt(values.deviceId) : null,
      userPic,
      bioPhoto,
    };

    console.log('Final personnel data:', personnelData);

    for (const device of selectedDevices.value) {
      console.log('Dispatching to device:', device.sn);
      await dispatchPersonnel(device.sn, personnelData);
    }

    createMessage.success('人员信息下发成功');
    closeModal();
    emit('success');
  } catch (error: any) {
    createMessage.error('人员信息下发失败：' + (error?.message || '未知错误'));
  } finally {
    setModalProps({ confirmLoading: false });
  }
}

function handleCancel() {
  closeModal();
}
</script>








