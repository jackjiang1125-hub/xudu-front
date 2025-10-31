import { defHttp } from '/@/utils/http/axios';

enum Api {
  list   = '/acc/transaction/list',
  add    = '/acc/transaction/add',
  edit   = '/acc/transaction/edit',
  delete = '/acc/transaction/delete',
}

export const listTransactions = (params) => defHttp.get({ url: Api.list, params });
export const addTransaction   = (params) => defHttp.post({ url: Api.add, params });
export const editTransaction  = (params) => defHttp.put({  url: Api.edit, params });
export const deleteTransaction = (id)    => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });