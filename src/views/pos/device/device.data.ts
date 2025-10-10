import type { BasicColumn, FormSchema } from '/@/components/Table';

export type PosDeviceStatus = 'online' | 'offline';

export interface PosDeviceItem {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: string;
  serialNo: string;
  bindStore: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  hardwareVersion: string;
  networkType: string;
  heartbeatInterval: number;
  onlineStatus: PosDeviceStatus;
  lastOnlineAt: string;
  lastSyncAt: string;
  remark?: string;
}

export const deviceStatusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
];

export const deviceTypeOptions = [
  { label: '台式消费机', value: 'desktop' },
  { label: '手持消费机', value: 'handheld' },
  { label: '自助收银机', value: 'self-service' },
  { label: '挂墙终端', value: 'wall-mounted' },
];

export const deviceColumns: BasicColumn[] = [
  {
    title: '终端编号',
    dataIndex: 'deviceCode',
    width: 140,
    align: 'left',
  },
  {
    title: '终端名称',
    dataIndex: 'deviceName',
    width: 160,
    align: 'left',
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 140,
  },
  {
    title: '序列号',
    dataIndex: 'serialNo',
    width: 160,
    align: 'left',
  },
  {
    title: '所属门店',
    dataIndex: 'bindStore',
    width: 150,
    align: 'left',
  },
  {
    title: '部署位置',
    dataIndex: 'location',
    width: 180,
    align: 'left',
  },
  {
    title: '网络类型',
    dataIndex: 'networkType',
    width: 120,
  },
  {
    title: '固件版本',
    dataIndex: 'firmwareVersion',
    width: 140,
  },
  {
    title: '在线状态',
    dataIndex: 'onlineStatus',
    width: 110,
    align: 'center',
    slots: { customRender: 'onlineStatus' },
  },
  {
    title: '最近在线时间',
    dataIndex: 'lastOnlineAt',
    width: 180,
  },
  {
    title: '上次同步时间',
    dataIndex: 'lastSyncAt',
    width: 180,
  },
];

export const deviceSearchFormSchema: FormSchema[] = [
  {
    label: '终端名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '终端编号',
    field: 'deviceCode',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '设备类型',
    field: 'deviceType',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: deviceTypeOptions,
    },
  },
  {
    label: '在线状态',
    field: 'onlineStatus',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: deviceStatusOptions,
    },
  },
  {
    label: '所属门店',
    field: 'bindStore',
    component: 'Input',
    colProps: { span: 6 },
  },
];

export const mockDeviceList: PosDeviceItem[] = [
  {
    id: 'D-1001',
    deviceCode: 'POS-31001',
    deviceName: '总部大堂收银台A',
    deviceType: 'desktop',
    serialNo: 'SN-DK-983475',
    bindStore: '总部旗舰店',
    location: '一楼主出入口左侧',
    ipAddress: '10.16.12.31',
    macAddress: '54-3A-98-BC-22-11',
    firmwareVersion: 'v3.8.2',
    hardwareVersion: 'Board-A1',
    networkType: '有线',
    heartbeatInterval: 30,
    onlineStatus: 'online',
    lastOnlineAt: '2025-10-07 00:58:12',
    lastSyncAt: '2025-10-07 00:59:54',
    remark: '绑定商品分类为饮料/零食',
  },
  {
    id: 'D-1002',
    deviceCode: 'POS-31002',
    deviceName: '总部大堂收银台B',
    deviceType: 'desktop',
    serialNo: 'SN-DK-983476',
    bindStore: '总部旗舰店',
    location: '一楼主出入口右侧',
    ipAddress: '10.16.12.32',
    macAddress: '54-3A-98-BC-22-12',
    firmwareVersion: 'v3.8.2',
    hardwareVersion: 'Board-A1',
    networkType: '有线',
    heartbeatInterval: 30,
    onlineStatus: 'online',
    lastOnlineAt: '2025-10-07 00:58:28',
    lastSyncAt: '2025-10-07 00:59:12',
  },
  {
    id: 'D-1003',
    deviceCode: 'POS-52011',
    deviceName: '移动手持终端-1号',
    deviceType: 'handheld',
    serialNo: 'SN-HH-218364',
    bindStore: '总部旗舰店',
    location: '流动备餐区',
    ipAddress: '10.16.22.21',
    macAddress: '58-9C-11-BC-10-02',
    firmwareVersion: 'v2.5.0',
    hardwareVersion: 'Handheld-V2',
    networkType: '双频Wi-Fi',
    heartbeatInterval: 45,
    onlineStatus: 'offline',
    lastOnlineAt: '2025-10-06 22:12:02',
    lastSyncAt: '2025-10-06 22:00:11',
    remark: '备用终端，电池需及时充电',
  },
  {
    id: 'D-1004',
    deviceCode: 'POS-73008',
    deviceName: '二楼自助结算机',
    deviceType: 'self-service',
    serialNo: 'SN-SS-883264',
    bindStore: '总部旗舰店',
    location: '二楼自助餐厅入口处',
    ipAddress: '10.16.33.90',
    macAddress: '3C-FA-5B-77-20-88',
    firmwareVersion: 'v4.0.1',
    hardwareVersion: 'SelfService-X',
    networkType: '千兆有线',
    heartbeatInterval: 20,
    onlineStatus: 'online',
    lastOnlineAt: '2025-10-07 00:57:46',
    lastSyncAt: '2025-10-07 00:57:46',
  },
  {
    id: 'D-1005',
    deviceCode: 'POS-43005',
    deviceName: '写字楼A座挂墙终端',
    deviceType: 'wall-mounted',
    serialNo: 'SN-WM-562341',
    bindStore: 'CBD写字楼体验店',
    location: '写字楼A座19F茶水间',
    ipAddress: '10.81.12.55',
    macAddress: '12-BA-6F-92-11-30',
    firmwareVersion: 'v3.6.0',
    hardwareVersion: 'WallMount-2024',
    networkType: '4G/以太网双模',
    heartbeatInterval: 60,
    onlineStatus: 'online',
    lastOnlineAt: '2025-10-06 23:56:47',
    lastSyncAt: '2025-10-06 23:48:33',
  },
  {
    id: 'D-1006',
    deviceCode: 'POS-53019',
    deviceName: '移动手持终端-2号',
    deviceType: 'handheld',
    serialNo: 'SN-HH-218401',
    bindStore: 'CBD写字楼体验店',
    location: '会议室外场服务',
    ipAddress: '10.81.22.61',
    macAddress: '58-9C-11-BC-10-03',
    firmwareVersion: 'v2.5.0',
    hardwareVersion: 'Handheld-V2',
    networkType: '5G',
    heartbeatInterval: 45,
    onlineStatus: 'offline',
    lastOnlineAt: '2025-10-05 18:23:02',
    lastSyncAt: '2025-10-05 18:23:02',
    remark: '设备巡检中，待完成升级',
  },
];
