<template>
  <div class="p-4">
    <h2>图片压缩测试页面</h2>
    
    <div class="mb-4">
      <h3>上传测试图片</h3>
      <JImageUpload
        v-model:value="testImage"
        :maxCount="1"
        accept="image/jpeg,image/png"
        bizPath="iot/device"
        listType="picture-card"
        @change="handleImageChange"
      />
      <div class="mt-2">
        <strong>当前图片:</strong> {{ testImage ? '已选择' : '未选择' }}
      </div>
    </div>
    
    <div class="mb-4">
      <h3>压缩设置</h3>
      <a-form layout="inline">
        <a-form-item label="目标大小(KB)">
          <a-input-number v-model:value="targetSizeKB" :min="50" :max="1000" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="testCompression" :loading="testing">
            测试压缩
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    
    <div v-if="compressionResult" class="mb-4">
      <h3>压缩结果</h3>
      <pre class="bg-gray-100 p-4 rounded">{{ compressionResult }}</pre>
    </div>
    
    <div v-if="compressedImage" class="mb-4">
      <h3>压缩后的图片</h3>
      <img :src="compressedImage" alt="压缩后的图片" style="max-width: 300px; max-height: 300px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { JImageUpload } from '/@/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
import { defHttp } from '/@/utils/http/axios';

const { createMessage } = useMessage();

const testImage = ref<string>('');
const targetSizeKB = ref<number>(200);
const testing = ref<boolean>(false);
const compressionResult = ref<string>('');
const compressedImage = ref<string>('');

function handleImageChange(value: string) {
  console.log('图片变化:', value);
  testImage.value = value;
}

async function testCompression() {
  if (!testImage.value) {
    createMessage.error('请先选择测试图片');
    return;
  }
  
  testing.value = true;
  compressionResult.value = '';
  compressedImage.value = '';
  
  try {
    // 获取图片的base64数据
    let imageBase64 = '';
    
    if (testImage.value.startsWith('data:image/')) {
      // 如果是data URL，提取base64部分
      imageBase64 = testImage.value.split(',')[1];
    } else if (testImage.value.startsWith('http')) {
      // 如果是URL，需要先下载图片
      createMessage.info('正在下载图片...');
      const response = await fetch(testImage.value);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        imageBase64 = dataUrl.split(',')[1];
        performCompressionTest(imageBase64);
      };
      reader.readAsDataURL(blob);
      return;
    } else {
      // 假设是base64字符串
      imageBase64 = testImage.value;
    }
    
    await performCompressionTest(imageBase64);
    
  } catch (error: any) {
    createMessage.error('测试失败: ' + error.message);
  } finally {
    testing.value = false;
  }
}

async function performCompressionTest(imageBase64: string) {
  try {
    const response = await defHttp.post({
      url: '/iot/acc/device/test-compression',
      data: {
        imageBase64: imageBase64,
        targetSizeKB: targetSizeKB.value
      }
    });
    
    if (response.success) {
      compressionResult.value = response.result;
      createMessage.success('压缩测试完成');
    } else {
      createMessage.error('测试失败: ' + response.message);
    }
  } catch (error: any) {
    createMessage.error('测试失败: ' + error.message);
  }
}
</script>

<style scoped>
.p-4 {
  padding: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
}
</style>
