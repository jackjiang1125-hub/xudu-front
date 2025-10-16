import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import { getUserList } from '/@/api/common/api';
import { listDevices } from '../devce.api';

export interface AccGroupItem {
  id: string;
  groupName: string;
  periodId?: string;
  periodName?: string;
  memberCount: number;
  deviceCount: number;
  createTime: string;
  remark?: string;
  members?: string[];
  devices?: string[];
}

// 选择成员表格的数据结构
export interface AccMemberItem {
  id: string;
  name: string;
  dept: string;
  phone?: string;
  position?: string;
}

// 选择设备表格的数据结构
export interface AccDeviceItem {
  id: string;
  sn: string;
  deviceName: string;
  location?: string;
  authorized?: '已授权' | '未授权';
}

export const groupColumns: BasicColumn[] = [
  {
    title: '权限组名称',
    dataIndex: 'groupName',
    width: 180,
  },
  {
    title: '授权时间段',
    dataIndex: 'periodName',
    width: 200,
  },
  {
    title: '人员数量',
    dataIndex: 'memberCount',
    width: 120,
  },
  {
    title: '设备数量',
    dataIndex: 'deviceCount',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
  },
];

export const groupSearchFormSchema: FormSchema[] = [
  {
    label: '权限组',
    field: 'groupName',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入权限组名称',
      allowClear: true,
      size: 'middle',
    },
  },
];

export const memberColumns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 140,
  },
  {
    title: '所属部门',
    dataIndex: 'dept',
    width: 180,
  },
  {
    title: '联系方式',
    dataIndex: 'phone',
    width: 160,
  },
  {
    title: '岗位',
    dataIndex: 'position',
    width: 140,
  },
];

export const memberSearchFormSchema: FormSchema[] = [
  {
    label: '姓名',
    field: 'name',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入姓名',
      allowClear: true,
      size: 'middle',
    },
  },
  {
    label: '部门',
    field: 'dept',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入部门',
      allowClear: true,
      size: 'middle',
    },
  },
  {
    label: '联系方式',
    field: 'phone',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入联系方式',
      allowClear: true,
      size: 'middle',
    },
  },
];

export const deviceColumns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 160,
  },
  {
    title: '序列号',
    dataIndex: 'sn',
    width: 160,
  },
  {
    title: '安装位置',
    dataIndex: 'location',
    width: 200,
  },
  {
    title: '当前授权状态',
    dataIndex: 'authorized',
    width: 140,
    slots: { customRender: 'authorized' },
  },
];

export const deviceSearchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入设备名称',
      allowClear: true,
      size: 'middle',
    },
  },
  {
    label: '序列号',
    field: 'sn',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入序列号',
      allowClear: true,
      size: 'middle',
    },
  },
  {
    label: '安装位置',
    field: 'location',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '输入安装位置',
      allowClear: true,
      size: 'middle',
    },
  },
];

export const mockGroupList: AccGroupItem[] = [
  {
    id: 'g-001',
    groupName: '行政办公区',
    periodId: 'tp-001',
    periodName: '工作日白班',
    memberCount: 28,
    deviceCount: 6,
    createTime: '2025-09-28 10:32:18',
    remark: '行政楼层员工适用',
    members: ['u-1002', 'u-1005'],
    devices: ['d-001', 'd-003'],
  },
  {
    id: 'g-002',
    groupName: '夜班值守',
    periodId: 'tp-002',
    periodName: '夜班时段',
    memberCount: 12,
    deviceCount: 4,
    createTime: '2025-09-12 21:15:40',
    remark: '夜班安保与运维人员',
    members: ['u-1003', 'u-1004'],
    devices: ['d-002', 'd-004'],
  },
  {
    id: 'g-003',
    groupName: '访客临时',
    periodId: 'tp-003',
    periodName: '访客临时',
    memberCount: 6,
    deviceCount: 2,
    createTime: '2025-10-01 09:08:05',
    remark: '配合访客系统动态授权',
    members: ['u-1001'],
    devices: ['d-005'],
  },
];

export const mockMemberList = [
  {
    id: 'u-1001',
    name: '张伟',
    dept: '研发一部',
    phone: '13800000001',
    position: '高级工程师',
  },
  {
    id: 'u-1002',
    name: '李娜',
    dept: '行政中心',
    phone: '13800000002',
    position: '行政主管',
  },
  {
    id: 'u-1003',
    name: '王磊',
    dept: '信息安全部',
    phone: '13800000003',
    position: '安全工程师',
  },
  {
    id: 'u-1004',
    name: '陈晨',
    dept: '运维部',
    phone: '13800000004',
    position: '运维专员',
  },
  {
    id: 'u-1005',
    name: '赵敏',
    dept: '客服中心',
    phone: '13800000005',
    position: '主管',
  },
  {
    id: 'u-1006',
    name: '刘洋',
    dept: '研发二部',
    phone: '13800000006',
    position: '产品经理',
  },
  {
    id: 'u-1007',
    name: '孙琪',
    dept: '市场部',
    phone: '13800000007',
    position: '市场专员',
  },
  {
    id: 'u-1008',
    name: '周林',
    dept: '运营中心',
    phone: '13800000008',
    position: '运营主管',
  },
];

