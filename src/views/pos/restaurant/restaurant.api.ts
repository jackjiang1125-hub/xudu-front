import { defHttp } from '/@/utils/http/axios';
enum Api {
  list = '/pos/restaurant/list',
  add = '/pos/restaurant/add',
  edit = '/pos/restaurant/edit',
  delete = '/pos/restaurant/delete',
  deleteBatch = '/pos/restaurant/deleteBatch',
  getById = '/pos/restaurant/getById',
}

export const listRestaurants = (params?: any) => defHttp.get({ url: Api.list, params });
export const addRestaurant = (params: any) => defHttp.post({ url: Api.add, params });
export const editRestaurant = (params: any) => defHttp.put({ url: Api.edit, params });
export const deleteRestaurant = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });
// 使用joinParamsToUrl确保IDs正确拼接到URL中
export const deleteBatchRestaurants = (ids: string) => defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });
export const getRestaurantById = (id: string) => defHttp.get({ url: Api.getById, params: { id } });