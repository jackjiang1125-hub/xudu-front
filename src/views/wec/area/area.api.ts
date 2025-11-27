import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/area/list',
  add = '/wec/area/add',
  edit = '/wec/area/edit',
  delete = '/wec/area/delete',
}

export const listAreas = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addArea = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editArea = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteArea = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export type AreaModel = { id?: string; areaName?: string; areaCode?: string; parentId?: string };
