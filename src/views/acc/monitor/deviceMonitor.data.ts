import type { BasicColumn } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export type DeviceStatus = 'online' | 'offline' | 'disabled';

export interface DoorDevice {
  id: string;
  name: string;
  location: string;
  sn: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  snapshot?: string;
}

export interface EventRecord {
  id: string;
  type?: string;
  verifyType?: number;
  eventCode?: string;
  inoutStatus?: number;
  person: string;
  time: string;
  deviceName: string;
  deviceSn: string;
  result: string;
  extra?: FaceProfile;
}

export interface FaceProfile {
  avatar: string;
  name: string;
  department: string;
  credential?: string;
}

export const deviceStatusMeta: Record<DeviceStatus, { label: string; color: string; description: string }> = {
  online: { label: '在线', color: '#52c41a', description: '设备在线，支持远程控制' },
  offline: { label: '离线', color: '#f5222d', description: '连接中断，请检查网络与电源' },
  disabled: { label: '禁用', color: '#faad14', description: '设备被管理员禁用' },
};
// 真实数据由接口加载，移除本地假数据

export const eventColumns: BasicColumn[] = [
  {
    title: '验证方式',
    dataIndex: 'verifyType',
    width: 120,
    customRender: ({ text }) => render.renderDict(text, 'acc_verify_type'),
  },
  {
    title: '事件类型',
    dataIndex: 'eventCode',
    width: 100,
    customRender: ({ text }) => render.renderDict(text, 'acc_event_type'),
  },
  {
    title: '进出状态',
    dataIndex: 'inoutStatus',
    width: 100,
    customRender: ({ text }) => render.renderDict(text, 'acc_inout_status'),
  },
  {
    title: '人员/操作者',
    dataIndex: 'person',
    width: 180,
  },
  {
    title: '时间',
    dataIndex: 'time',
    width: 180,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 180,
  },
  {
    title: '设备SN',
    dataIndex: 'deviceSn',
    width: 140,
  },
];

export const actionDefinitions = [
  { key: 'open', label: '远程开门', statusAllow: ['online'] },
  { key: 'close', label: '远程关门', statusAllow: ['online'] },
  { key: 'cancelAlarm', label: '取消报警', statusAllow: ['online'] },
  { key: 'holdOpen', label: '远程常开', statusAllow: ['online'] },
  { key: 'lock', label: '远程锁定', statusAllow: ['online'] },
  { key: 'unlock', label: '远程解锁', statusAllow: ['online'] },
  { key: 'enableTodayAlwaysOpen', label: '启动当天常开时间段', statusAllow: ['online'] },
  { key: 'disableTodayAlwaysOpen', label: '禁用当天常开时间段', statusAllow: ['online'] },
  // { key: 'fetch', label: '拉取近期日志', statusAllow: ['online', 'offline', 'disabled'] },
];