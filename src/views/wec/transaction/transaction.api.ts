import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/consumeRecord/list',
  delete = '/wec/consumeRecord/delete',
  deleteBatch = '/wec/consumeRecord/deleteBatch',
  exportXls = '/wec/consumeRecord/exportXls',
  importExcel = '/wec/consumeRecord/importExcel',
}

export const listTransactions = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const deleteTransaction = (params: { id: string }) => defHttp.delete({ url: Api.delete, params });
export const batchDeleteTransaction = (params: { ids: string }) => defHttp.delete({ url: Api.deleteBatch, params });

export type TransactionModel = {
  id?: string;
  tradeNo?: string;
  cardNo?: string;
  userId?: string;
  userName?: string;
  deviceId?: string;
  deviceName?: string;
  amount?: number;
  balance?: number;
  type?: string;
  status?: string;
  consumeTime?: string;
  recordNo?: number;
  createTime?: string;
};
