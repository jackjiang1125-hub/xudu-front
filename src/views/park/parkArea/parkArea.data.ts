import type { BasicColumn, FormSchema } from '/@/components/Table';
import { mockParkList } from '../parkManage/parkManage.data';

export type AreaStatus = 'enabled' | 'maintenance' | 'disabled';

export interface ParkAreaRecord {
  id: string;
  zoneCode: string;
  zoneName: string;
  parkId: string;
  parkName: string;
  floor: string;
  capacity: number;
  available: number;
  allowVehicle: string[];
  status: AreaStatus;
  remark?: string;
}

export const areaStatusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '维护中', value: 'maintenance' },
  { label: '停用', value: 'disabled' },
];

export const vehicleOptions = [
  { label: '小型车', value: 'car' },
  { label: '新能源车', value: 'ev' },
  { label: '摩托车', value: 'motorcycle' },
  { label: '货车', value: 'truck' },
];

export const parkSelectOptions = mockParkList.map((item) => ({
  label: item.parkName,
  value: item.id,
}));

export const areaColumns: BasicColumn[] = [
  {
    title: '区域编号',
    dataIndex: 'zoneCode',
    width: 140,
    align: 'left',
  },
  {
    title: '区域名称',
    dataIndex: 'zoneName',
    width: 160,
    align: 'left',
  },
  {
    title: '所属车场',
    dataIndex: 'parkName',
    width: 200,
    align: 'left',
  },
  {
    title: '所在楼层/分区',
    dataIndex: 'floor',
    width: 140,
  },
  {
    title: '总车位',
    dataIndex: 'capacity',
    width: 110,
  },
  {
    title: '可用车位',
    dataIndex: 'available',
    width: 110,
  },
  {
    title: '支持车型',
    dataIndex: 'allowVehicle',
    width: 180,
    customRender: ({ text }) =>
      Array.isArray(text)
        ? text
            .map((item: string) => vehicleOptions.find((opt) => opt.value === item)?.label ?? item)
            .join(' / ')
        : '',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    slots: { customRender: 'status' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    ellipsis: true,
  },
];

export const areaSearchFormSchema: FormSchema[] = [
  {
    label: '区域名称',
    field: 'zoneName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '所属车场',
    field: 'parkId',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: parkSelectOptions,
    },
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: areaStatusOptions,
    },
  },
  {
    label: '支持车型',
    field: 'vehicle',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: vehicleOptions,
    },
  },
];

export const mockAreaList: ParkAreaRecord[] = [
  {
    id: 'PA-2001',
    zoneCode: 'Z-A1',
    zoneName: 'A1 访客区',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    floor: 'B1 层',
    capacity: 120,
    available: 42,
    allowVehicle: ['car', 'ev'],
    status: 'enabled',
    remark: '靠近主入口，支持无感支付与新能源充电。',
  },
  {
    id: 'PA-2002',
    zoneCode: 'Z-A2',
    zoneName: 'A2 员工区',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    floor: 'B2 层',
    capacity: 180,
    available: 96,
    allowVehicle: ['car'],
    status: 'enabled',
    remark: '员工专属区域，出入需凭工牌。',
  },
  {
    id: 'PA-2003',
    zoneCode: 'Z-C1',
    zoneName: 'C1 充电专区',
    parkId: 'PK-1002',
    parkName: 'CBD 国际中心地下车库',
    floor: 'B3 层',
    capacity: 60,
    available: 18,
    allowVehicle: ['ev'],
    status: 'maintenance',
    remark: '充电桩升级维护期间，部分车位暂停使用。',
  },
  {
    id: 'PA-2004',
    zoneCode: 'Z-B1',
    zoneName: 'B1 货车卸货区',
    parkId: 'PK-1004',
    parkName: '未来科技城示范停车场',
    floor: '地面西区',
    capacity: 40,
    available: 28,
    allowVehicle: ['truck'],
    status: 'enabled',
    remark: '夜间 22:00 后禁止大型货车入场。',
  },
  {
    id: 'PA-2005',
    zoneCode: 'Z-D1',
    zoneName: 'D1 摩托车区',
    parkId: 'PK-1001',
    parkName: '人工智能小镇智慧车场',
    floor: '地面北区',
    capacity: 80,
    available: 64,
    allowVehicle: ['motorcycle'],
    status: 'enabled',
    remark: '摩托车集中过夜区，靠近北门。',
  },
];

export function formatAreaStatus(status: AreaStatus) {
  return areaStatusOptions.find((item) => item.value === status)?.label ?? status;
}
