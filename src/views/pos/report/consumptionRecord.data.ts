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
  customerName: string;
  customerType: string;
  type: ConsumptionType;
  amount: number;
  discountAmount: number;
  balanceAfter: number;
  deviceName: string;
  deviceCode: string;
  scene: string;
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
    title: '优惠金额(元)',
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
    title: '消费设备',
    dataIndex: 'deviceName',
    width: 160,
    align: 'left',
  },
  {
    title: '消费场景',
    dataIndex: 'scene',
    width: 160,
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
    label: '客户姓名',
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
    label: '消费设备',
    field: 'deviceName',
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

export const mockConsumptionRecordList: ConsumptionRecordItem[] = [
  {
    id: 'C-20251007-001',
    recordNo: 'CS20251007001001',
    cardNo: '8888 0000 0012',
    customerName: '张伟',
    customerType: '内部员工',
    type: 'product',
    amount: 56.4,
    discountAmount: 5.6,
    balanceAfter: 489.8,
    deviceName: '总部大堂收银台A',
    deviceCode: 'POS-31001',
    scene: '总部旗舰店-一楼',
    channel: '刷卡支付',
    operator: '门店收银员-刘霞',
    consumeTime: '2025-10-07 00:48:03',
    remark: '使用内部员工折扣',
    details: [
      {
        id: 'C-20251007-001-1',
        skuCode: 'P-DR-50001',
        productName: '冷萃咖啡原液 500ml',
        unitPrice: 38,
        quantity: 1,
        totalAmount: 38,
      },
      {
        id: 'C-20251007-001-2',
        skuCode: 'P-SN-20018',
        productName: '黑松露夏威夷果 180g',
        unitPrice: 48,
        quantity: 1,
        totalAmount: 48,
      },
    ],
  },
  {
    id: 'C-20251006-002',
    recordNo: 'CS20251006002002',
    cardNo: '8888 0000 0015',
    customerName: '李婷',
    customerType: '普通客户',
    type: 'meal',
    amount: 42,
    discountAmount: 2,
    balanceAfter: 176.6,
    deviceName: '二楼自助结算机',
    deviceCode: 'POS-73008',
    scene: '总部旗舰店-二楼餐区',
    channel: '扫码点餐',
    operator: '系统自动',
    consumeTime: '2025-10-06 19:35:22',
    remark: '餐饮自助机结算',
  },
  {
    id: 'C-20251006-003',
    recordNo: 'CS20251006002003',
    cardNo: '8888 0000 0008',
    customerName: '王磊',
    customerType: '内部员工',
    type: 'product',
    amount: 86,
    discountAmount: 8.6,
    balanceAfter: 734,
    deviceName: '总部大堂收银台B',
    deviceCode: 'POS-31002',
    scene: '总部旗舰店-一楼',
    channel: '刷卡支付',
    operator: '门店收银员-李强',
    consumeTime: '2025-10-06 18:22:49',
    details: [
      {
        id: 'C-20251006-003-1',
        skuCode: 'P-HS-70002',
        productName: '川味藤椒鸡胸轻食套餐',
        unitPrice: 32,
        quantity: 1,
        totalAmount: 32,
      },
      {
        id: 'C-20251006-003-2',
        skuCode: 'P-DR-50001',
        productName: '冷萃咖啡原液 500ml',
        unitPrice: 38,
        quantity: 1,
        totalAmount: 38,
      },
      {
        id: 'C-20251006-003-3',
        skuCode: 'P-SN-20036',
        productName: '日式蜜汁牛肉干 120g',
        unitPrice: 32,
        quantity: 0.5,
        totalAmount: 16,
      },
    ],
  },
  {
    id: 'C-20251005-004',
    recordNo: 'CS20251005001004',
    cardNo: '8888 0000 0033',
    customerName: '赵丽',
    customerType: '企业客户',
    type: 'service',
    amount: 300,
    discountAmount: 0,
    balanceAfter: 2848.4,
    deviceName: '总部运营管理后台',
    deviceCode: 'SYS-ONLINE',
    scene: '企业团餐预约',
    channel: '企业预定',
    operator: '企业客户经理-吴倩',
    consumeTime: '2025-10-05 16:32:00',
    remark: '企业团餐预约扣费',
  },
  {
    id: 'C-20251005-005',
    recordNo: 'CS20251005001005',
    cardNo: '8888 0000 0019',
    customerName: '陈晨',
    customerType: '普通客户',
    type: 'product',
    amount: 32,
    discountAmount: 0,
    balanceAfter: 131.5,
    deviceName: '总部大堂收银台A',
    deviceCode: 'POS-31001',
    scene: '总部旗舰店-一楼',
    channel: '刷卡支付',
    operator: '门店收银员-刘霞',
    consumeTime: '2025-10-05 12:52:33',
    details: [
      {
        id: 'C-20251005-005-1',
        skuCode: 'P-SN-20036',
        productName: '日式蜜汁牛肉干 120g',
        unitPrice: 32,
        quantity: 1,
        totalAmount: 32,
      },
    ],
  },
  {
    id: 'C-20251004-006',
    recordNo: 'CS20251004001006',
    cardNo: '8888 0000 0006',
    customerName: '刘洋',
    customerType: '普通客户',
    type: 'meal',
    amount: 24,
    discountAmount: 0,
    balanceAfter: 278.4,
    deviceName: '移动手持终端-1号',
    deviceCode: 'POS-52011',
    scene: '会议茶歇补给',
    channel: '刷卡支付',
    operator: '移动服务员-张倩',
    consumeTime: '2025-10-04 15:12:24',
    remark: '会议茶歇手持终端消费',
  },
  {
    id: 'C-20251003-007',
    recordNo: 'CS20251003001007',
    cardNo: '8888 0000 0042',
    customerName: '周洋',
    customerType: '普通客户',
    type: 'product',
    amount: 54,
    discountAmount: 0,
    balanceAfter: 41.6,
    deviceName: '总部大堂收银台A',
    deviceCode: 'POS-31001',
    scene: '总部旗舰店-一楼',
    channel: '刷卡支付',
    operator: '门店收银员-刘霞',
    consumeTime: '2025-10-03 21:28:40',
    details: [
      {
        id: 'C-20251003-007-1',
        skuCode: 'P-GF-80002',
        productName: '门店百元充值卡',
        unitPrice: 100,
        quantity: 0.5,
        totalAmount: 50,
      },
      {
        id: 'C-20251003-007-2',
        skuCode: 'P-DR-50001',
        productName: '冷萃咖啡原液 500ml',
        unitPrice: 38,
        quantity: 0.1,
        totalAmount: 3.8,
      },
    ],
  },
  {
    id: 'C-20251002-008',
    recordNo: 'CS20251002001001',
    cardNo: '8888 0000 0021',
    customerName: '许诺',
    customerType: '企业客户',
    type: 'service',
    amount: 520,
    discountAmount: 0,
    balanceAfter: 745.9,
    deviceName: '总部运营管理后台',
    deviceCode: 'SYS-ONLINE',
    scene: '企业订餐服务费',
    channel: '平台扣费',
    operator: '企业客户经理-吴倩',
    consumeTime: '2025-10-02 17:45:03',
  },
  {
    id: 'C-20251001-009',
    recordNo: 'CS20251001001003',
    cardNo: '8888 0000 0055',
    customerName: '高珊',
    customerType: '普通客户',
    type: 'product',
    amount: 80,
    discountAmount: 8,
    balanceAfter: 139.5,
    deviceName: '总部大堂收银台B',
    deviceCode: 'POS-31002',
    scene: '总部旗舰店-一楼',
    channel: '刷卡支付',
    operator: '门店收银员-李强',
    consumeTime: '2025-10-01 11:02:17',
    remark: '双节活动优惠',
    details: [
      {
        id: 'C-20251001-009-1',
        skuCode: 'P-SN-20018',
        productName: '黑松露夏威夷果 180g',
        unitPrice: 48,
        quantity: 1,
        totalAmount: 48,
      },
      {
        id: 'C-20251001-009-2',
        skuCode: 'P-HS-70002',
        productName: '川味藤椒鸡胸轻食套餐',
        unitPrice: 32,
        quantity: 1,
        totalAmount: 32,
      },
    ],
  },
];

export const consumptionDetailColumns = [
  {
    title: '商品编码',
    dataIndex: 'skuCode',
    key: 'skuCode',
    width: 140,
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    key: 'productName',
  },
  {
    title: '单价(元)',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    width: 120,
    align: 'right',
    customRender: ({ text }) => Number(text ?? 0).toFixed(2),
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
  },
  {
    title: '小计(元)',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 120,
    align: 'right',
    customRender: ({ text }) => Number(text ?? 0).toFixed(2),
  },
];
