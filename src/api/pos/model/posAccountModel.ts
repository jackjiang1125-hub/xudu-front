export type AccountStatus = 'active' | 'suspended' | 'cancelled';
export type AccountLevel = 'vip' | 'gold' | 'silver' | 'standard';
export type AccountType = 'employee' | 'guest' | 'contractor' | 'outsourcing';

export type TransactionDirection = 'income' | 'expense';

export type TransactionType =
  | 'recharge'
  | 'consumption'
  | 'refund'
  | 'subsidy'
  | 'adjustment'
  | 'freeze'
  | 'unfreeze';

export interface WalletSummary {
  cashWallet: number;
  subsidyWallet: number;
  giftWallet: number;
  frozenAmount: number;
  creditLimit: number;
  arrearsAmount: number;
  totalBalance: number;
}

export interface TransactionLimits {
  dailyConsumptionLimit: number;
  singleConsumptionLimit: number;
  dailyRechargeLimit: number;
  singleRechargeLimit: number;
}

export interface PosAccountRecord {
  id: string;
  accountNo: string;
  userId?: string;
  userName?: string;
  realName: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  position?: string;
  idCardNo?: string;
  badgeNo?: string;
  accountType: AccountType;
  accountLevel: AccountLevel;
  accountStatus: AccountStatus;
  registerChannel?: string;
  registerTime?: string;
  lastActiveTime?: string;
  wallet?: WalletSummary;
  limits?: TransactionLimits;
  autoRechargeEnabled?: boolean;
  autoRechargeThreshold?: number;
  autoRechargeAmount?: number;
  allowMealOrder?: boolean;
  allowDelivery?: boolean;
  allowSelfPickup?: boolean;
  bindDevices?: string[];
  associatedCards?: string[];
  remark?: string;
  tags?: string[];
  lossReported?: boolean;
  lastLossReportTime?: string;
  lastPasswordResetTime?: string;
  lastCardReissueTime?: string;
}

export interface AccountTransactionRecord {
  id: string;
  accountId: string;
  accountNo?: string;
  transactionNo: string;
  occurTime: string;
  bizType: TransactionType;
  direction: TransactionDirection;
  walletType?: string;
  amount: number;
  balanceAfter: number;
  channel?: string;
  bizNo?: string;
  remark?: string;
}

export interface PosAccountTodaySummary {
  totalCount: number;
  rechargeAmount: number;
  rechargeCount: number;
  refundAmount: number;
  refundCount: number;
  expenseAmount: number;
  expenseCount: number;
}

export interface PosAccountListParams {
  pageNo?: number;
  pageSize?: number;
  accountNo?: string;
  realName?: string;
  phone?: string;
  accountStatus?: AccountStatus;
  accountType?: AccountType;
  accountLevel?: AccountLevel;
  deptIds?: string;
  registerTimeStart?: string;
  registerTimeEnd?: string;
}

export interface PosAccountTransactionParams {
  accountId: string;
  pageNo?: number;
  pageSize?: number;
  bizType?: TransactionType;
  direction?: TransactionDirection;
  occurTimeStart?: string;
  occurTimeEnd?: string;
  keyword?: string;
  showAll?: boolean;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface PosAccountRechargeRequest {
  accountId: string;
  walletType: string;
  amount: number;
  channel?: string;
  referenceNo?: string;
  remark?: string;
}

export interface PosAccountRefundRequest extends PosAccountRechargeRequest {
  originalBizNo: string;
}

export interface PosAccountProfileUpdateRequest {
  accountId: string;
  realName: string;
  phone: string;
  gender?: string;
  deptId?: string;
  departmentName?: string;
  position?: string;
  accountStatus?: AccountStatus;
  remark?: string;
  tags?: string[];
}

export interface PosAccountStatusChangeRequest {
  accountId: string;
  targetStatus: AccountStatus;
  reason?: string;
}

export interface PosAccountSimpleOperateRequest {
  accountId: string;
  remark?: string;
}

export interface SysDepartModel {
  id: string;
  parentId?: string;
  departName: string;
}
