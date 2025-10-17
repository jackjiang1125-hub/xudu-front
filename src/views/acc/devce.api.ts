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
  addBySn = '/acc/device/addBySn',
  authorize = '/acc/device/authorize',
  getBySn = '/acc/device/getBySn',
  delete = '/acc/device/delete',
  deleteBatch = '/acc/device/deleteBatch',
}

export const listDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getDeviceDetail = (params: Record<string, any>) =>
  defHttp.get({ url: Api.detail, params });

export const listAuthDevices = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.listAuthDevice, params });

export const addDeviceBySn = (data: { sn: string; deviceName?: string; ipAddress?: string }) =>
  defHttp.post({ url: Api.addBySn, data });

export const authorizeAccDevice = (data: { sn: string; registryCode?: string; remark?: string }) =>
  defHttp.post({ url: Api.authorize, data });

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
