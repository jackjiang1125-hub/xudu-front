// posAccount.data.ts
import type { BasicColumn, FormSchema } from '/@/components/Table';
import type { TreeItem } from '/@/components/Tree';
import type {
  AccountLevel,
  AccountStatus,
  AccountType,
  TransactionDirection,
  TransactionType,
} from '/@/api/pos/model/posAccountModel';

export const accountStatusOptions: { label: string; value: AccountStatus }[] = [
  { label: '正常', value: 'active' },
  { label: '已冻结', value: 'suspended' },
  { label: '已注销', value: 'cancelled' },
];

export const accountLevelOptions: { label: string; value: AccountLevel }[] = [
  { label: '钻石会员', value: 'vip' },
  { label: '金卡会员', value: 'gold' },
  { label: '银卡会员', value: 'silver' },
  { label: '标准账户', value: 'standard' },
];

export const accountTypeOptions: { label: string; value: AccountType }[] = [
  { label: '内部员工', value: 'employee' },
  { label: '访客', value: 'guest' },
  { label: '外包人员', value: 'outsourcing' },
  { label: '合同客户', value: 'contractor' },
];

export const transactionDirectionOptions: { label: string; value: TransactionDirection }[] = [
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' },
];

export const transactionTypeOptions: { label: string; value: TransactionType }[] = [
  { label: '充值', value: 'recharge' },
  { label: '消费', value: 'consumption' },
  { label: '退款', value: 'refund' },
  { label: '补贴发放', value: 'subsidy' },
  { label: '调账', value: 'adjustment' },
  { label: '冻结/解冻', value: 'freeze' },
];

export const fallbackDeptTree: TreeItem[] = [
  {
    title: '总部',
    key: 'group-head',
    children: [
      { title: '研发二部', key: 'dept-rd-2' },
      { title: '市场中心', key: 'dept-marketing' },
      { title: '运营中心', key: 'dept-ops' },
    ],
  },
  {
    title: '合作单位',
    key: 'group-partner',
    children: [
      { title: '启航科技', key: 'dept-qihang' },
      { title: '嘉禾传媒', key: 'dept-jiahe' },
    ],
  },
];

