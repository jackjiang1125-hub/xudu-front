import { defHttp } from '/@/utils/http/axios';

export interface AccDeviceModel {
  id?: string;
  sn?: string;
  deviceType?: string;
  deviceName?: string;
  online?: boolean;
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
  isReset?: boolean;
}

enum Api {
  list = '/acc/device/list',
  detail = '/acc/device/detail',
  listAuthDevice = '/acc/device/listAuthDevice',
  addBySn = '/acc/device/addBySn',
  add = '/acc/device/add',
  authorize = '/acc/device/authorize',
  getBySn = '/acc/device/getBySn',
  delete = '/acc/device/delete',
  deleteBatch = '/acc/device/deleteBatch',
  syncTime = '/acc/device/syncTime',
}

export const listDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getDeviceDetail = (params: Record<string, any>) =>
  defHttp.get({ url: Api.detail, params });

export const listAuthDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.listAuthDevice, params });

// 添加设备（支持扩展字段）
export const addDeviceBySn = (data: {
  sn: string;
  deviceName?: string;
  ipAddress?: string;
  resetRequired?: boolean;
  extras?: Record<string, any>;
}) => defHttp.post({ url: Api.addBySn, data });

// 直接保存门禁设备（符合 AccDeviceVO）
export const addAccDevice = (vo: Partial<AccDeviceModel>) =>
  defHttp.post({ url: Api.add, data: vo });

// 授权设备（支持扩展字段）
export const authorizeAccDevice = (data: {
  sn: string;
  registryCode?: string;
  remark?: string;
  deviceName?: string;
  ipAddress?: string;
  resetRequired?: boolean;
  extras?: Record<string, any>;
}) => defHttp.post({ url: Api.authorize, data });

export const getAccDeviceBySn = (params: { sn: string }) =>
  defHttp
    .get<AccDeviceModel | null>({ url: Api.getBySn, params }, { errorMessageMode: 'none' })
    .catch(() => null);

export const deleteAccDevice = (id: string) =>
  defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export const deleteBatchAccDevice = (ids: string[]) =>
  defHttp.delete(
    { url: Api.deleteBatch, params: { ids: ids.join(',') } },
    { joinParamsToUrl: true }
  );

// 批量同步设备时间
export const syncAccDeviceTime = (data: { sns: string[]; timestamp?: number }) =>
  defHttp.post({ url: Api.syncTime, data });
