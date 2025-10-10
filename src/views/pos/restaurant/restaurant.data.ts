import type { BasicColumn, FormSchema } from '/@/components/Table';

export type RestaurantStatus = 'operating' | 'renovation' | 'closed' | 'pending';
export type RestaurantCategory = 'corporate' | 'franchise' | 'self-operated' | 'partner';
export type DiningServiceType = 'buffet' | 'fast-food' | 'fine-dining' | 'coffee' | 'canteen';
export type DeliveryProvider = 'internal' | 'meituan' | 'eleme' | 'none';

export interface RestaurantSupervisor {
  id: string;
  name: string;
  phone: string;
  position: string;
}

export interface RestaurantDeviceSummary {
  posCount: number;
  kioskCount: number;
  handheldCount: number;
  lockerCount: number;
}

export interface RestaurantRecord {
  id: string;
  restaurantCode: string;
  restaurantName: string;
  category: RestaurantCategory;
  diningServiceType: DiningServiceType;
  cuisineTags: string[];
  status: RestaurantStatus;
  openingDate: string;
  closingDate?: string;
  businessHours: string;
  address: string;
  building?: string;
  floor?: string;
  areaSize: number;
  seatingCapacity: number;
  privateRoomCount: number;
  averageSpend: number;
  deliveryProvider: DeliveryProvider;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  hasParking: boolean;
  hasWifi: boolean;
  supportsInvoice: boolean;
  hygieneLicenseNo: string;
  fireInspectionDate: string;
  lastAuditDate: string;
  ratingScore: number;
  ratingLevel: string;
  monthlyOrderVolume: number;
  monthlySales: number;
  supervisor: RestaurantSupervisor;
  deviceSummary: RestaurantDeviceSummary;
  remark?: string;
  photos?: string[];
  tags?: string[];
}

export const restaurantStatusOptions = [
  { label: '营业中', value: 'operating' },
  { label: '装修中', value: 'renovation' },
  { label: '暂停营业', value: 'closed' },
  { label: '筹备中', value: 'pending' },
];

export const restaurantCategoryOptions = [
  { label: '企业自营', value: 'corporate' },
  { label: '连锁加盟', value: 'franchise' },
  { label: '直营门店', value: 'self-operated' },
  { label: '合作门店', value: 'partner' },
];

export const diningServiceTypeOptions = [
  { label: '自助餐', value: 'buffet' },
  { label: '快餐简餐', value: 'fast-food' },
  { label: '正餐精致', value: 'fine-dining' },
  { label: '咖啡茶饮', value: 'coffee' },
  { label: '员工食堂', value: 'canteen' },
];

export const deliveryProviderOptions = [
  { label: '内部配送', value: 'internal' },
  { label: '美团外卖', value: 'meituan' },
  { label: '饿了么', value: 'eleme' },
  { label: '不支持外送', value: 'none' },
];

export const restaurantColumns: BasicColumn[] = [
  {
    title: '餐厅编码',
    dataIndex: 'restaurantCode',
    width: 150,
    align: 'left',
  },
  {
    title: '餐厅名称',
    dataIndex: 'restaurantName',
    width: 180,
    align: 'left',
  },
  {
    title: '分类',
    dataIndex: 'category',
    width: 110,
    align: 'center',
    slots: { customRender: 'category' },
  },
  {
    title: '业态',
    dataIndex: 'diningServiceType',
    width: 120,
    align: 'center',
    slots: { customRender: 'serviceType' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '营业时间',
    dataIndex: 'businessHours',
    width: 180,
  },
  {
    title: '地址',
    dataIndex: 'address',
    width: 220,
    align: 'left',
  },
  {
    title: '座位数',
    dataIndex: 'seatingCapacity',
    width: 100,
    align: 'right',
  },
  {
    title: '评分',
    dataIndex: 'ratingScore',
    width: 90,
    align: 'center',
  },
  {
    title: '月交易额(元)',
    dataIndex: 'monthlySales',
    width: 130,
    align: 'right',
    format: (value: number) => Number(value ?? 0).toFixed(2),
  },
  {
    title: '负责人',
    dataIndex: ['supervisor', 'name'],
    width: 120,
  },
  {
    title: '联系电话',
    dataIndex: ['supervisor', 'phone'],
    width: 140,
  },
];

export const restaurantSearchFormSchema: FormSchema[] = [
  {
    label: '餐厅名称',
    field: 'restaurantName',
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
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: restaurantStatusOptions,
    },
  },
  {
    label: '分类',
    field: 'category',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: restaurantCategoryOptions,
    },
  },
  {
    label: '业态',
    field: 'diningServiceType',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: diningServiceTypeOptions,
    },
  },
  {
    label: '是否支持外送',
    field: 'deliveryProvider',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: deliveryProviderOptions,
    },
  },
  {
    label: '开业日期',
    field: 'openingDateRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      format: 'YYYY-MM-DD',
      style: { width: '100%' },
    },
  },
];

