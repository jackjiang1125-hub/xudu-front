import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';

export interface AccGroupItem {
  id: string;
  groupName: string;
  timeRange: string;
  memberCount: number;
  deviceCount: number;
  createTime: string;
  remark?: string;
  members?: string[];
  devices?: string[];
  applyDays?: string[];
  timeSlots?: string[];
}

export const groupColumns: BasicColumn[] = [
  {
    title: '权限组名称',
    dataIndex: 'groupName',
    width: 180,
  },
  {
    title: '启用时段',
    dataIndex: 'timeRange',
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
    label: '权限组名称',
    field: 'groupName',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '人员数量',
    field: 'memberCount',
    component: 'InputNumber',
    componentProps: { min: 0 },
    colProps: { span: 8 },
  },
  {
    label: '设备数量',
    field: 'deviceCount',
    component: 'InputNumber',
    componentProps: { min: 0 },
    colProps: { span: 8 },
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
  },
  {
    label: '部门',
    field: 'dept',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '联系方式',
    field: 'phone',
    component: 'Input',
    colProps: { span: 8 },
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
  },
  {
    label: '序列号',
    field: 'sn',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '安装位置',
    field: 'location',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const mockGroupList: AccGroupItem[] = [
  {
    id: 'g-001',
    groupName: '行政办公区',
    timeRange: '周一至周五 08:30 - 19:00',
    memberCount: 28,
    deviceCount: 6,
    createTime: '2025-09-28 10:32:18',
    remark: '行政楼层员工适用',
    members: ['u-1002', 'u-1005'],
    devices: ['d-001', 'd-003'],
    applyDays: ['workday'],
    timeSlots: ['08:30', '19:00'],
  },
  {
    id: 'g-002',
    groupName: '夜班值守',
    timeRange: '每天 19:00 - 次日 08:00',
    memberCount: 12,
    deviceCount: 4,
    createTime: '2025-09-12 21:15:40',
    remark: '夜班安保与运维人员',
    members: ['u-1003', 'u-1004'],
    devices: ['d-002', 'd-004'],
    applyDays: ['daily'],
    timeSlots: ['19:00', '08:00'],
  },
  {
    id: 'g-003',
    groupName: '访客临时',
    timeRange: '临时审批时段',
    memberCount: 6,
    deviceCount: 2,
    createTime: '2025-10-01 09:08:05',
    remark: '配合访客系统动态授权',
    members: ['u-1001'],
    devices: ['d-005'],
    applyDays: ['custom'],
    timeSlots: ['09:00', '21:00'],
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
