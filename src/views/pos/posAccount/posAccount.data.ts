import type { BasicColumn, FormSchema } from '/@/components/Table';

export type AccountStatus = 'active' | 'suspended' | 'cancelled';
export type AccountLevel = 'vip' | 'gold' | 'silver' | 'standard';
export type AccountType = 'employee' | 'guest' | 'contractor' | 'outsourcing';

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
  userId: string;
  realName: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  department: string;
  position: string;
  idCardNo: string;
  badgeNo?: string;
  type: AccountType;
  level: AccountLevel;
  status: AccountStatus;
  registerChannel: string;
  registerTime: string;
  lastActiveTime: string;
  wallet: WalletSummary;
  limits: TransactionLimits;
  pointBalance: number;
  couponCount: number;
  autoRechargeEnabled: boolean;
  autoRechargeThreshold: number;
  autoRechargeAmount: number;
  allowMealOrder: boolean;
  allowDelivery: boolean;
  allowSelfPickup: boolean;
  bindDevices: string[];
  associatedCards: string[];
  remark?: string;
  tags?: string[];
}

export const accountStatusOptions = [
  { label: '正常', value: 'active' },
  { label: '已冻结', value: 'suspended' },
  { label: '已注销', value: 'cancelled' },
];

export const accountLevelOptions = [
  { label: '钻石会员', value: 'vip' },
  { label: '金卡会员', value: 'gold' },
  { label: '银卡会员', value: 'silver' },
  { label: '标准账户', value: 'standard' },
];

export const accountTypeOptions = [
  { label: '内部员工', value: 'employee' },
  { label: '访客', value: 'guest' },
  { label: '外包人员', value: 'outsourcing' },
  { label: '合同客户', value: 'contractor' },
];

export const posAccountColumns: BasicColumn[] = [
  {
    title: '账户编号',
    dataIndex: 'accountNo',
    width: 180,
    align: 'left',
  },
  {
    title: '用户姓名',
    dataIndex: 'realName',
    width: 120,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 140,
  },
  {
    title: '账户类型',
    dataIndex: 'type',
    width: 120,
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: '账户等级',
    dataIndex: 'level',
    width: 120,
    align: 'center',
    slots: { customRender: 'level' },
  },
  {
    title: '账户状态',
    dataIndex: 'status',
    width: 110,
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '总余额(元)',
    dataIndex: ['wallet', 'totalBalance'],
    width: 130,
    align: 'right',
    format: (row) => Number(row.wallet?.totalBalance ?? 0).toFixed(2),
  },
  {
    title: '现金钱包(元)',
    dataIndex: ['wallet', 'cashWallet'],
    width: 130,
    align: 'right',
    format: (row) => Number(row.wallet?.cashWallet ?? 0).toFixed(2),
  },
  {
    title: '补贴钱包(元)',
    dataIndex: ['wallet', 'subsidyWallet'],
    width: 130,
    align: 'right',
    format: (row) => Number(row.wallet?.subsidyWallet ?? 0).toFixed(2),
  },
  {
    title: '积分',
    dataIndex: 'pointBalance',
    width: 100,
    align: 'right',
  },
  {
    title: '优惠券',
    dataIndex: 'couponCount',
    width: 90,
    align: 'right',
  },
  {
    title: '最近活跃时间',
    dataIndex: 'lastActiveTime',
    width: 180,
  },
];

export const posAccountSearchFormSchema: FormSchema[] = [
  {
    label: '用户姓名',
    field: 'realName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '账户编号',
    field: 'accountNo',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '手机号',
    field: 'phone',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '账户状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: accountStatusOptions,
    },
  },
  {
    label: '账户类型',
    field: 'type',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: accountTypeOptions,
    },
  },
  {
    label: '账户等级',
    field: 'level',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: accountLevelOptions,
    },
  },
  {
    label: '注册时间',
    field: 'registerTimeRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
];

