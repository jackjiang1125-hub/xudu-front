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

// 后端API将提供实际数据，不再需要本地mock数据

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