export const mockRestaurantList: RestaurantRecord[] = [
  {
    id: 'R-001',
    restaurantCode: 'RT-HZ-0001',
    restaurantName: '杭城总部旗舰餐厅',
    category: 'corporate',
    diningServiceType: 'fine-dining',
    cuisineTags: ['融合菜', '杭帮菜', '轻素'],
    status: 'operating',
    openingDate: '2023-05-18',
    businessHours: '10:30-22:00 (周一至周日)',
    address: '杭州市西湖区云谷路88号人工智能小镇A座',
    building: 'A座',
    floor: '1-2F',
    areaSize: 2100,
    seatingCapacity: 186,
    privateRoomCount: 8,
    averageSpend: 85,
    deliveryProvider: 'internal',
    deliveryStartTime: '11:00',
    deliveryEndTime: '20:00',
    hasParking: true,
    hasWifi: true,
    supportsInvoice: true,
    hygieneLicenseNo: 'ZJWS-2023-88880001',
    fireInspectionDate: '2025-04-16',
    lastAuditDate: '2025-09-25',
    ratingScore: 4.7,
    ratingLevel: '五星',
    monthlyOrderVolume: 4860,
    monthlySales: 426000,
    supervisor: {
      id: 'SUP-001',
      name: '王晨',
      phone: '17888880001',
      position: '旗舰店总经理',
    },
    deviceSummary: {
      posCount: 12,
      kioskCount: 6,
      handheldCount: 10,
      lockerCount: 2,
    },
    remark: '承担总部商务接待及VIP客户宴请任务，定期举办主题活动。',
    tags: ['旗舰店', '商务接待', '智能化'],
  },
  {
    id: 'R-002',
    restaurantCode: 'RT-HZ-0002',
    restaurantName: 'CBD写字楼体验餐厅',
    category: 'self-operated',
    diningServiceType: 'fast-food',
    cuisineTags: ['轻食', '咖啡', '烘焙'],
    status: 'operating',
    openingDate: '2024-03-12',
    businessHours: '07:30-20:30 (周一至周五)',
    address: '杭州市滨江区科技路299号CBD体验中心1F',
    floor: '1F',
    areaSize: 860,
    seatingCapacity: 92,
    privateRoomCount: 2,
    averageSpend: 45,
    deliveryProvider: 'meituan',
    deliveryStartTime: '09:00',
    deliveryEndTime: '19:00',
    hasParking: false,
    hasWifi: true,
    supportsInvoice: true,
    hygieneLicenseNo: 'ZJWS-2024-77550002',
    fireInspectionDate: '2025-01-06',
    lastAuditDate: '2025-09-15',
    ratingScore: 4.5,
    ratingLevel: '四星',
    monthlyOrderVolume: 3220,
    monthlySales: 186560,
    supervisor: {
      id: 'SUP-002',
      name: '刘霞',
      phone: '13988880002',
      position: '餐厅经理',
    },
    deviceSummary: {
      posCount: 6,
      kioskCount: 4,
      handheldCount: 6,
      lockerCount: 0,
    },
    remark: '主要服务周边写字楼白领，支持线上预定和会议茶歇配送。',
    tags: ['城市体验店', '白领餐饮', '轻食'],
  },
  {
    id: 'R-003',
    restaurantCode: 'RT-HZ-0003',
    restaurantName: '总部员工食堂（一期）',
    category: 'corporate',
    diningServiceType: 'canteen',
    cuisineTags: ['中餐', '套餐', '自助'],
    status: 'operating',
    openingDate: '2022-11-01',
    businessHours: '07:00-09:00 / 11:00-13:30 / 17:30-20:00',
    address: '杭州市西湖区云谷路88号人工智能小镇B座4F',
    building: 'B座',
    floor: '4F',
    areaSize: 2650,
    seatingCapacity: 520,
    privateRoomCount: 0,
    averageSpend: 23,
    deliveryProvider: 'internal',
    hasParking: true,
    hasWifi: true,
    supportsInvoice: false,
    hygieneLicenseNo: 'ZJWS-2022-66440003',
    fireInspectionDate: '2025-03-01',
    lastAuditDate: '2025-08-30',
    ratingScore: 4.3,
    ratingLevel: '四星',
    monthlyOrderVolume: 9250,
    monthlySales: 212750,
    supervisor: {
      id: 'SUP-003',
      name: '陈亮',
      phone: '13788880003',
      position: '食堂主管',
    },
    deviceSummary: {
      posCount: 14,
      kioskCount: 10,
      handheldCount: 8,
      lockerCount: 6,
    },
    remark: '支撑总部员工三餐及夜宵保障，接入餐补与人脸识别系统。',
    tags: ['员工食堂', '人脸识别', '大客流'],
  },
  {
    id: 'R-004',
    restaurantCode: 'RT-HZ-0004',
    restaurantName: '未来科技城示范餐厅',
    category: 'partner',
    diningServiceType: 'buffet',
    cuisineTags: ['国际自助', '海鲜', '甜品'],
    status: 'pending',
    openingDate: '2025-12-01',
    businessHours: '11:30-21:30 (筹备中)',
    address: '杭州市余杭区文一西路777号未来科技城商业街B区',
    areaSize: 1800,
    seatingCapacity: 240,
    privateRoomCount: 6,
    averageSpend: 168,
    deliveryProvider: 'eleme',
    hasParking: true,
    hasWifi: true,
    supportsInvoice: true,
    hygieneLicenseNo: '筹备中',
    fireInspectionDate: '2025-08-18',
    lastAuditDate: '2025-09-28',
    ratingScore: 0,
    ratingLevel: '未评定',
    monthlyOrderVolume: 0,
    monthlySales: 0,
    supervisor: {
      id: 'SUP-004',
      name: '邱泽',
      phone: '13688880004',
      position: '筹建负责人',
    },
    deviceSummary: {
      posCount: 0,
      kioskCount: 0,
      handheldCount: 0,
      lockerCount: 0,
    },
    remark: '联合合作方打造的示范餐厅，预计开业后将接待高端商务客户。',
    tags: ['示范店', '筹备中', '合作模式'],
  },
  {
    id: 'R-005',
    restaurantCode: 'RT-HZ-0005',
    restaurantName: '云谷路智能取餐点',
    category: 'self-operated',
    diningServiceType: 'fast-food',
    cuisineTags: ['预制菜', '智能柜', '外带'],
    status: 'renovation',
    openingDate: '2024-07-20',
    closingDate: '2025-09-01',
    businessHours: '24小时智能取餐',
    address: '杭州市西湖区云谷路与北斗路交叉口智慧驿站',
    areaSize: 160,
    seatingCapacity: 12,
    privateRoomCount: 0,
    averageSpend: 28,
    deliveryProvider: 'internal',
    hasParking: false,
    hasWifi: true,
    supportsInvoice: true,
    hygieneLicenseNo: 'ZJWS-2024-55220005',
    fireInspectionDate: '2024-06-12',
    lastAuditDate: '2025-07-30',
    ratingScore: 4.1,
    ratingLevel: '三星',
    monthlyOrderVolume: 1480,
    monthlySales: 41440,
    supervisor: {
      id: 'SUP-005',
      name: '苏远',
      phone: '13588880005',
      position: '运营专员',
    },
    deviceSummary: {
      posCount: 2,
      kioskCount: 4,
      handheldCount: 3,
      lockerCount: 12,
    },
    remark: '正在进行智能设备升级与环境改造，预计2025年10月重新开业。',
    tags: ['智能取餐', '小体量', '设备升级'],
  },
];
