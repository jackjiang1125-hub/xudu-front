import { defHttp } from '/@/utils/http/axios';

enum Api {
  heartbeats = '/wec/system/heartbeats',
  logs = '/wec/system/logs',
  syncTime = '/wec/device/control/syncTime',
}

export const listHeartbeats = (params?: Record<string, any>) => defHttp.get({ url: Api.heartbeats, params });
export const listCommLogs = (params?: Record<string, any>) => defHttp.get({ url: Api.logs, params });
export const syncDeviceTime = (sns: string[]) => defHttp.post({ url: Api.syncTime, params: { sns } });
