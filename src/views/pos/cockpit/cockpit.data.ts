export interface SummaryCard {
  key: string;
  title: string;
  value: number;
  unit: string;
  desc: string;
  diff: string;
  trend: 'up' | 'down';
  icon: string;
  gradient: [string, string];
}

export const summaryCards: SummaryCard[] = [
  {
    key: 'consumption-today',
    title: '今日消费额',
    value: 128430,
    unit: '元',
    desc: '较昨日',
    diff: '+12.40%',
    trend: 'up',
    icon: 'mdi:currency-cny',
    gradient: ['#4378ff', '#3dd2ff'],
  },
  {
    key: 'recharge-today',
    title: '今日充值额',
    value: 96420,
    unit: '元',
    desc: '较昨日',
    diff: '+8.60%',
    trend: 'up',
    icon: 'mdi:battery-charging-90',
    gradient: ['#6d5bff', '#9f77ff'],
  },
  {
    key: 'active-accounts',
    title: '活跃账户数',
    value: 23482,
    unit: '个',
    desc: '较上周',
    diff: '+5.10%',
    trend: 'up',
    icon: 'mdi:account-group',
    gradient: ['#4cc2ff', '#58ffa5'],
  },
  {
    key: 'device-health',
    title: '设备在线率',
    value: 98.4,
    unit: '%',
    desc: '较昨日',
    diff: '-0.60%',
    trend: 'down',
    icon: 'mdi:chip',
    gradient: ['#ffa63d', '#ff5f6d'],
  },
];

export const rechargeConsumptionTrend = {
  days: ['09-27', '09-28', '09-29', '09-30', '10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07'],
  recharge: [56, 62, 58, 68, 74, 61, 80, 76, 82, 90, 96],
  consumption: [72, 78, 74, 88, 93, 85, 102, 97, 109, 112, 128],
};

export const walletStructure = [
  { name: '现金钱包', value: 43 },
  { name: '补贴钱包', value: 32 },
  { name: '礼品钱包', value: 12 },
  { name: '冻结金额', value: 5 },
  { name: '信用额度', value: 8 },
];

export const accountLevelDistribution = [
  { name: '钻石会员', value: 1280 },
  { name: '金卡会员', value: 3860 },
  { name: '银卡会员', value: 6720 },
  { name: '标准账户', value: 11622 },
];

export const restaurantPerformance = {
  indicators: [
    { name: '翻台效率', max: 120 },
    { name: '人均消费', max: 150 },
    { name: '线上订单', max: 180 },
    { name: '外送履约', max: 100 },
    { name: '顾客评分', max: 5 },
    { name: '能耗指数', max: 80 },
  ],
  values: [98, 126, 148, 87, 4.6, 42],
};

export const subsidyUsage = {
  months: ['5月', '6月', '7月', '8月', '9月', '10月'],
  issued: [420, 438, 465, 489, 512, 530],
  consumed: [362, 378, 401, 420, 447, 458],
};

export const deviceUptime = {
  uptime: 98.4,
  warning: 1.2,
  offline: 0.4,
  heartbeat: [
    { name: '自助点餐机', value: 99.1 },
    { name: 'POS 收银', value: 97.6 },
    { name: '消费终端', value: 96.9 },
    { name: '智能取餐柜', value: 98.8 },
  ],
};

export const mealOrderChannel = [
  { name: '小程序订餐', value: 42 },
  { name: '堂食消费', value: 26 },
  { name: '会议配餐', value: 15 },
  { name: '企业团餐', value: 11 },
  { name: '外送配送', value: 6 },
];

export const productTopCategories = {
  categories: ['轻食套餐', '自助档口', '咖啡茶饮', '热食便当', '烘焙甜品', '健身餐品'],
  sales: [186, 162, 138, 126, 102, 88],
};

export const realtimeTicker = [
  { time: '10:08:21', message: '会议茶歇订单到账 4800 元 · 餐厅：CBD体验餐厅' },
  { time: '10:06:47', message: '旗舰餐厅 2 号消费机恢复在线 · 在线率提升 0.3%' },
  { time: '10:05:12', message: '员工账户自动充值完成 500 笔 · 累计 25.6 万元' },
  { time: '10:02:08', message: '补贴核销进度 86% · 今日已核销 4.58 万元' },
  { time: '09:58:35', message: '爆款商品「秋季限定沙拉」销量突破 5000 份' },
];

export const peakConsumptionTrend = {
  hours: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
  dineIn: [12, 24, 68, 46, 18, 32, 56, 21],
  delivery: [3, 8, 22, 18, 11, 28, 34, 16],
  pickup: [6, 14, 30, 26, 16, 24, 36, 18],
};
