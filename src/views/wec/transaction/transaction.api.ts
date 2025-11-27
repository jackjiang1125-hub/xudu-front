import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/transaction/list',
  refund = '/wec/transaction/refund',
}

export const listTransactions = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const refundTransaction = (id: string) => defHttp.post({ url: Api.refund, params: { id } });

export type TransactionModel = {
  id?: string;
  tradeNo?: string;
  userName?: string;
  deviceName?: string;
  amount?: number;
  time?: string | number;
  type?: string;
  status?: string;
};
