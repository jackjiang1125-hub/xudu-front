import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  { title: '姓名', dataIndex: 'realName', width: 140 },
  { title: '用户类型', dataIndex: 'userType', width: 140, customRender: ({ text }) => render.renderDict(text, 'wec_user_type') },
  { title: '卡号', dataIndex: 'cardNo', width: 160 },
  { title: '指纹编号', dataIndex: 'fingerprintNo', width: 140 },
  { title: '余额', dataIndex: 'balance', width: 120 },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ text }) => render.renderDict(text, 'user_status', true) },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'realName', label: '姓名', component: 'JInput' },
  { field: 'userType', label: '用户类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_user_type' } },
  { field: 'cardNo', label: '卡号', component: 'JInput' },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'realName', label: '姓名', component: 'JInput', required: true },
  { field: 'userType', label: '用户类型', component: 'JDictSelectTag', required: true, componentProps: { dictCode: 'wec_user_type' } },
  { field: 'cardNo', label: '卡号', component: 'JInput', required: true },
  { field: 'fingerprintNo', label: '指纹编号', component: 'JInput' },
  { field: 'balance', label: '余额', component: 'InputNumber', componentProps: { min: 0 } },
  { field: 'whitelist', label: '白名单', component: 'JSwitch', defaultValue: '0', componentProps: { options: ['1','0'], labelOptions: ['是','否'] } },
  { field: 'blacklist', label: '黑名单', component: 'JSwitch', defaultValue: '0', componentProps: { options: ['1','0'], labelOptions: ['是','否'] } },
];
