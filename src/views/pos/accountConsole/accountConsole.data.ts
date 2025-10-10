export interface PosAccountSnapshot {
  id: string;
  accountNo: string;
  realName: string;
  phone: string;
  department: string;
  position: string;
  type: '内部员工' | '合同客户' | '访客' | '外包人员';
  level: '钻石' | '金卡' | '银卡' | '标准';
  status: '正常' | '冻结';
  cashBalance: number;
  subsidyBalance: number;
  totalBalance: number;
}

export const accountList: PosAccountSnapshot[] = [
  {
    id: 'ACC-1001',
    accountNo: 'AC102500001',
    realName: '张伟',
    phone: '13800000001',
    department: '研发二部',
    position: '高级前端工程师',
    type: '内部员工',
    level: '钻石',
    status: '正常',
    cashBalance: 856.32,
    subsidyBalance: 320.5,
    totalBalance: 1236.82,
  },
  {
    id: 'ACC-1002',
    accountNo: 'AC102500002',
    realName: '李婷',
    phone: '13900000002',
    department: '市场中心',
    position: '品牌经理',
    type: '内部员工',
    level: '金卡',
    status: '正常',
    cashBalance: 325.6,
    subsidyBalance: 190,
    totalBalance: 535.6,
  },
  {
    id: 'ACC-1003',
    accountNo: 'AC102500003',
    realName: '王磊',
    phone: '13700000003',
    department: '运营中心',
    position: '营运主管',
    type: '内部员工',
    level: '银卡',
    status: '正常',
    cashBalance: 126.8,
    subsidyBalance: 240,
    totalBalance: 366.8,
  },
  {
    id: 'ACC-1004',
    accountNo: 'AC102500004',
    realName: '赵丽',
    phone: '13600000004',
    department: '启航科技',
    position: '行政主管',
    type: '合同客户',
    level: '钻石',
    status: '冻结',
    cashBalance: 0,
    subsidyBalance: 0,
    totalBalance: -2480,
  },
];

export const actionCards = [
  { key: 'recharge', title: '充值', icon: 'mdi:cash-plus', color: '#4f8cff' },
  { key: 'refund', title: '退款', icon: 'mdi:cash-refund', color: '#ff7a45' },
  { key: 'open', title: '开户', icon: 'mdi:account-plus', color: '#40c057' },
  { key: 'subsidy-reverse', title: '补贴冲正', icon: 'mdi:script-text', color: '#ffc53d' },
  { key: 'profile-edit', title: '修改资料', icon: 'mdi:account-edit', color: '#9254de' },
  { key: 'recharge-batch', title: '批量充值', icon: 'mdi:account-group-outline', color: '#13c2c2' },
  { key: 'refund-batch', title: '批量退款', icon: 'mdi:cash-multiple', color: '#f759ab' },
];

export const operationReasonOptions = [
  { label: '临时补充', value: 'temp' },
  { label: '员工福利', value: 'welfare' },
  { label: '订单纠纷', value: 'dispute' },
  { label: '系统调整', value: 'system' },
  { label: '活动赠送', value: 'campaign' },
];

export const notifyScopeOptions = [
  { label: '短信通知', value: 'sms' },
  { label: '企业微信', value: 'wechat' },
  { label: '邮箱提醒', value: 'email' },
  { label: '站内信', value: 'inbox' },
];

export const accountTypeOptions = [
  { label: '内部员工', value: '内部员工' },
  { label: '合同客户', value: '合同客户' },
  { label: '访客', value: '访客' },
  { label: '外包人员', value: '外包人员' },
];

export const accountLevelOptions = [
  { label: '钻石', value: '钻石' },
  { label: '金卡', value: '金卡' },
  { label: '银卡', value: '银卡' },
  { label: '标准', value: '标准' },
];
