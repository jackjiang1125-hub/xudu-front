import { defHttp } from '/@/utils/http/axios';

enum Api {
  status = '/wec/monitor/deviceStatus',
  alarms = '/wec/monitor/alarms',
  start = '/wec/device/control/start',
  stop = '/wec/device/control/stop',
  restart = '/wec/device/control/restart',
  usage = '/wec/device/usageStats',
  refreshUsage = '/wec/device/refreshUsage',
}

export const listDeviceStatus = (params?: Record<string, any>) => defHttp.get({ url: Api.status, params });
export const listDeviceUsage = (params?: Record<string, any>) => defHttp.get({ url: Api.usage, params });
export const refreshUsage = () => defHttp.post({ url: Api.refreshUsage });
export const listAlarms = (params?: Record<string, any>) => defHttp.get({ url: Api.alarms, params });
export const startDevice = (sns: string[]) => defHttp.post({ url: Api.start, params: { sns } });
export const stopDevice = (sns: string[]) => defHttp.post({ url: Api.stop, params: { sns } });
export const restartDevice = (sns: string[]) => defHttp.post({ url: Api.restart, params: { sns } });
