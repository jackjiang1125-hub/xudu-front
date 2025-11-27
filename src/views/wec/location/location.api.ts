import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/location/list',
  add = '/wec/location/add',
  edit = '/wec/location/edit',
  delete = '/wec/location/delete',
}

export const listLocations = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addLocation = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editLocation = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteLocation = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export type LocationModel = { id?: string; locationName?: string; roomId?: string; remark?: string };