export const mockDeviceList = [
  {
    id: 'd-001',
    sn: 'ACC-0001',
    deviceName: '总部一楼大门',
    location: '总部大厦一楼大厅',
    authorized: '已授权',
  },
  {
    id: 'd-002',
    sn: 'ACC-0002',
    deviceName: '研发中心侧门',
    location: '研发中心二层侧门',
    authorized: '未授权',
  },
  {
    id: 'd-003',
    sn: 'ACC-0003',
    deviceName: '行政楼电梯间',
    location: '行政楼三层电梯口',
    authorized: '已授权',
  },
  {
    id: 'd-004',
    sn: 'ACC-0004',
    deviceName: '夜班值守室',
    location: '监控中心入口',
    authorized: '未授权',
  },
  {
    id: 'd-005',
    sn: 'ACC-0005',
    deviceName: '访客临时闸机',
    location: '访客大厅闸机通道',
    authorized: '未授权',
  },
  {
    id: 'd-006',
    sn: 'ACC-0006',
    deviceName: '仓库后门',
    location: '物流仓储区后门',
    authorized: '已授权',
  },
  {
    id: 'd-007',
    sn: 'ACC-0007',
    deviceName: '机房通道',
    location: '数据中心机房入口',
    authorized: '未授权',
  },
  {
    id: 'd-008',
    sn: 'ACC-0008',
    deviceName: '停车场闸机',
    location: '地下停车场入口',
    authorized: '未授权',
  },
];

// ===== 真实接口封装：选择人员/设备 =====
// 返回结构需符合 BasicTable 默认 fetchSetting：{ listField: 'records', totalField: 'total' }

/**
 * 获取成员列表（分页）并转换为模块内字段
 * 支持参数：pageNo, pageSize, name(映射 realname), dept(映射 orgCodeTxt), phone
 */
export async function fetchAccMemberList(params: Record<string, any>): Promise<{ records: AccMemberItem[]; total: number }>{
  try {
    const { pageNo, pageSize, name, dept, phone, ids } = params ?? {};
    const query: Record<string, any> = {
      pageNo: pageNo ?? 1,
      pageSize: pageSize ?? 10,
    };
    if (name) query.realname = name;
    if (dept) query.orgCodeTxt = dept;
    if (phone) query.phone = phone;
    if (ids) query.ids = ids;

    const res: any = await getUserList(query);
    const list = (res?.records ?? []).map((u: any) => ({
      id: String(u.id ?? u.userId ?? u.username ?? ''),
      name: String(u.realname ?? u.username ?? ''),
      dept: String(u.orgCodeTxt ?? u.departName ?? ''),
      phone: u.phone ? String(u.phone) : '',
      position: u.post ?? u.position ?? '',
    })) as AccMemberItem[];

    return {
      records: list,
      total: Number(res?.total ?? list.length ?? 0),
    };
  } catch (error) {
    console.error('[fetchAccMemberList] 接口请求失败：', error);
    return { records: [], total: 0 };
  }
}

/**
 * 获取设备列表（分页）并转换为模块内字段
 * 支持参数：pageNo, pageSize, deviceName/sn/location
 */
export async function fetchAccDeviceList(params: Record<string, any>): Promise<{ records: AccDeviceItem[]; total: number }>{
  try {
    const query: Record<string, any> = {
      pageNo: params?.pageNo ?? 1,
      pageSize: params?.pageSize ?? 10,
      deviceName: params?.deviceName,
      sn: params?.sn,
      location: params?.location,
      ids: params?.ids,
    };

    const res: any = await listDevices(query);
    const list = (res?.records ?? []).map((d: any) => ({
      id: String(d.id ?? ''),
      sn: String(d.sn ?? ''),
      deviceName: String(d.deviceName ?? d.name ?? ''),
      location: d.location ? String(d.location) : '',
      authorized: d.authorized === 1 || d.authorized === '1' ? '已授权' : '未授权',
    })) as AccDeviceItem[];

    return {
      records: list,
      total: Number(res?.total ?? list.length ?? 0),
    };
  } catch (error) {
    console.error('[fetchAccDeviceList] 接口请求失败：', error);
    return { records: [], total: 0 };
  }
}
