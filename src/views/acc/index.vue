<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleOpenSearch">
        搜索设备
      </a-button>
      <a-button danger style="margin-left:8px;" :disabled="selectedRowKeys.length === 0" @click="confirmDelete">
        删除设备
      </a-button>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined" :loading="syncingTime">
          控制
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="setTime">同步时间</a-menu-item>
            <!-- <a-menu-item key="setTimezone">启动</a-menu-item>
            <a-menu-item key="setRegistrar">禁用</a-menu-item> -->
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined">
          设备操作
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="setVerification">设置后台验证参数</a-menu-item>
            <a-menu-item key="setTimezone">设置设备时区</a-menu-item>
            <!-- <a-menu-item key="setRegistrar">设置登记机</a-menu-item>
            <a-menu-item key="setBioThreshold">修改生物识别阈值</a-menu-item>
            <a-menu-item key="setExtendedParams">设置扩展参数</a-menu-item>
            <a-menu-item key="setNtp">NTP服务器设置</a-menu-item>
            <a-menu-item key="replaceDevice">替换设备</a-menu-item>
            <a-menu-item key="setFaceBackend">设置人脸后台比对参数</a-menu-item> -->
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined">
          查看与获取
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <!-- <a-menu-item key="setVerification">获取设备参数</a-menu-item>
            <a-menu-item key="setTimezone">获取人员信息</a-menu-item>
            <a-menu-item key="setRegistrar">获取事件记录</a-menu-item>
            <a-menu-item key="setBioThreshold">查看设备中门禁规则</a-menu-item> -->
            <a-menu-item key="setExtendedParams">查询设备容量</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <!-- <a-dropdown trigger="['click']" placement="bottomLeft">
        <a-button type="primary" style="margin-left:8px;" preIcon="ant-design:setting-outlined">
          通讯
        </a-button>
        <template #overlay>
          <a-menu @click="onOperationSelect">
            <a-menu-item key="setVerification">修改ip地址</a-menu-item>
            <a-menu-item key="setTimezone">切换网络连接</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown> -->
    </template>
    <template #onlineStatus="{ record }">
      <Icon
        :icon="isOnline(record) ? 'ant-design:check-circle-filled' : 'ant-design:close-circle-filled'"
        :color="isOnline(record) ? '#52c41a' : '#ff4d4f'"
        :size="16"
      />
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableActions(record)" />
    </template>
  </BasicTable>
  <DeviceForm @register="registerDetail" />
  <SearchDeviceForm @register="registerSearch" @authorize="handleAuthorize" />
  <!-- 新增：设备授权确认弹窗 -->
  <AuthorizeDeviceModal @register="registerAuthorize" @success="reload" />
  <!-- 新增：后台验证参数配置弹窗 -->
  <BackendVerificationModal @register="registerVerification" @success="reload" />
  <CapacityModal @register="registerCapacity" />
</template>

