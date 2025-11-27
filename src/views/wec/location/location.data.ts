import type { BasicColumn, FormSchema } from '/@/components/Table';
import { listRooms } from '../structure/structure.api';

export const columns: BasicColumn[] = [
  { title: '安装位置', dataIndex: 'locationName', width: 200 },
  { title: '房间', dataIndex: 'roomName', width: 180 },
  { title: '备注', dataIndex: 'remark', width: 200 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'locationName', label: '安装位置', component: 'JInput' },
  { field: 'roomName', label: '房间', component: 'JInput' },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'locationName', label: '安装位置', component: 'JInput', required: true },
  { field: 'roomId', label: '房间', component: 'ApiSelect', required: true, componentProps: { api: listRooms, labelField: 'roomName', valueField: 'id' } },
  { field: 'remark', label: '备注', component: 'JInput' },
];
