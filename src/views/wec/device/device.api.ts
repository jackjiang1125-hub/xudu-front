import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/device/list',
  add = '/wec/device/add',
  edit = '/wec/device/edit',
  delete = '/wec/device/delete',
  start = '/wec/device/control/start',
  stop = '/wec/device/control/stop',
  restart = '/wec/device/control/restart',
  factoryReset = '/wec/device/control/factoryReset',
  syncTime = '/wec/device/control/syncTime',
  enableBlacklist = '/wec/device/control/enableBlacklist',
  enableWhitelist = '/wec/device/control/enableWhitelist',
  getNamelistMode = '/wec/device/control/getNamelistMode',
  searchPending = '/wec/device/searchPending',
}

export const listWecDevices = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addWecDevice = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editWecDevice = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteWecDevice = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export const startDevice = (sns: string[]) => defHttp.post({ url: Api.start, params: { sns } });
export const stopDevice = (sns: string[]) => defHttp.post({ url: Api.stop, params: { sns } });
export const restartDevice = (sns: string[]) => defHttp.post({ url: Api.restart, params: { sns } });
export const factoryResetDevice = (sns: string[]) => defHttp.post({ url: Api.factoryReset, params: { sns } });
export const syncDeviceTime = (sns: string[]) => defHttp.post({ url: Api.syncTime, params: { sns } });
export const enableBlacklist = (sns: string[]) => defHttp.post({ url: Api.enableBlacklist, params: { sns } });
export const enableWhitelist = (sns: string[]) => defHttp.post({ url: Api.enableWhitelist, params: { sns } });
export const getNamelistMode = (sns: string[]) => defHttp.post({ url: Api.getNamelistMode, params: { sns } });

export const searchPendingDevices = (keyword?: string) => defHttp.get({ url: Api.searchPending, params: { keyword } });

export type WecDeviceModel = {
  id?: string;
  deviceName?: string;
  deviceType?: string;
  sn?: string;
  uniqueId?: string;
  installLocation?: string;
  rateTemplateId?: string;
  online?: number | boolean;
  status?: string;
};
