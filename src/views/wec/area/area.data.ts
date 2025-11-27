import type { BasicColumn, FormSchema } from '/@/components/Table';
import { listAreas } from './area.api';

export const columns: BasicColumn[] = [
  { title: '区域名称', dataIndex: 'areaName', width: 180 },
  { title: '区域编码', dataIndex: 'areaCode', width: 160 },
  { title: '上级区域', dataIndex: 'parentName', width: 180 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'areaName', label: '区域名称', component: 'JInput' },
  { field: 'areaCode', label: '区域编码', component: 'JInput' },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'areaName', label: '区域名称', component: 'JInput', required: true },
  { field: 'areaCode', label: '区域编码', component: 'JInput', required: true },
  { field: 'parentId', label: '上级区域', component: 'ApiSelect', componentProps: { api: listAreas, labelField: 'areaName', valueField: 'id' } },
];
