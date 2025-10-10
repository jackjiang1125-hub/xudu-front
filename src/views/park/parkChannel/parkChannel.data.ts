import type { BasicColumn, FormSchema } from '/@/components/Table';
import { mockParkList } from '../parkManage/parkManage.data';
import { mockAreaList } from '../parkArea/parkArea.data';
import { mockDeviceList } from '../parkDevice/parkDevice.data';

export type ChannelDirection = 'entry' | 'exit' | 'both';
export type ChannelStatus = 'enabled' | 'disabled' | 'maintenance';

export interface ParkChannelRecord {
  id: string;
  channelCode: string;
  channelName: string;
  parkId: string;
  parkName: string;
  areaId: string;
  areaName: string;
  direction: ChannelDirection;
  bindDeviceIds: string[];
  bindDeviceNames: string[];
  allowVehicle: string[];
  status: ChannelStatus;
  remark?: string;
}

export const channelDirectionOptions = [
  { label: '入口', value: 'entry' },
  { label: '出口', value: 'exit' },
  { label: '出入口双向', value: 'both' },
];

export const channelStatusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
  { label: '维护中', value: 'maintenance' },
];

export const channelVehicleOptions = [
  { label: '小型车', value: 'car' },
  { label: '新能源车', value: 'ev' },
  { label: '摩托车', value: 'motorcycle' },
  { label: '货车', value: 'truck' },
];

export const parkOptionList = mockParkList.map((item) => ({
  label: item.parkName,
  value: item.id,
}));

export const areaOptionList = mockAreaList.map((item) => ({
  label: `${item.parkName} - ${item.zoneName}`,
  value: item.id,
  parkId: item.parkId,
  zoneName: item.zoneName,
}));

export const deviceOptionList = mockDeviceList.map((item) => ({
  label: `${item.deviceName} (${item.ipAddress})`,
  value: item.id,
  parkId: item.parkId,
  areaId: item.areaId,
}));

export const channelColumns: BasicColumn[] = [
  {
    title: '通道编号',
    dataIndex: 'channelCode',
    width: 150,
    align: 'left',
  },
  {
    title: '通道名称',
    dataIndex: 'channelName',
    width: 160,
  },
  {
    title: '所属车场',
    dataIndex: 'parkName',
    width: 200,
    align: 'left',
  },
  {
    title: '关联区域',
    dataIndex: 'areaName',
    width: 180,
    align: 'left',
  },
  {
    title: '通行方向',
    dataIndex: 'direction',
    width: 120,
    customRender: ({ text }) => channelDirectionOptions.find((item) => item.value === text)?.label ?? text,
  },
  {
    title: '绑定设备',
    dataIndex: 'bindDeviceNames',
    width: 200,
    customRender: ({ text }) => (Array.isArray(text) ? text.join('、') : text),
  },
  {
    title: '支持车型',
    dataIndex: 'allowVehicle',
    width: 160,
    customRender: ({ text }) =>
      Array.isArray(text)
        ? text
            .map((item: string) => channelVehicleOptions.find((opt) => opt.value === item)?.label ?? item)
            .join(' / ')
        : '',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    slots: { customRender: 'status' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    ellipsis: true,
  },
];

export const channelSearchFormSchema: FormSchema[] = [
  {
    label: '通道名称',
    field: 'channelName',
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
      options: parkOptionList,
    },
  },
  {
    label: '关联区域',
    field: 'areaId',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: areaOptionList,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: channelStatusOptions,
    },
  },
];

export const mockChannelList: ParkChannelRecord[] = [
  {
    id: 'PC-4001',
    channelCode: 'CH-A1-IN',
    channelName: 'A1 区访客入口',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    areaId: 'PA-2001',
    areaName: 'A1 访客区',
    direction: 'entry',
    bindDeviceIds: ['PD-3001'],
    bindDeviceNames: ['A1入口车牌识别一号'],
    allowVehicle: ['car', 'ev'],
    status: 'enabled',
    remark: '支持无感进场，关联 LED 提示屏。',
  },
  {
    id: 'PC-4002',
    channelCode: 'CH-A2-OUT',
    channelName: 'A2 员工出口',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    areaId: 'PA-2002',
    areaName: 'A2 员工区',
    direction: 'exit',
    bindDeviceIds: ['PD-3002'],
    bindDeviceNames: ['A2出口车牌识别二号'],
    allowVehicle: ['car'],
    status: 'enabled',
  },
  {
    id: 'PC-4003',
    channelCode: 'CH-C1-IO',
    channelName: '充电区入口/出口',
    parkId: 'PK-1002',
    parkName: 'CBD 国际中心地下车库',
    areaId: 'PA-2003',
    areaName: 'C1 充电专区',
    direction: 'both',
    bindDeviceIds: ['PD-3003'],
    bindDeviceNames: ['充电区入口识别'],
    allowVehicle: ['ev'],
    status: 'maintenance',
    remark: '维护期间仅允许固定车辆通行。',
  },
  {
    id: 'PC-4004',
    channelCode: 'CH-B1-IN',
    channelName: '货车卸货入口',
    parkId: 'PK-1004',
    parkName: '未来科技城示范停车场',
    areaId: 'PA-2004',
    areaName: 'B1 货车卸货区',
    direction: 'entry',
    bindDeviceIds: ['PD-3004'],
    bindDeviceNames: ['货车卸货区入口'],
    allowVehicle: ['truck'],
    status: 'enabled',
  },
];

export function formatChannelStatus(status: ChannelStatus) {
  return channelStatusOptions.find((item) => item.value === status)?.label ?? status;
}
