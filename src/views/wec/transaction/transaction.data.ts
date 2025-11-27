import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  { title: '交易号', dataIndex: 'tradeNo', width: 180 },
  { title: '用户', dataIndex: 'userName', width: 140 },
  { title: '设备', dataIndex: 'deviceName', width: 160 },
  { title: '金额', dataIndex: 'amount', width: 120 },
  { title: '类型', dataIndex: 'type', width: 120, customRender: ({ text }) => render.renderDict(text, 'wec_transaction_type') },
  { title: '状态', dataIndex: 'status', width: 120, customRender: ({ text }) => render.renderDict(text, 'wec_transaction_status', true) },
  { title: '时间', dataIndex: 'time', width: 180, customRender: ({ text }) => render.renderDate(text) },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'userName', label: '用户', component: 'JInput' },
  { field: 'deviceName', label: '设备', component: 'JInput' },
  { field: 'type', label: '类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_transaction_type' } },
  { field: 'status', label: '状态', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_transaction_status' } },
];
