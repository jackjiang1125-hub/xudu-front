import type { BasicColumn, FormSchema } from '/@/components/Table';

export type ParkStatus = 'operating' | 'paused' | 'closed';
export type ChargeMode = 'hourly' | 'section' | 'monthly' | 'free';

export interface ParkRecord {
  id: string;
  parkCode: string;
  parkName: string;
  city: string;
  address: string;
  totalSpaces: number;
  availableSpaces: number;
  chargeMode: ChargeMode;
  chargeRule: string;
  openTime: string;
  closeTime: string;
  status: ParkStatus;
  contactPerson: string;
  contactPhone: string;
  remark?: string;
}

export const parkStatusOptions = [
  { label: '运营中', value: 'operating' },
  { label: '暂停服务', value: 'paused' },
  { label: '已关闭', value: 'closed' },
];

export const chargeModeOptions = [
  { label: '按小时计费', value: 'hourly' },
  { label: '分段计费', value: 'section' },
  { label: '包月计费', value: 'monthly' },
  { label: '免费开放', value: 'free' },
];

export const parkColumns: BasicColumn[] = [
  {
    title: '车场编号',
    dataIndex: 'parkCode',
    width: 150,
    align: 'left',
  },
  {
    title: '车场名称',
    dataIndex: 'parkName',
    width: 180,
    align: 'left',
  },
  {
    title: '所属城市',
    dataIndex: 'city',
    width: 120,
  },
  {
    title: '详细地址',
    dataIndex: 'address',
    width: 220,
    align: 'left',
  },
  {
    title: '总车位',
    dataIndex: 'totalSpaces',
    width: 110,
  },
  {
    title: '可用车位',
    dataIndex: 'availableSpaces',
    width: 110,
  },
  {
    title: '计费方式',
    dataIndex: 'chargeMode',
    width: 140,
    slots: { customRender: 'chargeMode' },
  },
  {
    title: '开放时间',
    dataIndex: 'openTime',
    width: 100,
  },
  {
    title: '关闭时间',
    dataIndex: 'closeTime',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    slots: { customRender: 'status' },
  },
  {
    title: '联系人',
    dataIndex: 'contactPerson',
    width: 110,
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 150,
  },
];

export const parkSearchFormSchema: FormSchema[] = [
  {
    label: '车场名称',
    field: 'parkName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '所属城市',
    field: 'city',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '计费方式',
    field: 'chargeMode',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: chargeModeOptions,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: parkStatusOptions,
    },
  },
];

export const mockParkList: ParkRecord[] = [
  {
    id: 'PK-1001',
    parkCode: 'PK-HZ-001',
    parkName: '人工智能小镇智慧车场',
    city: '杭州',
    address: '杭州市西湖区云谷路88号人工智能小镇 B 区',
    totalSpaces: 520,
    availableSpaces: 186,
    chargeMode: 'hourly',
    chargeRule: '5元/小时，封顶30元/天',
    openTime: '07:00',
    closeTime: '23:30',
    status: 'operating',
    contactPerson: '张伟',
    contactPhone: '13800001111',
    remark: '园区内视线清晰，支持无感支付。',
  },
  {
    id: 'PK-1002',
    parkCode: 'PK-HZ-002',
    parkName: 'CBD 国际中心地下车库',
    city: '杭州',
    address: '杭州市滨江区科技路299号 CBD 国际中心 -2F',
    totalSpaces: 360,
    availableSpaces: 98,
    chargeMode: 'section',
    chargeRule: '前2小时免费，之后3元/小时',
    openTime: '00:00',
    closeTime: '24:00',
    status: 'operating',
    contactPerson: '刘婷',
    contactPhone: '13900002222',
    remark: '支持新能源专用车位预约。',
  },
  {
    id: 'PK-1003',
    parkCode: 'PK-HZ-003',
    parkName: '总部访客立体停车楼',
    city: '杭州',
    address: '杭州市西湖区枫桦路168号总部访客区',
    totalSpaces: 240,
    availableSpaces: 56,
    chargeMode: 'monthly',
    chargeRule: '月租 500 元，对外访客按小时收费',
    openTime: '06:30',
    closeTime: '22:00',
    status: 'paused',
    contactPerson: '陈亮',
    contactPhone: '13700003333',
    remark: '电梯升级维护中，预计两周恢复。',
  },
  {
    id: 'PK-1004',
    parkCode: 'PK-HZ-004',
    parkName: '未来科技城示范停车场',
    city: '杭州',
    address: '杭州市余杭区文一西路777号未来科技城核心区',
    totalSpaces: 680,
    availableSpaces: 520,
    chargeMode: 'free',
    chargeRule: '免费开放',
    openTime: '00:00',
    closeTime: '24:00',
    status: 'operating',
    contactPerson: '邱泽',
    contactPhone: '13600004444',
    remark: '智慧停车示范项目，支持无感进出。',
  },
  {
    id: 'PK-1005',
    parkCode: 'PK-HZ-005',
    parkName: '云谷路临时停车场',
    city: '杭州',
    address: '杭州市西湖区云谷路与北斗路交叉口',
    totalSpaces: 120,
    availableSpaces: 0,
    chargeMode: 'hourly',
    chargeRule: '3元/小时，封顶18元/天',
    openTime: '08:00',
    closeTime: '20:00',
    status: 'closed',
    contactPerson: '苏远',
    contactPhone: '13500005555',
    remark: '受道路施工影响，暂时关闭。',
  },
];

export function formatChargeMode(value: ChargeMode) {
  return chargeModeOptions.find((item) => item.value === value)?.label ?? value;
}

export function formatParkStatus(value: ParkStatus) {
  return parkStatusOptions.find((item) => item.value === value)?.label ?? value;
}
