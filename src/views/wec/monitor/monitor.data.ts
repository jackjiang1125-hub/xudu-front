import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  { title: '设备名称', dataIndex: 'deviceName', width: 160 },
  { title: '机号', dataIndex: 'sn', width: 140 },
  { title: '安装位置', dataIndex: 'installLocation', width: 180 },
  { title: '在线状态', dataIndex: 'online', width: 100, customRender: ({ text }) => render.renderDict(text ? '1' : '0', 'online_status', true) },
  { title: '工作状态', dataIndex: 'workStatus', width: 120, customRender: ({ text }) => render.renderDict(text, 'wec_work_status', true) },
  { title: '最近心跳', dataIndex: 'lastHeartbeatTime', width: 160, customRender: ({ text }) => render.renderDate(text) },
];

export const usageColumns: BasicColumn[] = [
  { title: '设备名称', dataIndex: 'deviceName', width: 160 },
  { title: '机号', dataIndex: 'sn', width: 140 },
  { title: '总使用时间', dataIndex: 'totalUsageTime', width: 140, customRender: ({ text }) => text != null ? text + ' 秒' : '-' },
  { title: '总流量', dataIndex: 'totalUsageFlow', width: 140, customRender: ({ text }) => text != null ? text + ' ml' : '-' },
  { title: '总金额', dataIndex: 'totalUsageMoney', width: 140, customRender: ({ text }) => text != null ? (text/100).toFixed(2) + ' 元' : '-' },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'deviceName', label: '设备名称', component: 'JInput' },
  { field: 'online', label: '在线状态', component: 'JDictSelectTag', componentProps: { dictCode: 'online_status' } },
  { field: 'workStatus', label: '工作状态', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_work_status' } },
];
