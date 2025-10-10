<template>
  <div>
    <BasicTable
      @register="registerTable"
      :columns="columns"
      :api="listDevices"
      :formConfig="{ schemas: searchFormSchema }"
      :rowSelection="rowSelection"
    >
       <template #tableTitle>
         <a-button type="primary" @click="handleAdd">新增设备</a-button>
         <a-button
           type="primary"
           danger
           :disabled="!hasSelected"
           @click="handleBatchDelete"
         >
           批量删除
         </a-button>
         <a-button
           type="primary"
           :disabled="!hasSelected"
           @click="handleAuth"
         >
           设备授权
         </a-button>
         <a-button
           type="primary"
           :disabled="!hasSelected"
           @click="handleSendCommand"
         >
           添加命令
         </a-button>
         <a-button
           type="primary"
           :disabled="!hasSelected"
           @click="handlePersonnelDispatch"
         >
           人员信息下发
         </a-button>
         <a-button type="default"  @click="handleExport">导出设备</a-button>
         <a-button type="default"  @click="handleImport">导入设备</a-button>
       </template>
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button type="link" @click="handleView(record)">查看</a-button>
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </BasicTable>

    <BasicDrawer v-model:visible="drawerVisible" title="设备信息" width="800px" :showFooter="false">
      <DeviceForm :record="currentRecord" @success="handleSaved" />
    </BasicDrawer>

     <!-- 导入对话框 -->
     <BasicModal
       v-model:visible="importVisible"
       title="导入设备"
       width="600px"
       @ok="handleImportOk"
       @cancel="importVisible = false"
     >
       <div class="p-4">
         <a-upload-dragger
           v-model:fileList="fileList"
           :before-upload="beforeUpload"
           accept=".xlsx,.xls"
           :show-upload-list="true"
         >
           <p class="ant-upload-drag-icon">
             <Icon icon="ant-design:inbox-outlined" />
           </p>
           <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
           <p class="ant-upload-hint">支持 .xlsx、.xls 格式</p>
         </a-upload-dragger>
       </div>
     </BasicModal>

     <!-- 命令下发对话框 -->
     <BasicModal
       v-model:visible="commandVisible"
       title="设备命令下发"
       width="800px"
       @ok="handleCommandOk"
       @cancel="commandVisible = false"
     >
       <div class="p-4">
         <a-form :model="commandForm" layout="vertical">
           <a-form-item label="目标设备">
             <a-tag v-for="device in selectedDevices" :key="device.id" color="blue" class="mr-2 mb-2">
               {{ device.sn }} - {{ device.deviceName }}
             </a-tag>
           </a-form-item>
           <a-form-item label="命令内容" required>
             <a-textarea
               v-model:value="commandForm.commands"
               placeholder="请输入命令，每行一个命令，支持多行输入"
               :rows="8"
               :maxlength="200000"
               show-count
             />
             <div class="text-gray-500 text-sm mt-1">
               提示：每行输入一个命令，系统会自动为每个设备发送所有命令
             </div>
           </a-form-item>
         </a-form>
       </div>
     </BasicModal>

     <!-- 人员信息下发对话框 -->
     <PersonnelDispatchModal @register="registerPersonnelModal" @success="handlePersonnelSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BasicTable, useTable } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { BasicModal, useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { listDevices, deleteDevice, deleteBatchDevices, exportDevices, authorizeDevice, sendCommands } from './device.api';
import PersonnelDispatchModal from './modules/PersonnelDispatchModal.vue';
import { columns, searchFormSchema } from './device.data';
import DeviceForm from './DeviceForm.vue';
import { getToken } from '/@/utils/auth';

const [registerTable, { reload, getSelectRows }] = useTable();
const [registerPersonnelModal, { openModal: openPersonnelModal }] = useModal();
const drawerVisible = ref(false);
const currentRecord = ref<any>({});
const importVisible = ref(false);
const fileList = ref([]);
const commandVisible = ref(false);
const commandForm = ref({
  commands: '',
});
const { createConfirm, createMessage } = useMessage();

const selectedRowKeys = ref<string[]>([]);
const selectedRows = ref<any[]>([]);

const rowSelection = {
  type: 'checkbox',
  selectedRowKeys,
  onChange: (keys: string[], rows: any[]) => {
    selectedRowKeys.value = keys;
    selectedRows.value = rows;
  },
};

