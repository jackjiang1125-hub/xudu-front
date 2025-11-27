import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/user/list',
  add = '/wec/user/add',
  edit = '/wec/user/edit',
  delete = '/wec/user/delete',
  import = '/wec/user/import',
}

export const listUsers = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addUser = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editUser = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteUser = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });
export const importUsers = (params: Record<string, any>) => defHttp.post({ url: Api.import, params });

export type WecUserModel = {
  id?: string;
  realName?: string;
  userType?: string;
  cardNo?: string;
  fingerprintNo?: string;
  balance?: number;
  whitelist?: string;
  blacklist?: string;
  status?: string;
};