const formatAmount = (value?: number | string) => Number(value ?? 0).toFixed(2);

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
    width: 130,
  },
  {
    title: '部门',
    dataIndex: 'departmentName',
    width: 140,
  },
  {
    title: '账户类型',
    dataIndex: 'accountType',
    width: 110,
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: '账户等级',
    dataIndex: 'accountLevel',
    width: 110,
    align: 'center',
    slots: { customRender: 'level' },
  },
  {
    title: '账户状态',
    dataIndex: 'accountStatus',
    width: 100,
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '总余额(元)',
    dataIndex: ['wallet', 'totalBalance'],
    width: 130,
    align: 'right',
    format: (_, record) => formatAmount(record?.wallet?.totalBalance),
  },
  {
    title: '现金钱包(元)',
    dataIndex: ['wallet', 'cashWallet'],
    width: 130,
    align: 'right',
    format: (_, record) => formatAmount(record?.wallet?.cashWallet),
  },
  {
    title: '补贴钱包(元)',
    dataIndex: ['wallet', 'subsidyWallet'],
    width: 130,
    align: 'right',
    format: (_, record) => formatAmount(record?.wallet?.subsidyWallet),
  },
  {
    title: '欠费金额(元)',
    dataIndex: ['wallet', 'arrearsAmount'],
    width: 130,
    align: 'right',
    format: (_, record) => formatAmount(record?.wallet?.arrearsAmount),
  },
  {
    title: '最近活跃时间',
    dataIndex: 'lastActiveTime',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 140,
    fixed: 'right',
    slots: { customRender: 'action' },
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
    field: 'accountStatus',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: accountStatusOptions,
    },
  },
  {
    label: '账户类型',
    field: 'accountType',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: accountTypeOptions,
    },
  },
  {
    label: '账户等级',
    field: 'accountLevel',
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

export const accountTransactionColumns: BasicColumn[] = [
  {
    title: '流水号',
    dataIndex: 'transactionNo',
    width: 180,
  },
  {
    title: '发生时间',
    dataIndex: 'occurTime',
    width: 180,
  },
  {
    title: '业务类型',
    dataIndex: 'bizType',
    width: 120,
    align: 'center',
    slots: { customRender: 'bizType' },
  },
  {
    title: '收支方向',
    dataIndex: 'direction',
    width: 100,
    align: 'center',
    slots: { customRender: 'direction' },
  },
  {
    title: '金额(元)',
    dataIndex: 'amount',
    width: 120,
    align: 'right',
    format: (_, record) => formatAmount((record as any)?.amount),
  },
  {
    title: '变动后余额(元)',
    dataIndex: 'balanceAfter',
    width: 140,
    align: 'right',
    format: (_, record) => formatAmount((record as any)?.balanceAfter),
  },
  {
    title: '渠道/终端',
    dataIndex: 'channel',
    width: 160,
  },
  {
    title: '业务单号',
    dataIndex: 'bizNo',
    width: 180,
    format: (_, record) => (record as any)?.bizNo || (record as any)?.transactionNo || '-',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 220,
    ellipsis: true,
  },
];

export const accountTransactionSearchFormSchema: FormSchema[] = [
  {
    label: '业务类型',
    field: 'bizType',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: transactionTypeOptions,
    },
  },
  {
    label: '收支方向',
    field: 'direction',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: transactionDirectionOptions,
    },
  },
  {
    label: '发生时间',
    field: 'occurTimeRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
  {
    label: '关键字',
    field: 'keyword',
    component: 'Input',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '流水号/业务单号/备注',
    },
  },
];

export const rechargeFormSchema: FormSchema[] = [
  {
    field: 'walletType',
    label: '充值钱包',
    component: 'Select',
    required: true,
    defaultValue: 'cash',
    componentProps: {
      options: [{ label: '现金钱包', value: 'cash' }],
      disabled: true,
    },
  },
  {
    field: 'amount',
    label: '充值金额',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0.01,
      precision: 2,
      style: { width: '100%' },
    },
  },
  {
    field: 'channel',
    label: '充值渠道',
    component: 'Select',
    defaultValue: 'cash',
    componentProps: {
      options: [{ label: '现金', value: 'cash' }],
      disabled: true,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 200,
    },
  },
];

export const refundFormSchema: FormSchema[] = [
  {
    field: 'amount',
    label: '退款金额(元)',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0.01,
      precision: 2,
      style: { width: '100%' },
    },
  },
  {
    field: 'walletType',
    label: '退款钱包',
    component: 'Select',
    required: true,
    defaultValue: 'cash',
    componentProps: {
      options: [
        { label: '现金钱包', value: 'cash' },
        { label: '补贴钱包', value: 'subsidy' },
      ],
    },
  },
  {
    field: 'bizNo',
    label: '原业务单号',
    component: 'Input',
    componentProps: {
      placeholder: '原消费订单号 / 充值单号',
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 200,
    },
  },
];

export const editAccountFormSchema: FormSchema[] = [
  {
    field: 'realName',
    label: '用户姓名',
    component: 'Input',
    required: true,
  },
  {
    field: 'phone',
    label: '手机号',
    component: 'Input',
    required: true,
  },
  {
    field: 'gender',
    label: '性别',
    component: 'Select',
    componentProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },
  },
  {
    field: 'departmentName',
    label: '部门',
    component: 'Input',
  },
  {
    field: 'position',
    label: '岗位',
    component: 'Input',
  },
  {
    field: 'accountStatus',
    label: '账户状态',
    component: 'Select',
    required: true,
    componentProps: {
      options: accountStatusOptions,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
      maxlength: 300,
    },
  },
];
