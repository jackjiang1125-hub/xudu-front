import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/user/list',
  add = '/wec/user/add',
  edit = '/wec/user/edit',
  delete = '/wec/user/delete',
  deleteBatch = '/wec/user/deleteBatch',
  import = '/wec/user/importExcel',
  export = '/wec/user/exportXls',
  statistics = '/wec/user/statistics',
  addFromSystem = '/wec/user/addFromSystem',
}

export const listUsers = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addUser = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editUser = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteUser = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });
export const deleteBatch = (ids: string) => defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });
export const importUsers = (params: Record<string, any>) => defHttp.post({ url: Api.import, params });
export const getStatistics = () => defHttp.get({ url: Api.statistics });
export const addFromSystem = (params: { userIds: string[], userType: string }) => defHttp.post({ url: Api.addFromSystem, params });

export type WecUserModel = {
  id?: string;
  realName?: string;
  workNo?: string;
  cardNo?: string;
  userType?: string;
  balance?: number;
  status?: string;
  remark?: string;
};
