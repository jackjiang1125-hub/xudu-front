import { defHttp } from '/@/utils/http/axios';

export interface AccGroupVO {
  id?: string;
  groupName: string;
  periodId?: string;
  periodName?: string;
  remark?: string;
  createTime?: string;
  memberCount?: number;
  deviceCount?: number;
  members?: string[];
  devices?: string[];
}

enum Api {
  list = '/acc/accgroup/list',
  detail = '/acc/accgroup/detail',
  add = '/acc/accgroup/add',
  edit = '/acc/accgroup/edit',
  delete = '/acc/accgroup/delete',
  deleteBatch = '/acc/accgroup/deleteBatch',
}

export const listAccGroups = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getAccGroupDetail = (id: string) =>
  defHttp.get({ url: Api.detail, params: { id } }, { joinParamsToUrl: true });

export const addAccGroup = (vo: AccGroupVO) =>
  defHttp.post({ url: Api.add, params: vo });

export const editAccGroup = (vo: AccGroupVO) =>
  defHttp.put({ url: Api.edit, params: vo });

export const deleteAccGroup = (id: string) =>
  defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export const deleteBatchAccGroup = (ids: string) =>
  defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });