import type { BasicColumn, FormSchema } from '/@/components/Table';

export type RechargeChannel = 'cash' | 'wechat' | 'alipay' | 'bank' | 'transfer';

export interface RechargeRecordItem {
  id: string;
  orderNo: string;
  cardNo: string;
  customerName: string;
  customerType: string;
  rechargeAmount: number;
  giftAmount: number;
  balanceAfter: number;
  rechargeChannel: RechargeChannel;
  operator: string;
  merchant: string;
  rechargeTime: string;
  remark?: string;
}

export const rechargeChannelOptions = [
  { label: '现金', value: 'cash' },
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '银行卡转账', value: 'bank' },
  { label: '内部转账', value: 'transfer' },
];

export const rechargeColumns: BasicColumn[] = [
  {
    title: '充值单号',
    dataIndex: 'orderNo',
    width: 180,
    align: 'left',
  },
  {
    title: '卡号',
    dataIndex: 'cardNo',
    width: 140,
    align: 'left',
  },
  {
    title: '客户姓名',
    dataIndex: 'customerName',
    width: 120,
  },
  {
    title: '客户类型',
    dataIndex: 'customerType',
    width: 120,
  },
  {
    title: '充值金额(元)',
    dataIndex: 'rechargeAmount',
    width: 130,
    align: 'right',
    format: (text: number) => Number(text ?? 0).toFixed(2),
  },
  {
    title: '赠送金额(元)',
    dataIndex: 'giftAmount',
    width: 130,
    align: 'right',
    format: (text: number) => Number(text ?? 0).toFixed(2),
  },
  {
    title: '充值后余额(元)',
    dataIndex: 'balanceAfter',
    width: 150,
    align: 'right',
    format: (text: number) => Number(text ?? 0).toFixed(2),
  },
  {
    title: '充值渠道',
    dataIndex: 'rechargeChannel',
    width: 130,
    align: 'center',
    slots: { customRender: 'rechargeChannel' },
  },
  {
    title: '操作员',
    dataIndex: 'operator',
    width: 120,
  },
  {
    title: '所属商户',
    dataIndex: 'merchant',
    width: 160,
    align: 'left',
  },
  {
    title: '充值时间',
    dataIndex: 'rechargeTime',
    width: 180,
  },
];

export const rechargeSearchFormSchema: FormSchema[] = [
  {
    label: '卡号',
    field: 'cardNo',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '客户姓名',
    field: 'customerName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '充值渠道',
    field: 'rechargeChannel',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: rechargeChannelOptions,
    },
  },
  {
    label: '充值时间',
    field: 'rechargeTimeRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
];

export const mockRechargeRecordList: RechargeRecordItem[] = [
  {
    id: 'R-20251007-001',
    orderNo: 'RC20251007001001',
    cardNo: '8888 0000 0012',
    customerName: '张伟',
    customerType: '内部员工',
    rechargeAmount: 300,
    giftAmount: 30,
    balanceAfter: 546.2,
    rechargeChannel: 'wechat',
    operator: '系统自动',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-07 00:40:18',
    remark: '充值赠送10%，自动营销活动',
  },
  {
    id: 'R-20251006-002',
    orderNo: 'RC20251006002001',
    cardNo: '8888 0000 0015',
    customerName: '李婷',
    customerType: '普通客户',
    rechargeAmount: 200,
    giftAmount: 0,
    balanceAfter: 218.6,
    rechargeChannel: 'alipay',
    operator: '门店收银员-刘霞',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-06 19:22:56',
  },
  {
    id: 'R-20251006-003',
    orderNo: 'RC20251006002002',
    cardNo: '8888 0000 0008',
    customerName: '王磊',
    customerType: '内部员工',
    rechargeAmount: 500,
    giftAmount: 50,
    balanceAfter: 820,
    rechargeChannel: 'cash',
    operator: '门店收银员-李强',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-06 18:11:39',
  },
  {
    id: 'R-20251005-004',
    orderNo: 'RC20251005001003',
    cardNo: '8888 0000 0033',
    customerName: '赵丽',
    customerType: '企业客户',
    rechargeAmount: 2000,
    giftAmount: 0,
    balanceAfter: 3148.4,
    rechargeChannel: 'bank',
    operator: '财务对账',
    merchant: '企业团餐事业部',
    rechargeTime: '2025-10-05 16:05:02',
    remark: '客户通过公账转账',
  },
  {
    id: 'R-20251005-005',
    orderNo: 'RC20251005001004',
    cardNo: '8888 0000 0019',
    customerName: '陈晨',
    customerType: '普通客户',
    rechargeAmount: 150,
    giftAmount: 0,
    balanceAfter: 163.5,
    rechargeChannel: 'wechat',
    operator: '门店收银员-徐敏',
    merchant: 'CBD写字楼体验店',
    rechargeTime: '2025-10-05 12:22:18',
  },
  {
    id: 'R-20251004-006',
    orderNo: 'RC20251004001005',
    cardNo: '8888 0000 0006',
    customerName: '刘洋',
    customerType: '普通客户',
    rechargeAmount: 120,
    giftAmount: 12,
    balanceAfter: 302.4,
    rechargeChannel: 'transfer',
    operator: '门店店长-蒋楠',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-04 14:40:08',
  },
  {
    id: 'R-20251003-007',
    orderNo: 'RC20251003001006',
    cardNo: '8888 0000 0042',
    customerName: '周洋',
    customerType: '普通客户',
    rechargeAmount: 80,
    giftAmount: 0,
    balanceAfter: 95.6,
    rechargeChannel: 'alipay',
    operator: '门店收银员-刘霞',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-03 21:18:42',
  },
  {
    id: 'R-20251003-008',
    orderNo: 'RC20251003001007',
    cardNo: '8888 0000 0036',
    customerName: '孙浩',
    customerType: '内部员工',
    rechargeAmount: 260,
    giftAmount: 26,
    balanceAfter: 428.3,
    rechargeChannel: 'wechat',
    operator: '系统自动',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-03 09:12:55',
  },
  {
    id: 'R-20251002-009',
    orderNo: 'RC20251002001001',
    cardNo: '8888 0000 0021',
    customerName: '许诺',
    customerType: '企业客户',
    rechargeAmount: 1000,
    giftAmount: 0,
    balanceAfter: 1265.9,
    rechargeChannel: 'bank',
    operator: '财务对账',
    merchant: '企业团餐事业部',
    rechargeTime: '2025-10-02 17:05:11',
  },
  {
    id: 'R-20251001-010',
    orderNo: 'RC20251001001003',
    cardNo: '8888 0000 0055',
    customerName: '高珊',
    customerType: '普通客户',
    rechargeAmount: 100,
    giftAmount: 10,
    balanceAfter: 219.5,
    rechargeChannel: 'wechat',
    operator: '系统自动',
    merchant: '总部旗舰店',
    rechargeTime: '2025-10-01 10:48:20',
    remark: '双节活动充值赠送',
  },
];
