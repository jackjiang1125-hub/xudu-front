import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';

export interface TimeInterval {
  start: string;
  end: string;
}

export interface TimePeriodDetail {
  key: string;
  label: string;
  segments: TimeInterval[];
}

export interface TimePeriodRecord {
  id: string;
  name: string;
  remark?: string;
  updatedAt: string;
  creator: string;
  detail: TimePeriodDetail[];
}

const BASE_DATES = [
  { key: 'mon', label: '星期一' },
  { key: 'tue', label: '星期二' },
  { key: 'wed', label: '星期三' },
  { key: 'thu', label: '星期四' },
  { key: 'fri', label: '星期五' },
  { key: 'sat', label: '星期六' },
  { key: 'sun', label: '星期日' },
  { key: 'holiday1', label: '假日类型1' },
  { key: 'holiday2', label: '假日类型2' },
  { key: 'holiday3', label: '假日类型3' },
];

export const dateDefinitions = BASE_DATES;

export const timePeriodColumns: BasicColumn[] = [
  {
    title: '时间段名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
  },
  {
    title: '更新人',
    dataIndex: 'creator',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
  },
];

export const timePeriodSearchSchema: FormSchema[] = [
  {
    field: 'name',
    label: '时间段名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'creator',
    label: '创建人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'updatedAt',
    label: '更新时间',
    component: 'RangePicker',
    colProps: { span: 8 },
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

export const mockTimePeriodList: TimePeriodRecord[] = [
  {
    id: 'tp-001',
    name: '24小时通行',
    remark: '全天开放',
    updatedAt: '2025-07-18 09:45',
    creator: '系统管理员',
    detail: createAllDayPlan(),
  },
  {
    id: 'tp-002',
    name: '工作日 08:00-18:00',
    remark: '周一至周五开放，法定节假日关闭',
    updatedAt: '2025-08-02 14:12',
    creator: '安防部',
    detail: createWorkdayPlan(),
  },
];

export function createBlankPlan(): TimePeriodDetail[] {
  return BASE_DATES.map((item) => ({
    key: item.key,
    label: item.label,
    segments: [
      { start: '00:00', end: '00:00' },
      { start: '00:00', end: '00:00' },
      { start: '00:00', end: '00:00' },
    ],
  }));
}

export function createAllDayPlan(): TimePeriodDetail[] {
  return BASE_DATES.map((item) => ({
    key: item.key,
    label: item.label,
    segments: [
      { start: '00:00', end: '23:59' },
      { start: '00:00', end: '00:00' },
      { start: '00:00', end: '00:00' },
    ],
  }));
}

export function createWorkdayPlan(): TimePeriodDetail[] {
  return BASE_DATES.map((item) => {
    const isWorkday = ['mon', 'tue', 'wed', 'thu', 'fri'].includes(item.key);
    return {
      key: item.key,
      label: item.label,
      segments: [
        { start: isWorkday ? '08:00' : '00:00', end: isWorkday ? '18:00' : '00:00' },
        { start: '00:00', end: '00:00' },
        { start: '00:00', end: '00:00' },
      ],
    };
  });
}