<script lang="ts" setup>
  import { BasicTable, TableAction } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref } from 'vue';
  import DeviceForm from './deviceform.vue';
  import SearchDeviceForm from './searchDeviceForm.vue';
  import AuthorizeDeviceModal from './authorizeDeviceModal.vue';
  import { columns, searchFormSchema } from './device.data';
  import { listDevices, type AccDeviceModel, deleteBatchAccDevice, syncAccDeviceTime } from './devce.api';
  import dayjs from 'dayjs';
  import BackendVerificationModal from './backendVerificationModal.vue';
  import CapacityModal from './capacityModal.vue';

  const { createMessage, createConfirm } = useMessage();

  const [registerDetail, { openModal: openDetail }] = useModal();
  const [registerSearch, { openModal: openSearch }] = useModal();
  // 新增：授权确认弹窗 modal 控制器
  const [registerAuthorize, { openModal: openAuthorize }] = useModal();
  // 新增：后台验证参数弹窗 modal 控制器
  const [registerVerification, { openModal: openVerification }] = useModal();
  const [registerCapacity, { openModal: openCapacity }] = useModal();

  const { tableContext } = useListPage({
    designScope: 'acc-device',
    tableProps: {
      api: listDevices,
      rowKey: 'id',
      columns,
      actionColumn: {
        width: 120,
        fixed: 'right',
        title: '操作',
      },
      rowSelection: {
        type: 'checkbox',
        preserveSelectedRowKeys: true,
        onChange: (keys: (string | number)[]) => {
          selectedRowKeys.value = (keys || []).map(String);
        },
      },
      formConfig: {
        labelWidth: 120,
        schemas: searchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
      },
    },
  });
  const [registerTable, { reload, getSelectRows }] = tableContext;

  function isOnline(record: Partial<AccDeviceModel> & { lastHeartbeatTime?: any }) {
    if (!record) return false;
    if (record.online !== undefined && record.online !== null) return !!record.online;
    const t = (record as any).lastHeartbeatTime;
    if (!t) return false;
    const now = dayjs();
    const hb = dayjs(t);
    return now.diff(hb, 'second') <= 10;
  }

  function handleOpenSearch() {
    openSearch(true);
  }

  function formatAuthorizedText(value: unknown) {
    if (value === 1 || value === '1' || value === true) {
      return '已授权';
    }
    if (value === 0 || value === '0' || value === false) {
      return '未授权';
    }
    return value ?? '未知';
  }

  function handleDetail(record: AccDeviceModel) {
    openDetail(true, {
      id: record?.id,
      sn: record?.sn,
      record,
    });
  }

  // 修改：点击授权不直接调用接口，弹出确认弹窗
  async function handleAuthorize(record: AccDeviceModel) {
    openAuthorize(true, { record });
  }

  function getTableActions(record: AccDeviceModel): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  const selectedRowKeys = ref<string[]>([]);
  const syncingTime = ref<boolean>(false);
  function confirmDelete() {
    if (selectedRowKeys.value.length === 0) return;
    createConfirm({
      title: '删除设备',
      content: `确认删除所选 ${selectedRowKeys.value.length} 台设备？`,
      iconType: 'warning',
      onOk: handleBatchDelete,
    });
  }

  async function handleBatchDelete() {
    try {
      await deleteBatchAccDevice(selectedRowKeys.value);
      createMessage.success('删除成功');
      selectedRowKeys.value = [];
      reload();
    } catch (e) {
      console.error(e);
      createMessage.error('删除失败，请稍后重试');
    }
  }
  async function onOperationSelect({ key }) {
    if (!selectedRowKeys || selectedRowKeys.value.length === 0) {
      createMessage.warning('请选择设备');
      return;
    }
    const ids = selectedRowKeys.value.join(',');
    switch (key) {
      case 'setTime': {
        const rows = getSelectRows?.() || [];
        const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
        if (sns.length === 0) {
          createMessage.warning('所选设备缺少序列号，无法同步时间');
          return;
        }
        try {
          syncingTime.value = true;
          const res: any = await syncAccDeviceTime({ sns });
          const total = res?.total ?? sns.length;
          const success = res?.success ?? total;
          const failedList: string[] = res?.failed ?? [];
          if (failedList.length > 0) {
            createMessage.error(`同步时间失败 ${failedList.length} 台：${failedList.join(',')}`);
          }
          createMessage.success(`已触发同步时间，成功 ${success}/${total}`);
        } catch (e) {
          console.error(e);
          createMessage.error('同步时间失败，请稍后重试');
        } finally {
          syncingTime.value = false;
        }
        break;
      }
      case 'setVerification': {
        const rows = getSelectRows?.() || [];
        const sns: string[] = rows.map((r: any) => r?.sn).filter((sn: any) => !!sn);
        if (sns.length === 0) {
          createMessage.warning('所选设备缺少序列号，无法设置后台验证参数');
          return;
        }
        openVerification(true, { sns });
        break;
      }
      case 'setTimezone':
        createMessage.info('设置设备时区：' + ids);
        break;
      case 'setRegistrar':
        createMessage.info('设置登记机：' + ids);
        break;
      case 'setBioThreshold':
        createMessage.info('修改生物识别阈值：' + ids);
        break;
      case 'setExtendedParams': {
        const rows = getSelectRows?.() || [];
        if (rows.length === 0) {
          createMessage.warning('请选择设备');
          break;
        }
        openCapacity(true, { records: rows });
        break;
      }
      case 'setNtp':
        createMessage.info('NTP服务器设置：' + ids);
        break;
      case 'replaceDevice':
        createMessage.info('替换设备：' + ids);
        break;
      case 'setFaceBackend':
        createMessage.info('设置人脸后台比对参数：' + ids);
        break;
      default:
        break;
    }
  }
</script>
