import type { BasicColumn, FormSchema } from '/@/components/Table';
import { listAreas } from '../area/area.api';
import { listBuildings, listFloors } from './structure.api';

export const buildingColumns: BasicColumn[] = [
  { title: '楼栋名称', dataIndex: 'buildingName', width: 180 },
  { title: '楼栋编码', dataIndex: 'buildingCode', width: 160 },
  { title: '所属区域', dataIndex: 'areaName', width: 180 },
];

export const floorColumns: BasicColumn[] = [
  { title: '楼层名称', dataIndex: 'floorName', width: 180 },
  { title: '楼层编码', dataIndex: 'floorCode', width: 160 },
];

export const roomColumns: BasicColumn[] = [
  { title: '房间名称', dataIndex: 'roomName', width: 180 },
  { title: '房间编码', dataIndex: 'roomCode', width: 160 },
];

export const buildingSearchSchema: FormSchema[] = [
  { field: 'buildingName', label: '楼栋名称', component: 'JInput' },
  { field: 'buildingCode', label: '楼栋编码', component: 'JInput' },
  { field: 'areaId', label: '所属区域', component: 'ApiSelect', componentProps: { api: listAreas, labelField: 'areaName', valueField: 'id' } },
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
  { field: 'areaId', label: '所属区域', component: 'ApiSelect', required: true, componentProps: { api: listAreas, labelField: 'areaName', valueField: 'id' } },
];

export const floorFormSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'floorName', label: '楼层名称', component: 'JInput', required: true },
  { field: 'floorCode', label: '楼层编码', component: 'JInput', required: true },
  { field: 'buildingId', label: '所属楼栋', component: 'ApiSelect', required: true, componentProps: { api: listBuildings, labelField: 'buildingName', valueField: 'id' } },
];

export const roomFormSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'roomName', label: '房间名称', component: 'JInput', required: true },
  { field: 'roomCode', label: '房间编码', component: 'JInput', required: true },
  { field: 'floorId', label: '所属楼层', component: 'ApiSelect', required: true, componentProps: { api: listFloors, labelField: 'floorName', valueField: 'id' } },
];
