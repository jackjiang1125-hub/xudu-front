import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '设备序列号',
    dataIndex: 'sn',
    width: 150,
    fixed: 'left',
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 150,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 120,
    customRender: ({ text }) => render.renderDict(text, 'device_type'),
  },
  {
    title: 'IP地址',
    dataIndex: 'ipAddress',
    width: 120,
  },
  {
    title: '最后心跳时间',
    dataIndex: 'lastHeartbeatTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
  {
    title: '设备状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      // 直接显示状态文本，如果字典不存在则显示原始值
      if (!text) return h('span', '-');
      
      // 设备状态映射 - 在线/离线
      const statusMap = {
        'ONLINE': { text: '在线', color: '#52c41a' },
        'OFFLINE': { text: '离线', color: '#ff4d4f' },
        '1': { text: '在线', color: '#52c41a' },
        '0': { text: '离线', color: '#ff4d4f' },
        true: { text: '在线', color: '#52c41a' },
        false: { text: '离线', color: '#ff4d4f' }
      };
      
      const statusInfo = statusMap[text] || { text: text, color: '#666' };
      return h('span', { style: { color: statusInfo.color, fontWeight: 'bold' } }, statusInfo.text);
    },
  },
  {
    title: '授权状态',
    dataIndex: 'authorized',
    width: 100,
    customRender: ({ text }) => {
      // 处理布尔值显示
      const isAuthorized = text === true || text === 'true' || text === 1 || text === '1';
      const authText = isAuthorized ? '已授权' : '未授权';
      const authColor = isAuthorized ? '#52c41a' : '#ff4d4f';
      return h('span', { style: { color: authColor, fontWeight: 'bold' } }, authText);
    },
  },
  {
    title: '注册码',
    dataIndex: 'registryCode',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'sn',
    label: '设备序列号',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入设备序列号',
    },
  },
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入设备名称',
    },
  },
  {
    field: 'deviceType',
    label: '设备类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'device_type',
      placeholder: '请选择设备类型',
    },
  },
  {
    field: 'ipAddress',
    label: 'IP地址',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入IP地址',
    },
  },
  {
    field: 'status',
    label: '设备状态',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'device_status',
      placeholder: '请选择设备状态',
    },
  },
  {
    field: 'authorized',
    label: '授权状态',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yes_no',
      placeholder: '请选择授权状态',
    },
  },
  {
    field: 'createTime',
    label: '创建时间',
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择创建时间',
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'sn',
    label: '设备序列号',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入设备序列号',
    },
    rules: [
      {
        required: true,
        message: '请输入设备序列号',
      },
    ],
  },
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入设备名称',
    },
    rules: [
      {
        required: true,
        message: '请输入设备名称',
      },
    ],
  },
  {
    field: 'deviceType',
    label: '设备类型',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'device_type',
      placeholder: '请选择设备类型',
    },
    rules: [
      {
        required: true,
        message: '请选择设备类型',
      },
    ],
  },
  {
    field: 'ipAddress',
    label: 'IP地址',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入IP地址',
    },
  },
  {
    field: 'gatewayIp',
    label: '网关IP',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入网关IP',
    },
  },
  {
    field: 'netMask',
    label: '子网掩码',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入子网掩码',
    },
  },
  {
    field: 'lockCount',
    label: '锁数量',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: '请输入锁数量',
    },
  },
  {
    field: 'readerCount',
    label: '读头数量',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: '请输入读头数量',
    },
  },
  {
    field: 'machineType',
    label: '机器类型',
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: '请输入机器类型',
    },
  },
  {
    field: 'authorized',
    label: '授权状态',
    component: 'JSwitch',
    defaultValue: false,
    componentProps: {
      options: [false, true],
      labelOptions: ['未授权', '已授权'],
    },
  },
  {
    field: 'registryCode',
    label: '注册码',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入注册码',
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入备注信息',
      rows: 4,
    },
  },
];
