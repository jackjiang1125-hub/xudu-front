import { defHttp } from '/@/utils/http/axios';

export interface AccDeviceModel {
  id?: string;
  sn?: string;
  deviceType?: string;
  deviceName?: string;
  firmwareVersion?: string;
  pushVersion?: string;
  lockCount?: number;
  readerCount?: number;
  machineType?: number;
  ipAddress?: string;
  gatewayIp?: string;
  netMask?: string;
  lastRegistryTime?: string;
  lastHeartbeatTime?: string;
  authorized?: number;
  registryCode?: string;
  remark?: string;
}

enum Api {
  list = '/acc/device/list',
  detail = '/acc/device/detail',
  listAuthDevice = '/acc/device/listAuthDevice',
}

export const listDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getDeviceDetail = (params: Record<string, any>) =>
  defHttp.get({ url: Api.detail, params });

export const listAuthDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.listAuthDevice, params });
