<template>
  <!-- 业务用户照片导入弹窗：复用 UploadModal -->
  <UploadModal
    :api="uploadPhotoApi"
    :accept="acceptTypes"
    :helpText="helpText"
    :multiple="true"
    :maxNumber="500"
    :maxSize="10"
    :height="500"
    name="file"
    @register="registerUploadModal"
    @change="handleChange"
    @uploaded="handleUploaded"
  />
</template>

<script lang="ts" setup>
import { useModal } from '/@/components/Modal';
import UploadModal from '/@/components/Upload/src/UploadModal.vue';
import { defHttp } from '/@/utils/http/axios';
import { getBizUserPhotoImportUrl } from './user.api';
import { Modal } from 'ant-design-vue';
import { h, ref } from 'vue';

const acceptTypes = ['.jpg', '.jpeg', '.png', 'image/jpeg', 'image/png'];
const helpText = '请使用人员编号为照片文件名，支持JPG/PNG，单次最多500张';

// 注册并拿到打开方法
const [registerUploadModal, { openModal: openUploadModal }] = useModal();

// 暴露给父组件调用
function open() {
  // 打开前重置统计
  successList.value = [];
  failList.value = [];
  openUploadModal(true, {});
}
defineExpose({ open });

// UploadModal 需要的上传函数签名：返回 { data: UploadApiResult }
async function uploadPhotoApi(
  params: any,
  onUploadProgress: any
) {
  const fileName = params?.file?.name || '';
  try {
    const res = await defHttp.uploadFile(
      {
        url: getBizUserPhotoImportUrl,
        onUploadProgress: onUploadProgress as any,
      },
      params,
      { isReturnResponse: true }
    );
    // 兼容 isReturnResponse: true 时 axios 响应结构
    const body = res && (res as any).data && typeof (res as any).data === 'object' ? (res as any).data : res;
    const code = Number((body as any)?.code);
    const message = (body as any)?.message || '';
    const url = (body as any)?.url || '';
    // 记录成功或失败（即便 HTTP 200，也按后端 code 判断）
    if (code === 200 && url) {
      successList.value.push({ name: fileName, url });
    } else {
      failList.value.push({ name: fileName, reason: message || '未知错误', code, raw: body });
    }
    // 统一为 UploadModal 的期望返回结构（返回业务体，保持 .url/.message/.code 字段）
    return { data: body };
  } catch (e: any) {
    const respData = e?.response?.data;
    const reason = respData?.message || e?.message || '网络或服务器错误';
    failList.value.push({ name: fileName, reason, code: respData?.code, raw: respData || e });
    // 让 UploadModal 感知失败状态
    throw e;
  }
}

// 保存成功后通知父组件刷新列表
const emit = defineEmits(['success']);
// 成功触发 change（保存）后，弹出汇总结果
const successList = ref<{ name: string; url: string }[]>([]);
const failList = ref<{ name: string; reason: string; code?: number }[]>([]);

function showSummary() {
  const total = successList.value.length + failList.value.length;
  const successCount = successList.value.length;
  const failCount = failList.value.length;

  const contentVNode = h('div', { style: 'max-height: 60vh; overflow: auto;' }, [
    h('p', {}, `共上传 ${total} 张，成功 ${successCount} 张，失败 ${failCount} 张。`),
    successCount > 0
      ? h('div', { style: 'margin-top: 8px;' }, [
          h('strong', {}, '成功列表'),
          h(
            'ul',
            { style: 'padding-left: 20px;' },
            successList.value.map((item) => h('li', {}, `${item.name}`))
          ),
        ])
      : null,
    failCount > 0
      ? h('div', { style: 'margin-top: 8px;' }, [
          h('strong', { style: 'color: #d4380d;' }, '失败列表'),
          h(
            'ul',
            { style: 'padding-left: 20px;' },
            failList.value.map((item) => {
              console.log('BizPhotoImportModal fail item', item);
              return h('li', {}, `${item.name} - ${item.reason}`);
            })
          ),
        ])
      : null,
  ]);

  Modal.info({ title: '批量导入结果', width: 700, content: contentVNode });
}

function handleChange() {
  emit('success');
  showSummary();
}

function handleUploaded() {
  showSummary();
}
</script>

<style scoped></style>
