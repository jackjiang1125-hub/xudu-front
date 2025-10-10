import type { BasicColumn, FormSchema } from '/@/components/Table';

export type MealOrderDetailType = 'detail' | 'set' | 'buffet';
export type MealOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type MealOrderPayStatus = 'unpaid' | 'paid' | 'refunded';
export type MealOrderChannel = 'wechat' | 'alipay' | 'mini-program' | 'offline' | 'phone';
export type MealOrderPickupMethod = 'self-pickup' | 'delivery' | 'dine-in';

export interface MealOrderItem {
  id: string;
  skuCode: string;
  productName: string;
  taste: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  remark?: string;
}

export interface MealOrderRecord {
  id: string;
  orderNo: string;
  customerName: string;
  contactPhone: string;
  customerType: string;
  department?: string;
  orderDetailType: MealOrderDetailType;
  orderStatus: MealOrderStatus;
  payStatus: MealOrderPayStatus;
  pickupMethod: MealOrderPickupMethod;
  diningScene: string;
  diningDate: string;
  diningTimeRange: string;
  seatsReserved?: number;
  attendees?: number;
  deliveryAddress?: string;
  totalQuantity: number;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount: number;
  channel: MealOrderChannel;
  creator: string;
  createTime: string;
  lastUpdateTime: string;
  remark?: string;
  orderItems?: MealOrderItem[];
}

export const mealOrderDetailTypeOptions = [
  { label: '明细订餐', value: 'detail' },
  { label: '套餐订餐', value: 'set' },
  { label: '自助订餐', value: 'buffet' },
];

export const mealOrderStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '制作中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

export const mealOrderPayStatusOptions = [
  { label: '未支付', value: 'unpaid' },
  { label: '已支付', value: 'paid' },
  { label: '已退款', value: 'refunded' },
];

export const mealOrderPickupMethodOptions = [
  { label: '自取', value: 'self-pickup' },
  { label: '配送', value: 'delivery' },
  { label: '堂食', value: 'dine-in' },
];

export const mealOrderChannelOptions = [
  { label: '微信小程序', value: 'mini-program' },
  { label: '微信公众号', value: 'wechat' },
  { label: '支付宝生活号', value: 'alipay' },
  { label: '线下收银台', value: 'offline' },
  { label: '电话客服', value: 'phone' },
];

export const mealOrderColumns: BasicColumn[] = [
  {
    title: '订餐单号',
    dataIndex: 'orderNo',
    width: 190,
    align: 'left',
  },
  {
    title: '客户姓名',
    dataIndex: 'customerName',
    width: 120,
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 140,
  },
  {
    title: '订餐类型',
    dataIndex: 'orderDetailType',
    width: 120,
    align: 'center',
    slots: { customRender: 'orderDetailType' },
  },
  {
    title: '出餐场景',
    dataIndex: 'diningScene',
    width: 180,
    align: 'left',
  },
  {
    title: '用餐日期',
    dataIndex: 'diningDate',
    width: 140,
  },
  {
    title: '用餐时段',
    dataIndex: 'diningTimeRange',
    width: 140,
  },
  {
    title: '订单状态',
    dataIndex: 'orderStatus',
    width: 110,
    align: 'center',
    slots: { customRender: 'orderStatus' },
  },
  {
    title: '支付状态',
    dataIndex: 'payStatus',
    width: 110,
    align: 'center',
    slots: { customRender: 'payStatus' },
  },
  {
    title: '取餐方式',
    dataIndex: 'pickupMethod',
    width: 110,
    align: 'center',
    slots: { customRender: 'pickupMethod' },
  },
  {
    title: '应付金额(元)',
    dataIndex: 'payableAmount',
    width: 130,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '实付金额(元)',
    dataIndex: 'paidAmount',
    width: 130,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

export const mealOrderSearchFormSchema: FormSchema[] = [
  {
    label: '订餐单号',
    field: 'orderNo',
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
    label: '订餐类型',
    field: 'orderDetailType',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: mealOrderDetailTypeOptions,
    },
  },
  {
    label: '订单状态',
    field: 'orderStatus',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: mealOrderStatusOptions,
    },
  },
  {
    label: '支付状态',
    field: 'payStatus',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: mealOrderPayStatusOptions,
    },
  },
  {
    label: '渠道来源',
    field: 'channel',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: mealOrderChannelOptions,
    },
  },
  {
    label: '用餐日期',
    field: 'diningDateRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      format: 'YYYY-MM-DD',
      style: { width: '100%' },
    },
  },
];

