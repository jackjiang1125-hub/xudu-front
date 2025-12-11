import { defHttp } from '/@/utils/http/axios';
import type {
  PosAccountRecord,
  PosAccountListParams,
  PageResult,
  AccountTransactionRecord,
  PosAccountTransactionParams,
  PosAccountTodaySummary,
  PosAccountRechargeRequest,
  PosAccountRefundRequest,
  PosAccountProfileUpdateRequest,
  PosAccountStatusChangeRequest,
  PosAccountSimpleOperateRequest,
  SysDepartModel,
} from './model/posAccountModel';

enum Api {
  AccountList = '/pos/account/list',
  AccountDetail = '/pos/account/detail',
  Transactions = '/pos/account/transactions',
  TodaySummary = '/pos/account/todaySummary',
  Recharge = '/pos/account/recharge',
  Refund = '/pos/account/refund',
  Profile = '/pos/account/profile',
  Status = '/pos/account/status',
  Loss = '/pos/account/loss',
  PayPasswordReset = '/pos/account/payPassword/reset',
  CardReissue = '/pos/account/card/reissue',
  Departments = '/sys/api/getAllSysDepart',
}

export const getPosAccountList = (params: PosAccountListParams) =>
  defHttp.get<PageResult<PosAccountRecord>>({
    url: Api.AccountList,
    params,
  });

export const getPosAccountDetail = (accountId: string) =>
  defHttp.get<PosAccountRecord>({
    url: Api.AccountDetail,
    params: { accountId },
  });

export const getPosAccountTransactions = (params: PosAccountTransactionParams) =>
  defHttp.get<PageResult<AccountTransactionRecord>>({
    url: Api.Transactions,
    params,
  });

export const getPosAccountTodaySummary = (accountId: string, date?: string) =>
  defHttp.get<PosAccountTodaySummary>({
    url: Api.TodaySummary,
    params: {
      accountId,
      date,
    },
  });

export const rechargeAccount = (data: PosAccountRechargeRequest) =>
  defHttp.post({
    url: Api.Recharge,
    data,
  });

export const refundAccount = (data: PosAccountRefundRequest) =>
  defHttp.post({
    url: Api.Refund,
    data,
  });

export const updateAccountProfile = (data: PosAccountProfileUpdateRequest) =>
  defHttp.put({
    url: Api.Profile,
    data,
  });

export const changeAccountStatus = (data: PosAccountStatusChangeRequest) =>
  defHttp.post({
    url: Api.Status,
    data,
  });

export const reportLoss = (data: PosAccountSimpleOperateRequest) =>
  defHttp.post({
    url: Api.Loss,
    data,
  });

export const resetPayPassword = (data: PosAccountSimpleOperateRequest) =>
  defHttp.post({
    url: Api.PayPasswordReset,
    data,
  });

export const reissueCard = (data: PosAccountSimpleOperateRequest) =>
  defHttp.post({
    url: Api.CardReissue,
    data,
  });

// 部门接口在当前项目返回的是裸数组（无 code/result 包裹），因此关闭默认的 transform 并兜底取数组
export const getSysDepartments = () =>
  defHttp
    .get<SysDepartModel[] | { result?: SysDepartModel[]; data?: SysDepartModel[] }>({
      url: Api.Departments,
    }, { isTransformResponse: false })
    .then((res) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray((res as any)?.result)) return (res as any).result;
      if (Array.isArray((res as any)?.data)) return (res as any).data;
      return [];
    });