export const mockPosAccountList: PosAccountRecord[] = [
  {
    id: 'ACC-1001',
    accountNo: 'AC102500001',
    userId: 'U-1001',
    realName: '张伟',
    gender: 'male',
    phone: '13800000001',
    department: '研发二部',
    position: '高级前端工程师',
    idCardNo: '330102199302153211',
    badgeNo: 'RD0231',
    type: 'employee',
    level: 'vip',
    status: 'active',
    registerChannel: '企业 SSO',
    registerTime: '2023-05-18 09:15:32',
    lastActiveTime: '2025-10-07 00:45:18',
    wallet: {
      cashWallet: 856.32,
      subsidyWallet: 320.5,
      giftWallet: 60,
      frozenAmount: 0,
      creditLimit: 500,
      arrearsAmount: 0,
      totalBalance: 1236.82,
    },
    limits: {
      dailyConsumptionLimit: 800,
      singleConsumptionLimit: 200,
      dailyRechargeLimit: 2000,
      singleRechargeLimit: 1000,
    },
    pointBalance: 12650,
    couponCount: 6,
    autoRechargeEnabled: true,
    autoRechargeThreshold: 200,
    autoRechargeAmount: 500,
    allowMealOrder: true,
    allowDelivery: true,
    allowSelfPickup: true,
    bindDevices: ['POS-31001', 'POS-52011'],
    associatedCards: ['C-8888-0012', 'C-8888-1011'],
    remark: '总部核心技术骨干，享受 Platinum 账户权益',
    tags: ['高频用户', '白金权益', '餐补优先'],
  },
  {
    id: 'ACC-1002',
    accountNo: 'AC102500002',
    userId: 'U-1002',
    realName: '李婷',
    gender: 'female',
    phone: '13900000002',
    department: '市场中心',
    position: '品牌经理',
    idCardNo: '330104199506203421',
    badgeNo: 'MK0188',
    type: 'employee',
    level: 'gold',
    status: 'active',
    registerChannel: '移动端注册',
    registerTime: '2023-08-12 11:28:45',
    lastActiveTime: '2025-10-06 19:22:56',
    wallet: {
      cashWallet: 325.6,
      subsidyWallet: 190,
      giftWallet: 20,
      frozenAmount: 0,
      creditLimit: 300,
      arrearsAmount: 0,
      totalBalance: 535.6,
    },
    limits: {
      dailyConsumptionLimit: 500,
      singleConsumptionLimit: 150,
      dailyRechargeLimit: 1500,
      singleRechargeLimit: 800,
    },
    pointBalance: 8250,
    couponCount: 2,
    autoRechargeEnabled: false,
    autoRechargeThreshold: 0,
    autoRechargeAmount: 0,
    allowMealOrder: true,
    allowDelivery: true,
    allowSelfPickup: true,
    bindDevices: ['POS-73008'],
    associatedCards: ['C-8888-0015'],
    remark: '市场外出频繁，常用外送服务',
    tags: ['金卡', '高外卖频次'],
  },
  {
    id: 'ACC-1003',
    accountNo: 'AC102500003',
    userId: 'U-1003',
    realName: '王磊',
    gender: 'male',
    phone: '13700000003',
    department: '运营中心',
    position: '营运主管',
    idCardNo: '330108199104178612',
    badgeNo: 'OP0107',
    type: 'employee',
    level: 'silver',
    status: 'active',
    registerChannel: '企业 SSO',
    registerTime: '2022-11-01 08:02:18',
    lastActiveTime: '2025-10-06 18:22:49',
    wallet: {
      cashWallet: 126.8,
      subsidyWallet: 240,
      giftWallet: 0,
      frozenAmount: 0,
      creditLimit: 200,
      arrearsAmount: 0,
      totalBalance: 366.8,
    },
    limits: {
      dailyConsumptionLimit: 400,
      singleConsumptionLimit: 120,
      dailyRechargeLimit: 1000,
      singleRechargeLimit: 500,
    },
    pointBalance: 3650,
    couponCount: 1,
    autoRechargeEnabled: true,
    autoRechargeThreshold: 100,
    autoRechargeAmount: 300,
    allowMealOrder: true,
    allowDelivery: false,
    allowSelfPickup: true,
    bindDevices: ['POS-31002'],
    associatedCards: ['C-8888-0008'],
    remark: '运营值守班次，夜班餐饮权限已开通',
    tags: ['夜班', '餐补'],
  },
  {
    id: 'ACC-1004',
    accountNo: 'AC102500004',
    userId: 'U-2001',
    realName: '赵丽',
    gender: 'female',
    phone: '13600000004',
    department: '启航科技',
    position: '行政主管',
    idCardNo: '330105199012165418',
    badgeNo: 'ENT-202',
    type: 'contractor',
    level: 'vip',
    status: 'pending',
    registerChannel: '企业团餐平台导入',
    registerTime: '2024-04-26 15:05:06',
    lastActiveTime: '2025-10-05 16:32:00',
    wallet: {
      cashWallet: 0,
      subsidyWallet: 0,
      giftWallet: 0,
      frozenAmount: 0,
      creditLimit: 5000,
      arrearsAmount: 2480,
      totalBalance: -2480,
    },
    limits: {
      dailyConsumptionLimit: 5000,
      singleConsumptionLimit: 1500,
      dailyRechargeLimit: 10000,
      singleRechargeLimit: 10000,
    },
    pointBalance: 0,
    couponCount: 0,
    autoRechargeEnabled: false,
    autoRechargeThreshold: 0,
    autoRechargeAmount: 0,
    allowMealOrder: true,
    allowDelivery: true,
    allowSelfPickup: false,
    bindDevices: [],
    associatedCards: ['ENT-1008'],
    remark: '企业客户对公结算，账期内暂未回款',
    tags: ['企业客户', '账期待清'],
  },
  {
    id: 'ACC-1005',
    accountNo: 'AC102500005',
    userId: 'U-3001',
    realName: '陈晨',
    gender: 'female',
    phone: '13500000005',
    department: '嘉禾传媒',
    position: '合作导演',
    idCardNo: '330107199808084326',
    type: 'guest',
    level: 'standard',
    status: 'suspended',
    registerChannel: '线下前台登记',
    registerTime: '2024-01-15 13:48:22',
    lastActiveTime: '2025-09-01 19:40:10',
    wallet: {
      cashWallet: 12.4,
      subsidyWallet: 0,
      giftWallet: 0,
      frozenAmount: 12.4,
      creditLimit: 0,
      arrearsAmount: 0,
      totalBalance: 12.4,
    },
    limits: {
      dailyConsumptionLimit: 200,
      singleConsumptionLimit: 80,
      dailyRechargeLimit: 500,
      singleRechargeLimit: 200,
    },
    pointBalance: 120,
    couponCount: 0,
    autoRechargeEnabled: false,
    autoRechargeThreshold: 0,
    autoRechargeAmount: 0,
    allowMealOrder: false,
    allowDelivery: false,
    allowSelfPickup: true,
    bindDevices: [],
    associatedCards: ['C-8888-0019'],
    remark: '账户异常登录，暂时冻结，等待人工核验',
    tags: ['临时访客', '冻结'],
  },
];