export const mockMealOrderRecordList: MealOrderRecord[] = [
  {
    id: 'MO-20251007-001',
    orderNo: 'MO20251007001001',
    customerName: '张伟',
    contactPhone: '13800000001',
    customerType: '内部员工',
    department: '研发二部',
    orderDetailType: 'detail',
    orderStatus: 'processing',
    payStatus: 'paid',
    pickupMethod: 'self-pickup',
    diningScene: '总部旗舰店·一楼员工餐厅',
    diningDate: '2025-10-08',
    diningTimeRange: '12:00-12:30',
    seatsReserved: 2,
    attendees: 2,
    totalQuantity: 4,
    totalAmount: 112,
    discountAmount: 12,
    payableAmount: 100,
    paidAmount: 100,
    channel: 'mini-program',
    creator: '张伟',
    createTime: '2025-10-07 09:12:20',
    lastUpdateTime: '2025-10-07 10:05:32',
    remark: '一份无辣需求，餐具准备两套',
    orderItems: [
      {
        id: 'MO-20251007-001-1',
        skuCode: 'HS-CHICKEN-001',
        productName: '川味藤椒鸡胸轻食套餐',
        taste: '少辣',
        unit: '份',
        quantity: 2,
        unitPrice: 32,
        amount: 64,
        remark: '鸡胸去皮',
      },
      {
        id: 'MO-20251007-001-2',
        skuCode: 'DR-COLD-5001',
        productName: '冷萃咖啡 500ml',
        taste: '少冰',
        unit: '杯',
        quantity: 2,
        unitPrice: 24,
        amount: 48,
      },
    ],
  },
  {
    id: 'MO-20251007-002',
    orderNo: 'MO20251007001002',
    customerName: '李婷',
    contactPhone: '13900000002',
    customerType: '外部客户',
    department: '嘉禾传媒',
    orderDetailType: 'detail',
    orderStatus: 'completed',
    payStatus: 'paid',
    pickupMethod: 'delivery',
    diningScene: 'CBD写字楼体验店·会议室配送',
    diningDate: '2025-10-07',
    diningTimeRange: '18:00-18:30',
    attendees: 8,
    deliveryAddress: '杭州市西湖区CBD写字楼A座19F会议室',
    totalQuantity: 18,
    totalAmount: 486,
    discountAmount: 36,
    payableAmount: 450,
    paidAmount: 450,
    channel: 'wechat',
    creator: '客服-刘霞',
    createTime: '2025-10-06 21:45:12',
    lastUpdateTime: '2025-10-07 19:02:08',
    remark: '需提前30分钟到达，提供一次性餐具',
    orderItems: [
      {
        id: 'MO-20251007-002-1',
        skuCode: 'SET-MEETING-001',
        productName: '商务会议餐A套餐',
        taste: '标准',
        unit: '份',
        quantity: 8,
        unitPrice: 42,
        amount: 336,
      },
      {
        id: 'MO-20251007-002-2',
        skuCode: 'DR-TEA-001',
        productName: '花果茶拼饮',
        taste: '常温',
        unit: '壶',
        quantity: 5,
        unitPrice: 22,
        amount: 110,
      },
      {
        id: 'MO-20251007-002-3',
        skuCode: 'SN-PLATTER-002',
        productName: '水果拼盘（大）',
        taste: '冰镇',
        unit: '份',
        quantity: 2,
        unitPrice: 20,
        amount: 40,
        remark: '去除芒果',
      },
    ],
  },
  {
    id: 'MO-20251006-003',
    orderNo: 'MO20251006002001',
    customerName: '王磊',
    contactPhone: '13700000003',
    customerType: '内部员工',
    department: '市场中心',
    orderDetailType: 'set',
    orderStatus: 'completed',
    payStatus: 'paid',
    pickupMethod: 'dine-in',
    diningScene: '总部旗舰店·二楼自助餐区',
    diningDate: '2025-10-06',
    diningTimeRange: '12:30-13:10',
    attendees: 1,
    totalQuantity: 1,
    totalAmount: 58,
    discountAmount: 8,
    payableAmount: 50,
    paidAmount: 50,
    channel: 'mini-program',
    creator: '王磊',
    createTime: '2025-10-06 10:08:16',
    lastUpdateTime: '2025-10-06 12:42:20',
    remark: '套餐含桌边茶水服务',
    orderItems: [
      {
        id: 'MO-20251006-003-1',
        skuCode: 'BUFFET-001',
        productName: '商务套餐·秋季限定',
        taste: '标准',
        unit: '份',
        quantity: 1,
        unitPrice: 58,
        amount: 58,
      },
    ],
  },
  {
    id: 'MO-20251005-004',
    orderNo: 'MO20251005001005',
    customerName: '赵丽',
    contactPhone: '13600000004',
    customerType: '企业客户',
    department: '启航科技',
    orderDetailType: 'detail',
    orderStatus: 'pending',
    payStatus: 'unpaid',
    pickupMethod: 'delivery',
    diningScene: '企业团餐配送·启航科技总部',
    diningDate: '2025-10-09',
    diningTimeRange: '11:30-12:00',
    attendees: 26,
    deliveryAddress: '滨江区江虹路618号启航大厦5F',
    totalQuantity: 52,
    totalAmount: 1326,
    discountAmount: 126,
    payableAmount: 1200,
    paidAmount: 0,
    channel: 'phone',
    creator: '企业顾问-吴倩',
    createTime: '2025-10-05 16:25:02',
    lastUpdateTime: '2025-10-05 17:03:18',
    remark: '活动订餐，待客户财务确认后付款',
    orderItems: [
      {
        id: 'MO-20251005-004-1',
        skuCode: 'SET-TEAM-001',
        productName: '团队分享套餐（标配）',
        taste: '标准',
        unit: '套',
        quantity: 12,
        unitPrice: 78,
        amount: 936,
      },
      {
        id: 'MO-20251005-004-2',
        skuCode: 'SOUP-001',
        productName: '菌菇炖鸡汤',
        taste: '少盐',
        unit: '盅',
        quantity: 10,
        unitPrice: 18,
        amount: 180,
      },
      {
        id: 'MO-20251005-004-3',
        skuCode: 'DR-MILKTEA-003',
        productName: '鲜果益菌多',
        taste: '少糖',
        unit: '杯',
        quantity: 30,
        unitPrice: 7,
        amount: 210,
      },
    ],
  },
  {
    id: 'MO-20251005-005',
    orderNo: 'MO20251005001006',
    customerName: '陈晨',
    contactPhone: '13500000005',
    customerType: '普通客户',
    orderDetailType: 'buffet',
    orderStatus: 'completed',
    payStatus: 'paid',
    pickupMethod: 'dine-in',
    diningScene: '总部旗舰店·自助餐档口',
    diningDate: '2025-10-05',
    diningTimeRange: '18:00-19:30',
    attendees: 3,
    totalQuantity: 3,
    totalAmount: 267,
    discountAmount: 27,
    payableAmount: 240,
    paidAmount: 240,
    channel: 'offline',
    creator: '前台收银-李强',
    createTime: '2025-10-05 17:25:46',
    lastUpdateTime: '2025-10-05 19:40:10',
    remark: '现场自助餐三人，已安排靠窗座位',
  },
  {
    id: 'MO-20251004-006',
    orderNo: 'MO20251004001007',
    customerName: '刘洋',
    contactPhone: '13400000006',
    customerType: '普通客户',
    orderDetailType: 'detail',
    orderStatus: 'completed',
    payStatus: 'paid',
    pickupMethod: 'self-pickup',
    diningScene: '移动手持终端·会议茶歇',
    diningDate: '2025-10-04',
    diningTimeRange: '15:00-15:30',
    attendees: 15,
    totalQuantity: 25,
    totalAmount: 365,
    discountAmount: 45,
    payableAmount: 320,
    paidAmount: 320,
    channel: 'mini-program',
    creator: '移动服务员-张倩',
    createTime: '2025-10-04 12:32:24',
    lastUpdateTime: '2025-10-04 14:55:40',
    remark: '配无线手持终端扫码核销',
    orderItems: [
      {
        id: 'MO-20251004-006-1',
        skuCode: 'SN-TEABREAK-001',
        productName: '茶歇点心组合',
        taste: '标准',
        unit: '套',
        quantity: 15,
        unitPrice: 12,
        amount: 180,
      },
      {
        id: 'MO-20251004-006-2',
        skuCode: 'DR-COFFEE-003',
        productName: '美式手冲咖啡',
        taste: '热饮',
        unit: '杯',
        quantity: 10,
        unitPrice: 18.5,
        amount: 185,
      },
    ],
  },
];

export const mealOrderDetailColumns: BasicColumn[] = [
  {
    title: '商品编码',
    dataIndex: 'skuCode',
    width: 140,
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    width: 220,
  },
  {
    title: '口味/偏好',
    dataIndex: 'taste',
    width: 120,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80,
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    width: 90,
  },
  {
    title: '单价(元)',
    dataIndex: 'unitPrice',
    width: 110,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '小计(元)',
    dataIndex: 'amount',
    width: 110,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];
