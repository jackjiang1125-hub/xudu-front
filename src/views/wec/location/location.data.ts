import type { BasicColumn, FormSchema } from '/@/components/Table';
// 安装位置独立，不绑定房间

export const columns: BasicColumn[] = [
  { title: '安装位置', dataIndex: 'locationName', width: 200 },
  { title: '备注', dataIndex: 'remark', width: 200 },
  { title: '操作', dataIndex: 'action', width: 140, fixed: 'right', slots: { customRender: 'action' } },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'locationName', label: '安装位置', component: 'JInput' },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'locationName', label: '安装位置', component: 'JInput', required: true },
  { field: 'remark', label: '备注', component: 'JInput' },
];
