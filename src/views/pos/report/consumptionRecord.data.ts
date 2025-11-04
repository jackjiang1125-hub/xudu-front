import type { BasicColumn, FormSchema } from '/@/components/Table';

export type ConsumptionType = 'product' | 'meal' | 'recharge' | 'service';

export interface ConsumptionDetailItem {
  id: string;
  skuCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export interface ConsumptionRecordItem {
  id: string;
  recordNo: string;
  cardNo: string;
  customerId: string;
  customerName: string;
  customerType: string;
  type: ConsumptionType;
  amount: number;
  discountAmount: number;
  discountPercent?: number;
  balanceAfter: number;
  deviceName: string;
  deviceCode: string;
  restaurantCode: string;
  scene: string;
  verifyMethod: string;
  channel: string;
  operator: string;
  consumeTime: string;
  remark?: string;
  details?: ConsumptionDetailItem[];
}

export const consumptionTypeOptions = [
  { label: '商品消费', value: 'product' },
  { label: '餐饮消费', value: 'meal' },
  { label: '充值扣减', value: 'recharge' },
  { label: '服务扣费', value: 'service' },
];

export const consumptionColumns: BasicColumn[] = [
  {
    title: '消费单号',
    dataIndex: 'recordNo',
    width: 180,
    align: 'left',
  },
  {
    title: '人员编号',
    dataIndex: 'customerId',
    width: 120,
  },
  {
    title: '人员姓名',
    dataIndex: 'customerName',
    width: 120,
  },
  {
    title: '消费类型',
    dataIndex: 'type',
    width: 120,
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: '消费金额(元)',
    dataIndex: 'amount',
    width: 130,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '折扣百分比',
    dataIndex: 'discountPercent',
    width: 120,
    align: 'center',
    customRender: ({ record }) => {
      const { amount, discountAmount } = record;
      if (!amount || amount <= 0) return '-';
      const percent = discountAmount ? (discountAmount / amount * 100) : 0;
      return `${percent.toFixed(1)}%`;
    },
  },
  {
    title: '折扣金额(元)',
    dataIndex: 'discountAmount',
    width: 130,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '消费后余额(元)',
    dataIndex: 'balanceAfter',
    width: 150,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '设备序列号',
    dataIndex: 'deviceCode',
    width: 140,
    align: 'left',
  },
  {
    title: '消费设备',
    dataIndex: 'deviceName',
    width: 160,
    align: 'left',
  },
  {
    title: '餐厅编码',
    dataIndex: 'restaurantCode',
    width: 120,
    align: 'left',
  },
  {
    title: '餐厅名称',
    dataIndex: 'scene',
    width: 160,
    align: 'left',
  },
  {
    title: '验证方式',
    dataIndex: 'verifyMethod',
    width: 120,
  },
  {
    title: '卡号',
    dataIndex: 'cardNo',
    width: 140,
    align: 'left',
  },
  {
    title: '消费渠道',
    dataIndex: 'channel',
    width: 120,
  },
  {
    title: '操作员',
    dataIndex: 'operator',
    width: 120,
  },
  {
    title: '消费时间',
    dataIndex: 'consumeTime',
    width: 180,
  },
];

export const consumptionSearchFormSchema: FormSchema[] = [
  {
    label: '卡号',
    field: 'cardNo',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '人员编号',
    field: 'customerId',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '人员姓名',
    field: 'customerName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '消费类型',
    field: 'type',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: consumptionTypeOptions,
    },
  },
  {
    label: '设备序列号',
    field: 'deviceCode',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '消费设备',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '餐厅编码',
    field: 'restaurantCode',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '消费时间',
    field: 'consumeTimeRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
];

export const consumptionDetailColumns: BasicColumn[] = [
  {
    title: 'SKU编码',
    dataIndex: 'skuCode',
    width: 120,
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 200,
  },
  {
    title: '单价(元)',
    dataIndex: 'unitPrice',
    width: 100,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    width: 80,
    align: 'center',
  },
  {
    title: '小计(元)',
    dataIndex: 'totalAmount',
    width: 120,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
];

export const mockConsumptionRecordList: ConsumptionRecordItem[] = [
  {
    id: 'C-20251007-001',
    recordNo: 'CS20251007001001',
    cardNo: '8888 0000 0012',
    customerId: 'EMP001',
    customerName: '张伟',
    customerType: '内部员工',
    type: 'product',
    amount: 56.4,
    discountAmount: 5.6,
    balanceAfter: 489.8,
    deviceName: '总部大堂收银台A',
    deviceCode: 'POS-31001',
    restaurantCode: 'RES001',
    scene: '总部旗舰店-一楼',
    verifyMethod: '密码验证',
    channel: '刷卡支付',
    operator: '门店收银员-刘霞',
    consumeTime: '2025-10-07 00:48:03',
    remark: '使用内部员工折扣',
    details: [
      {
        id: 'D-20251007-001-01',
        skuCode: 'SKU001',
        productName: '美式咖啡-中杯',
        unitPrice: 28.0,
        quantity: 1,
        totalAmount: 28.0,
      },
      {
        id: 'D-20251007-001-02',
        skuCode: 'SKU002',
        productName: '全麦三明治',
        unitPrice: 28.4,
        quantity: 1,
        totalAmount: 28.4,
      },
    ],
  },
  {
    id: 'C-20251007-002',
    recordNo: 'CS20251007002002',
    cardNo: '8888 0000 0015',
    customerId: 'CUS001',
    customerName: '李明',
    customerType: '普通客户',
    type: 'meal',
    amount: 128.5,
    discountAmount: 0,
    balanceAfter: 680.3,
    deviceName: '分店前台收银机B',
    deviceCode: 'POS-32002',
    restaurantCode: 'RES002',
    scene: '南方分店-餐厅',
    verifyMethod: '面部识别',
    channel: '扫码支付',
    operator: '分店收银员-王芳',
    consumeTime: '2025-10-07 12:30:15',
  },
  {
    id: 'C-20251007-003',
    recordNo: 'CS20251007003003',
    cardNo: '8888 0000 0023',
    customerId: 'VIP001',
    customerName: '王婷',
    customerType: 'VIP客户',
    type: 'service',
    amount: 500,
    discountAmount: 50,
    balanceAfter: 1850,
    deviceName: 'VIP专区服务台',
    deviceCode: 'POS-33001',
    restaurantCode: 'RES001',
    scene: '总部旗舰店-VIP区',
    verifyMethod: '指纹验证',
    channel: '会员余额',
    operator: 'VIP接待员-赵阳',
    consumeTime: '2025-10-07 15:45:22',
    remark: 'VIP会员专享9折优惠',
  },
  {
    id: 'C-20251007-004',
    recordNo: 'CS20251007004004',
    cardNo: '8888 0000 0036',
    customerId: 'EMP002',
    customerName: '刘强',
    customerType: '内部员工',
    type: 'product',
    amount: 89.6,
    discountAmount: 9.0,
    balanceAfter: 1250.4,
    deviceName: '总部大堂收银台B',
    deviceCode: 'POS-31002',
    restaurantCode: 'RES001',
    scene: '总部旗舰店-一楼',
    verifyMethod: '密码验证',
    channel: '企业卡支付',
    operator: '门店收银员-刘霞',
    consumeTime: '2025-10-07 18:20:36',
    remark: '使用内部员工折扣',
    details: [
      {
        id: 'D-20251007-004-01',
        skuCode: 'SKU003',
        productName: '招牌拿铁-大杯',
        unitPrice: 35.0,
        quantity: 1,
        totalAmount: 35.0,
      },
      {
        id: 'D-20251007-004-02',
        skuCode: 'SKU004',
        productName: '蓝莓麦芬',
        unitPrice: 18.0,
        quantity: 1,
        totalAmount: 18.0,
      },
      {
        id: 'D-20251007-004-03',
        skuCode: 'SKU005',
        productName: '巧克力曲奇',
        unitPrice: 12.0,
        quantity: 3,
        totalAmount: 36.6,
      },
    ],
  },
  {
    id: 'C-20251007-005',
    recordNo: 'CS20251007005005',
    cardNo: '8888 0000 0042',
    customerId: 'CUS002',
    customerName: '陈晨',
    customerType: '普通客户',
    type: 'recharge',
    amount: 1000,
    discountAmount: 100,
    balanceAfter: 900,
    deviceName: '自助充值机',
    deviceCode: 'POS-34001',
    restaurantCode: 'RES002',
    scene: '南方分店-大厅',
    verifyMethod: '扫码验证',
    channel: '支付宝',
    operator: '系统自动',
    consumeTime: '2025-10-07 20:15:08',
    remark: '首次充值赠送10%'
  }
];
