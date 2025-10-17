import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import type { DescItem } from '/@/components/Description';

export const authorizedOptions = [
  { label: '全部', value: '' },
  { label: '已授权', value: 1 },
  { label: '未授权', value: 0 },
];

export const columns: BasicColumn[] = [
  {
    title: '设备序列号',
    dataIndex: 'sn',
    width: 160,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 160,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 120,
  },
  {
    title: '固件版本',
    dataIndex: 'firmwareVersion',
    width: 140,
  },
  {
    title: '推送协议版本',
    dataIndex: 'pushVersion',
    width: 140,
  },
  {
    title: 'IPv4地址',
    dataIndex: 'ipAddress',
    width: 140,
  },
  {
    title: '最后心跳时间',
    dataIndex: 'lastHeartbeatTime',
    width: 180,
  },
  {
    title: '授权状态',
    dataIndex: 'authorized',
    width: 100,
    align: 'center',
    slots: { customRender: 'authorized' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '设备序列号',
    field: 'sn',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '授权状态',
    field: 'authorized',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: authorizedOptions.slice(1),
      placeholder: '请选择授权状态',
    },
  },
];

export const detailSchema: DescItem[] = [
  { field: 'sn', label: '设备序列号' },
  { field: 'deviceName', label: '设备名称' },
  { field: 'deviceType', label: '设备类型' },
  { field: 'firmwareVersion', label: '固件版本' },
  { field: 'pushVersion', label: '推送协议版本' },
  { field: 'lockCount', label: '支持的锁数量' },
  { field: 'readerCount', label: '支持的读头数量' },
  { field: 'machineType', label: '机器类型标识' },
  { field: 'ipAddress', label: 'IPv4地址' },
  { field: 'gatewayIp', label: '网关IPv4地址' },
  { field: 'netMask', label: '子网掩码' },
  { field: 'lastRegistryTime', label: '最后注册时间' },
  { field: 'lastHeartbeatTime', label: '最后心跳时间' },
  { field: 'authorized', label: '授权状态' },
  { field: 'registryCode', label: '注册码' },
  { field: 'remark', label: '备注' },
];