import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';

export const columns: BasicColumn[] = [
  { title: '姓名', dataIndex: 'realName', width: 140 },
  { title: '工号', dataIndex: 'workNo', width: 140 },
  { title: '用户类型', dataIndex: 'userType', width: 140, customRender: ({ text }) => {
    if (text === '1') return '白名单';
    if (text === '2') return '黑名单';
    return text;
  } },
  { title: '卡号', dataIndex: 'cardNo', width: 160 },
  { title: '余额', dataIndex: 'balance', width: 120 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'realName', label: '姓名', component: 'JInput' },
  { field: 'userType', label: '用户类型', component: 'Select', componentProps: {
    options: [
      { label: '白名单', value: '1' },
      { label: '黑名单', value: '2' },
    ]
  } },
  { field: 'cardNo', label: '卡号', component: 'JInput' },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'realName', label: '姓名', component: 'Input', dynamicDisabled: true },
  { field: 'workNo', label: '工号', component: 'Input', dynamicDisabled: true },
  { field: 'userType', label: '用户类型', component: 'Select', required: true, componentProps: {
    options: [
      { label: '白名单', value: '1' },
      { label: '黑名单', value: '2' },
    ]
  } },
  { field: 'cardNo', label: '卡号', component: 'Input', required: true, dynamicDisabled: ({ values }) => !!values.id },
  { field: 'balance', label: '余额', component: 'InputNumber', dynamicDisabled: true, componentProps: { min: 0 } },
  { field: 'remark', label: '备注', component: 'InputTextArea' },
];
