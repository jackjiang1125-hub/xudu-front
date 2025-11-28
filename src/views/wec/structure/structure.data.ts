import type { BasicColumn, FormSchema } from '/@/components/Table';
import { listBuildings, listFloors } from './structure.api';

export const buildingColumns: BasicColumn[] = [
  { title: '楼栋名称', dataIndex: 'buildingName', width: 180 },
  { title: '楼栋编码', dataIndex: 'buildingCode', width: 160 },
  { title: '所属区域', dataIndex: 'areaName', width: 180 },
  { title: '操作', dataIndex: 'action', width: 140, fixed: 'right', slots: { customRender: 'action' } },
];

export const floorColumns: BasicColumn[] = [
  { title: '楼层名称', dataIndex: 'floorName', width: 180 },
  { title: '楼层编码', dataIndex: 'floorCode', width: 160 },
  { title: '操作', dataIndex: 'action', width: 140, fixed: 'right', slots: { customRender: 'action' } },
];

export const roomColumns: BasicColumn[] = [
  { title: '房间名称', dataIndex: 'roomName', width: 180 },
  { title: '房间编码', dataIndex: 'roomCode', width: 160 },
  { title: '操作', dataIndex: 'action', width: 140, fixed: 'right', slots: { customRender: 'action' } },
];

export const buildingSearchSchema: FormSchema[] = [
  { field: 'buildingName', label: '楼栋名称', component: 'JInput' },
  { field: 'buildingCode', label: '楼栋编码', component: 'JInput' },
];

export const floorSearchSchema: FormSchema[] = [
  { field: 'floorName', label: '楼层名称', component: 'JInput' },
  { field: 'floorCode', label: '楼层编码', component: 'JInput' },
];

export const roomSearchSchema: FormSchema[] = [
  { field: 'roomName', label: '房间名称', component: 'JInput' },
  { field: 'roomCode', label: '房间编码', component: 'JInput' },
];

export const buildingFormSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'buildingName', label: '楼栋名称', component: 'JInput', required: true },
  { field: 'buildingCode', label: '楼栋编码', component: 'JInput', required: true },
];

export const floorFormSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'batchCreate', label: '批量创建', component: 'JSwitch', defaultValue: '0', componentProps: { options: ['1','0'], labelOptions: ['开启','关闭'] } },
  { field: 'floorName', label: '楼层名称', component: 'JInput', required: ({ values }) => values.batchCreate !== '1' },
  { field: 'floorCode', label: '楼层编码', component: 'JInput', required: ({ values }) => values.batchCreate !== '1' },
  { field: 'startNo', label: '开始编号', component: 'InputNumber', ifShow: ({ values }) => values.batchCreate === '1', componentProps: { min: 1 } },
  { field: 'endNo', label: '结束编号', component: 'InputNumber', ifShow: ({ values }) => values.batchCreate === '1', componentProps: { min: 1 } },
  { field: 'buildingId', label: '所属楼栋', component: 'ApiSelect', required: true, componentProps: { api: listBuildings, labelField: 'buildingName', valueField: 'id' } },
];

export const roomFormSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'batchCreate', label: '批量创建', component: 'JSwitch', defaultValue: '0', componentProps: { options: ['1','0'], labelOptions: ['开启','关闭'] } },
  { field: 'roomName', label: '房间名称', component: 'JInput', required: ({ values }) => values.batchCreate !== '1' },
  { field: 'roomCode', label: '房间编码', component: 'JInput', required: ({ values }) => values.batchCreate !== '1' },
  { field: 'startNo', label: '开始编号', component: 'InputNumber', ifShow: ({ values }) => values.batchCreate === '1', componentProps: { min: 1 } },
  { field: 'endNo', label: '结束编号', component: 'InputNumber', ifShow: ({ values }) => values.batchCreate === '1', componentProps: { min: 1 } },
  { field: 'floorId', label: '所属楼层', component: 'ApiSelect', required: true, componentProps: { api: listFloors, labelField: 'floorName', valueField: 'id' } },
];