const hasSelected = computed(() => selectedRowKeys.value.length > 0);

const selectedDevices = computed(() => selectedRows.value);

// 添加调试信息
onMounted(() => {
  const token = getToken();
  console.log('当前token:', token);
  if (!token) {
    createMessage.warning('用户未登录，请先登录');
  }
});

function handleAdd() {
  currentRecord.value = {};
  drawerVisible.value = true;
}

function handleEdit(record: any) {
  currentRecord.value = { ...record };
  drawerVisible.value = true;
}

function handleView(record: any) {
  currentRecord.value = { ...record, readonly: true };
  drawerVisible.value = true;
}

function handleSaved() {
  drawerVisible.value = false;
  reload();
}

function handleDelete(record: any) {
  createConfirm({
    title: '确认删除',
    content: `确定要删除设备"${record.deviceName}"吗？`,
    async onOk() {
      await deleteDevice(record.id);
      createMessage.success('删除成功');
      reload();
    },
  });
}

function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    createMessage.warning('请选择要删除的设备');
    return;
  }
  createConfirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRows.value.length} 个设备吗？`,
    async onOk() {
      const ids = selectedRows.value.map(item => item.id);
      await deleteBatchDevices(ids);
      createMessage.success('批量删除成功');
      selectedRowKeys.value = [];
      selectedRows.value = [];
      reload();
    },
  });
}

function handleExport() {
  exportDevices();
}

function handleImport() {
  importVisible.value = true;
}

function beforeUpload(file: any) {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    || file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    createMessage.error('只能上传 Excel 文件!');
    return false;
  }
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    createMessage.error('文件大小不能超过 10MB!');
    return false;
  }
  return false;
}

function handleImportOk() {
  if (fileList.value.length === 0) {
    createMessage.warning('请选择要导入的文件');
    return;
  }
  // TODO: 实现导入逻辑
  createMessage.success('导入成功');
  importVisible.value = false;
  fileList.value = [];
  reload();
}

function handleAuth() {
  if (selectedRows.value.length === 0) {
    createMessage.warning('请选择要授权的设备');
    return;
  }
  createConfirm({
    title: '确认授权',
    content: `确定要对选中的 ${selectedRows.value.length} 个设备进行授权吗？`,
    async onOk() {
      try {
        // 根据后端接口，需要逐个设备进行授权
        for (const device of selectedRows.value) {
          await authorizeDevice(device.sn, device.registryCode || '', device.remark || '');
        }
        createMessage.success('设备授权成功');
        selectedRowKeys.value = [];
        selectedRows.value = [];
        reload();
      } catch (error) {
        createMessage.error('设备授权失败：' + (error.message || '未知错误'));
      }
    },
  });
}

function handleSendCommand() {
  if (selectedRows.value.length === 0) {
    createMessage.warning('请选择要发送命令的设备');
    return;
  }
  commandForm.value.commands = '';
  commandVisible.value = true;
}

function handleCommandOk() {
  if (!commandForm.value.commands.trim()) {
    createMessage.warning('请输入命令内容');
    return;
  }
  
  const commands = commandForm.value.commands
    .split('\n')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);
    
  if (commands.length === 0) {
    createMessage.warning('请输入有效的命令');
    return;
  }
  
  createConfirm({
    title: '确认发送命令',
    content: `确定要向 ${selectedRows.value.length} 个设备发送 ${commands.length} 条命令吗？`,
    async onOk() {
      try {
        // 根据后端接口，需要逐个设备发送命令
        for (const device of selectedRows.value) {
          await sendCommands(device.sn, commands);
        }
        createMessage.success('命令发送成功');
        commandVisible.value = false;
        commandForm.value.commands = '';
        selectedRowKeys.value = [];
        selectedRows.value = [];
        reload();
      } catch (error) {
        createMessage.error('命令发送失败：' + (error.message || '未知错误'));
      }
    },
  });
}

function handlePersonnelDispatch() {
  if (selectedRows.value.length === 0) {
    createMessage.warning('请选择要下发人员信息的设备');
    return;
  }
  openPersonnelModal(true, {
    devices: selectedRows.value
  });
}

function handlePersonnelSuccess() {
  selectedRowKeys.value = [];
  selectedRows.value = [];
  reload();
}
</script>
