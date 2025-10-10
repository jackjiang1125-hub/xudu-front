<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleExportXls" preIcon="ant-design:download-outlined">
          导出
        </a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!-- 详情弹窗 -->
    <BasicModal @register="registerModal" :title="modalTitle" :width="1000">
      <div class="detail-content">
        <a-row :gutter="16">
          <a-col :span="14">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="设备序列号">{{ detailData.sn }}</a-descriptions-item>
              <a-descriptions-item label="记录时间">{{ formatDateTime(detailData.logTime) }}</a-descriptions-item>
              <a-descriptions-item label="用户PIN">{{ detailData.pin }}</a-descriptions-item>
              <a-descriptions-item label="卡号">{{ detailData.cardNo }}</a-descriptions-item>
              <a-descriptions-item label="事件地址">{{ detailData.eventAddr }}</a-descriptions-item>
              <a-descriptions-item label="事件代码">{{ detailData.eventCode }}</a-descriptions-item>
              <a-descriptions-item label="进出状态">
                <a-tag :color="detailData.inoutStatus === 1 ? 'green' : 'orange'">
                  {{ detailData.inoutStatus === 1 ? '进' : '出' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="验证方式">{{ getVerifyMethodText(detailData.verifyType) }}</a-descriptions-item>
              <a-descriptions-item label="记录索引">{{ detailData.recordIndex }}</a-descriptions-item>
              <a-descriptions-item label="客户端IP">{{ detailData.clientIp }}</a-descriptions-item>
              <a-descriptions-item label="创建时间" :span="2">{{ formatDateTime(detailData.createTime) }}</a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :span="10">
            <div class="photo-section">
              <h4 style="margin-bottom: 16px;">抓拍照片</h4>
              <div v-if="photoLoading" class="photo-loading">
                <a-spin size="large" />
                <p style="margin-top: 8px;">正在加载照片...</p>
              </div>
              <div v-else-if="photoData && photoData.photoPath" class="photo-container">
                <img 
                  :src="photoData.photoPath"
                  :alt="`抓拍照片 - ${photoData.pin}`"
                  class="capture-photo"
                  @error="handleImageError"
                />
                <div class="photo-info">
                  <p><strong>照片名称:</strong> {{ photoData.photoName }}</p>
                  <p><strong>文件大小:</strong> {{ formatFileSize(photoData.fileSize) }}</p>
                  <p><strong>上传时间:</strong> {{ formatDateTime(photoData.uploadedTime) }}</p>
                </div>
              </div>
              <div v-else class="no-photo">
                <a-empty description="未找到对应的抓拍照片" />
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" name="rtlog-index" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { columns, searchFormSchema } from './rtlog.data';
  import { listRtLogs, findPhotoByLogTime } from './rtlog.api';
  import { downloadByOnlineUrl } from '/@/utils/common/renderUtils';

  const checkedKeys = ref<Array<string | number>>([]);
  
  // 弹窗相关
  const [registerModal, { openModal, closeModal }] = useModal();
  const modalTitle = ref('记录详情');
  const detailData = ref<any>({});
  const photoData = ref<any>(null);
  const photoLoading = ref(false);
  
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '门禁设备实时记录',
      api: listRtLogs,
      columns,
      canResize: false,
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToNumber: [],
        fieldMapToTime: [
          ['logTime', ['logTime_begin', 'logTime_end'], 'YYYY-MM-DD HH:mm:ss'],
        ],
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
      beforeFetch: (params) => {
        return Object.assign(params);
      },
    },
    exportConfig: {
      name: '门禁设备实时记录列表',
      url: '/iot/accDeviceRtLog/exportXls',
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  // 高级查询及批量操作
  const getTableAction = (record) => {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  };

  /**
   * 详情
   */
  async function handleDetail(record: Recordable) {
    detailData.value = { ...record };
    modalTitle.value = `记录详情 - ${record.sn}`;
    photoData.value = null;
    
    // 查找匹配的抓拍照片
    if (record.sn && record.logTime) {
      photoLoading.value = true;
      try {
        const logTimeStr = formatLogTimeForApi(record.logTime);
        const result = await findPhotoByLogTime(record.sn, logTimeStr);
        if (result) {
          photoData.value = result;
        }
      } catch (error) {
        console.warn('获取抓拍照片失败:', error);
      } finally {
        photoLoading.value = false;
      }
    }
    
    openModal();
  }

  /**
   * 获取验证方式文本
   */
  function getVerifyMethodText(method: number | string) {
    const methodMap = {
      1: '密码',
      2: '卡片',
      3: '密码+卡片',
      4: '指纹',
      5: '指纹+密码',
      6: '指纹+卡片',
      7: '指纹+密码+卡片',
      8: '人脸',
      9: '人脸+密码',
      10: '人脸+卡片',
      11: '人脸+密码+卡片',
      15: '人脸',
      200: '其他'
    };
    return methodMap[method] || method || '未知';
  }

  /**
   * 格式化日期时间
   */
  function formatDateTime(dateTime: string | Date) {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('zh-CN');
  }

  /**
   * 格式化日期时间用于API调用
   */
  function formatLogTimeForApi(dateTime: string | Date) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 格式化文件大小
   */
  function formatFileSize(size: number) {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let fileSize = size;
    while (fileSize >= 1024 && index < units.length - 1) {
      fileSize /= 1024;
      index++;
    }
    return `${fileSize.toFixed(1)} ${units[index]}`;
  }

  /**
   * 处理图片加载错误
   */
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPg==';
  }

  /**
   * 导出excel
   */
  function handleExportXls() {
    onExportXls('门禁设备实时记录列表', listRtLogs);
  }
</script>

<style scoped>
.detail-content {
  padding: 16px;
}

.detail-content :deep(.ant-descriptions-item-label) {
  font-weight: 600;
  color: #262626;
  width: 120px;
}

.detail-content :deep(.ant-descriptions-item-content) {
  color: #595959;
}

.photo-section {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.photo-loading {
  text-align: center;
  padding: 40px 0;
}

.photo-container {
  text-align: center;
}

.capture-photo {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.photo-info {
  text-align: left;
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.photo-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.no-photo {
  padding: 40px 0;
  text-align: center;
}
</style>
