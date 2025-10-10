import type { BasicColumn, FormSchema } from '/@/components/Table';
import { mockParkList } from '../parkManage/parkManage.data';
import { mockAreaList } from '../parkArea/parkArea.data';

export type DeviceStatus = 'online' | 'offline' | 'maintenance';
export type ConnectionType = 'ethernet' | 'wifi' | '4g';

export interface ParkDeviceRecord {
  id: string;
  deviceCode: string;
  deviceName: string;
  parkId: string;
  parkName: string;
  areaId: string;
  areaName: string;
  vendor: string;
  model: string;
  firmwareVersion: string;
  ipAddress: string;
  connection: ConnectionType;
  installDate: string;
  lastOnline: string;
  status: DeviceStatus;
  supportPlateTypes: string[];
  remark?: string;
}

export const deviceStatusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '维护中', value: 'maintenance' },
];

export const connectionOptions = [
  { label: '有线网络', value: 'ethernet' },
  { label: '无线 Wi-Fi', value: 'wifi' },
  { label: '4G/5G 蜂窝', value: '4g' },
];

export const plateTypeOptions = [
  { label: '蓝牌', value: 'blue' },
  { label: '黄牌', value: 'yellow' },
  { label: '新能源绿牌', value: 'green' },
  { label: '武警/军牌', value: 'army' },
  { label: '货车专用', value: 'truck' },
];

export const parkOptions = mockParkList.map((item) => ({
  label: item.parkName,
  value: item.id,
}));

export const areaOptions = mockAreaList.map((item) => ({
  label: `${item.parkName} - ${item.zoneName}`,
  value: item.id,
  parkId: item.parkId,
}));

export const deviceColumns: BasicColumn[] = [
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    width: 150,
    align: 'left',
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 160,
    align: 'left',
  },
  {
    title: '所属车场',
    dataIndex: 'parkName',
    width: 200,
    align: 'left',
  },
  {
    title: '所属区域',
    dataIndex: 'areaName',
    width: 180,
    align: 'left',
  },
  {
    title: '品牌/型号',
    dataIndex: 'model',
    width: 160,
    customRender: ({ record }) => `${record.vendor} / ${record.model}`,
  },
  {
    title: '固件版本',
    dataIndex: 'firmwareVersion',
    width: 140,
  },
  {
    title: 'IP 地址',
    dataIndex: 'ipAddress',
    width: 150,
  },
  {
    title: '接入方式',
    dataIndex: 'connection',
    width: 130,
    customRender: ({ text }) => connectionOptions.find((item) => item.value === text)?.label ?? text,
  },
  {
    title: '安装日期',
    dataIndex: 'installDate',
    width: 130,
  },
  {
    title: '最后在线',
    dataIndex: 'lastOnline',
    width: 160,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    slots: { customRender: 'status' },
  },
];

export const deviceSearchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '所属车场',
    field: 'parkId',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: parkOptions,
    },
  },
  {
    label: '所属区域',
    field: 'areaId',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: areaOptions,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: deviceStatusOptions,
    },
  },
];

export const mockDeviceList: ParkDeviceRecord[] = [
  {
    id: 'PD-3001',
    deviceCode: 'CAM-HZ-001',
    deviceName: 'A1入口车牌识别一号',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    areaId: 'PA-2001',
    areaName: 'A1 访客区',
    vendor: '海康威视',
    model: 'DS-LPR700',
    firmwareVersion: 'v3.2.5',
    ipAddress: '10.16.1.21',
    connection: 'ethernet',
    installDate: '2024-03-12',
    lastOnline: '2025-10-08 09:42:15',
    status: 'online',
    supportPlateTypes: ['blue', 'green'],
    remark: '入口主通道，开启无感支付模式。',
  },
  {
    id: 'PD-3002',
    deviceCode: 'CAM-HZ-002',
    deviceName: 'A2出口车牌识别二号',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    areaId: 'PA-2002',
    areaName: 'A2 员工区',
    vendor: '宇视科技',
    model: 'LPR-X200',
    firmwareVersion: 'v2.9.1',
    ipAddress: '10.16.2.15',
    connection: 'ethernet',
    installDate: '2023-12-08',
    lastOnline: '2025-10-08 08:56:03',
    status: 'online',
    supportPlateTypes: ['blue', 'yellow', 'green'],
  },
  {
    id: 'PD-3003',
    deviceCode: 'CAM-HZ-003',
    deviceName: '充电区入口识别',
    parkId: 'PK-1002',
    parkName: 'CBD 国际中心地下车库',
    areaId: 'PA-2003',
    areaName: 'C1 充电专区',
    vendor: '大华股份',
    model: 'DH-LPR510',
    firmwareVersion: 'v1.8.4',
    ipAddress: '10.18.3.42',
    connection: 'wifi',
    installDate: '2024-07-18',
    lastOnline: '2025-10-07 23:15:02',
    status: 'maintenance',
    supportPlateTypes: ['green'],
    remark: '设备固件升级维护中，预计 10 月底完成。',
  },
  {
    id: 'PD-3004',
    deviceCode: 'CAM-HZ-004',
    deviceName: '货车卸货区入口',
    parkId: 'PK-1004',
    parkName: '未来科技城示范停车场',
    areaId: 'PA-2004',
    areaName: 'B1 货车卸货区',
    vendor: '海康威视',
    model: 'DS-LPR880',
    firmwareVersion: 'v4.0.2',
    ipAddress: '10.22.1.11',
    connection: 'ethernet',
    installDate: '2023-09-01',
    lastOnline: '2025-10-08 09:20:44',
    status: 'online',
    supportPlateTypes: ['truck', 'blue'],
  },
  {
    id: 'PD-3005',
    deviceCode: 'CAM-HZ-005',
    deviceName: '临时停车场出口',
    parkId: 'PK-1005',
    parkName: '云谷路临时停车场',
    areaId: 'PA-2001',
    areaName: 'A1 访客区',
    vendor: '宇视科技',
    model: 'LPR-X200',
    firmwareVersion: 'v2.6.0',
    ipAddress: '10.26.2.31',
    connection: '4g',
    installDate: '2024-05-05',
    lastOnline: '2025-09-28 17:31:55',
    status: 'offline',
    supportPlateTypes: ['blue', 'yellow'],
  },
];

export function formatDeviceStatus(status: DeviceStatus) {
  return deviceStatusOptions.find((item) => item.value === status)?.label ?? status;
}
