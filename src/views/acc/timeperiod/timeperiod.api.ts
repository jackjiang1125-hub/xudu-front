import { defHttp } from '/@/utils/http/axios';

export interface TimeInterval {
  start: string;
  end: string;
}

export interface TimePeriodDetailVO {
  key: string;
  label: string;
  segments: TimeInterval[];
}

export interface TimePeriodVO {
  id?: string;
  name: string;
  remark?: string;
  updatedAt?: string;
  creator?: string;
  detail?: TimePeriodDetailVO[];
}

enum Api {
  list = '/acc/timeperiod/list',
  detail = '/acc/timeperiod/detail',
  add = '/acc/timeperiod/add',
  edit = '/acc/timeperiod/edit',
  delete = '/acc/timeperiod/delete',
  deleteBatch = '/acc/timeperiod/deleteBatch',
}

export const listTimePeriods = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getTimePeriodDetail = (id: string) =>
  defHttp.get({ url: Api.detail, params: { id } }, { joinParamsToUrl: true });

export const addTimePeriod = (vo: TimePeriodVO) =>
  defHttp.post({ url: Api.add, params: vo });

export const editTimePeriod = (vo: TimePeriodVO) =>
  defHttp.put({ url: Api.edit, params: vo });

export const deleteTimePeriod = (id: string) =>
  defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export const deleteBatchTimePeriod = (ids: string) =>
  defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });