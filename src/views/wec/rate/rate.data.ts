import type { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  { title: '模板名称', dataIndex: 'templateName', width: 180 },
  { title: '费率类型', dataIndex: 'type', width: 140, customRender: ({ text }) => render.renderDict(text, 'wec_rate_type') },
  { title: '用户类型', dataIndex: 'userType', width: 140, customRender: ({ text }) => render.renderDict(text, 'wec_user_type') },
  { title: '分类', dataIndex: 'category', width: 140 },
  { title: '季节', dataIndex: 'season', width: 120 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'templateName', label: '模板名称', component: 'JInput' },
  { field: 'type', label: '费率类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_rate_type' } },
  { field: 'userType', label: '用户类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_user_type' } },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'templateName', label: '模板名称', component: 'JInput', required: true },
  { field: 'type', label: '费率类型', component: 'JDictSelectTag', required: true, componentProps: { dictCode: 'wec_rate_type' } },
  { field: 'userType', label: '用户类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_user_type' } },
  { field: 'category', label: '分类', component: 'JInput' },
  { field: 'season', label: '季节', component: 'JInput' },
  { field: 'periods', label: '时段设置', component: 'JInput' },
  { field: 'rules', label: '费率规则', component: 'InputTextArea' },
];
