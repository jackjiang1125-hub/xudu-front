<template>
  <div class="p-4">
    <h2>人脸抠图测试页面</h2>
    
    <div class="mb-4">
      <h3>测试图片输入</h3>
      <a-tabs v-model:activeKey="inputType" @change="handleInputTypeChange">
        <a-tab-pane key="upload" tab="上传图片">
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
        </a-tab-pane>
        <a-tab-pane key="url" tab="图片URL">
          <a-input
            v-model:value="imageUrl"
            placeholder="请输入图片URL，例如: https://example.com/image.jpg"
            @change="handleUrlChange"
          />
          <div class="mt-2">
            <strong>当前URL:</strong> {{ imageUrl ? '已输入' : '未输入' }}
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    
    <div class="mb-4">
      <h3>抠图设置</h3>
      <a-form layout="inline">
        <a-form-item label="扩展边距(像素)">
          <a-input-number v-model:value="padding" :min="0" :max="100" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="extractFace" :loading="extracting">
            开始抠图
          </a-button>
        </a-form-item>
      </a-form>
    </div>
    
    <div v-if="extractionResult" class="mb-4">
      <h3>抠图结果</h3>
      <div class="result-info">
        <p><strong>原始图片大小:</strong> {{ formatBytes(extractionResult.originalSize) }}</p>
        <p><strong>检测到人脸数量:</strong> {{ extractionResult.faceCount }}</p>
        <p><strong>人脸图片大小:</strong> {{ formatBytes(extractionResult.faceImageSize) }}</p>
        <p><strong>压缩率:</strong> {{ calculateCompressionRatio() }}%</p>
      </div>
    </div>
    
    <div v-if="extractionResult && extractionResult.faceImageBase64" class="mb-4">
      <h3>抠出的人脸图片</h3>
      <div class="face-image-container">
        <img 
          :src="extractionResult.faceImageBase64" 
          alt="抠出的人脸" 
          class="face-image"
        />
      </div>
    </div>
    
    <div v-if="errorMessage" class="mb-4">
      <a-alert :message="errorMessage" type="error" show-icon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { JImageUpload } from '/@/components/Form';
import { useMessage } from '/@/hooks/web/useMessage';
import { defHttp } from '/@/utils/http/axios';

const { createMessage } = useMessage();

const inputType = ref<string>('upload');
const testImage = ref<string>('');
const imageUrl = ref<string>('');
const padding = ref<number>(20);
const extracting = ref<boolean>(false);
const extractionResult = ref<any>(null);
const errorMessage = ref<string>('');

function handleInputTypeChange() {
  // 切换输入类型时清除结果
  extractionResult.value = null;
  errorMessage.value = '';
}

function handleImageChange(value: string) {
  console.log('图片变化:', value);
  testImage.value = value;
  // 清除之前的结果
  extractionResult.value = null;
  errorMessage.value = '';
}

function handleUrlChange() {
  console.log('URL变化:', imageUrl.value);
  // 清除之前的结果
  extractionResult.value = null;
  errorMessage.value = '';
}

async function extractFace() {
  // 检查输入
  if (inputType.value === 'upload' && !testImage.value) {
    createMessage.error('请先选择测试图片');
    return;
  }
  if (inputType.value === 'url' && !imageUrl.value) {
    createMessage.error('请输入图片URL');
    return;
  }
  
  extracting.value = true;
  extractionResult.value = null;
  errorMessage.value = '';
  
  try {
    console.log('当前输入类型:', inputType.value);
    console.log('imageUrl值:', imageUrl.value);
    console.log('testImage值:', testImage.value ? '有值' : '无值');
    
    if (inputType.value === 'url') {
      // URL方式，直接传给后端
      console.log('使用URL模式，调用performFaceExtractionWithUrl');
      await performFaceExtractionWithUrl(imageUrl.value);
    } else {
      // 上传方式
      console.log('使用上传模式');
      
      // 判断testImage是URL还是base64
      if (testImage.value.startsWith('http://') || testImage.value.startsWith('https://')) {
        // 如果是URL（JImageUpload上传后返回的URL）
        console.log('上传后返回的是URL，使用URL模式:', testImage.value);
        await performFaceExtractionWithUrl(testImage.value);
      } else if (testImage.value.startsWith('data:image/')) {
        // 如果是data URL，提取base64部分
        console.log('是data URL，提取base64部分');
        const imageBase64 = testImage.value.split(',')[1];
        await performFaceExtractionWithBase64(imageBase64);
      } else {
        // 假设是纯base64字符串
        console.log('是纯base64字符串，直接使用');
        await performFaceExtractionWithBase64(testImage.value);
      }
    }
    
  } catch (error: any) {
    errorMessage.value = '抠图失败: ' + error.message;
    createMessage.error('抠图失败: ' + error.message);
  } finally {
    extracting.value = false;
  }
}

async function performFaceExtractionWithUrl(imageUrl: string) {
  try {
    console.log('URL模式 - 发送参数:', {
      imageUrl: imageUrl,
      padding: padding.value
    });
    
    const response = await defHttp.post({
      url: '/iot/acc/device/extract-face',
      data: {
        imageUrl: imageUrl,
        padding: padding.value
      }
    });
    console.log("jwz.....");
    console.log(response);
    
    if (response) {
      extractionResult.value = response;
      createMessage.success('人脸抠图完成');
    } else {
      errorMessage.value = '抠图失败: ' + response.message;
      createMessage.error('抠图失败: ' + response.message);
    }
  } catch (error: any) {
    errorMessage.value = '抠图失败: ' + error.message;
    createMessage.error('抠图失败: ' + error.message);
  }
}

async function performFaceExtractionWithBase64(imageBase64: string) {
  try {
    console.log('Base64模式 - 发送参数:', {
      imageBase64: imageBase64.substring(0, 50) + '...', // 只显示前50个字符
      padding: padding.value
    });
    
    const response = await defHttp.post({
      url: '/iot/acc/device/extract-face',
      data: {
        imageBase64: imageBase64,
        padding: padding.value
      }
    });
    
    if (response.success) {
      extractionResult.value = response.result;
      createMessage.success('人脸抠图完成');
    } else {
      errorMessage.value = '抠图失败: ' + response.message;
      createMessage.error('抠图失败: ' + response.message);
    }
  } catch (error: any) {
    errorMessage.value = '抠图失败: ' + error.message;
    createMessage.error('抠图失败: ' + error.message);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateCompressionRatio(): number {
  if (!extractionResult.value) return 0;
  const original = extractionResult.value.originalSize;
  const face = extractionResult.value.faceImageSize;
  return Math.round((1 - face / original) * 100);
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

.result-info {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.result-info p {
  margin: 0.5rem 0;
}

.face-image-container {
  text-align: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.face-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
