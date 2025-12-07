import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Form';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  { title: '交易号', dataIndex: 'tradeNo', width: 180 },
  { title: '卡号', dataIndex: 'cardNo', width: 150 },
  { title: '用户姓名', dataIndex: 'userName', width: 120 },
  { title: '设备名称', dataIndex: 'deviceName', width: 150 },
  { title: '金额', dataIndex: 'amount', width: 100 },
  { title: '余额', dataIndex: 'balance', width: 100 },
  { 
    title: '类型', 
    dataIndex: 'type', 
    width: 100, 
    customRender: ({ text }) => {
      const map: Record<string, string> = { '1': '消费', '2': '充值', '3': '退款' };
      return map[text] || text;
    }
  },
  { 
    title: '状态', 
    dataIndex: 'status', 
    width: 100, 
    customRender: ({ text }) => {
      const map: Record<string, string> = { '1': '成功', '0': '失败' };
      return map[text] || text;
    }
  },
  { title: '交易时间', dataIndex: 'consumeTime', width: 180 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'userName', label: '用户姓名', component: 'JInput', colProps: { span: 6 } },
  { field: 'cardNo', label: '卡号', component: 'JInput', colProps: { span: 6 } },
  { field: 'deviceName', label: '设备名称', component: 'JInput', colProps: { span: 6 } },
  { 
    field: 'type', 
    label: '类型', 
    component: 'Select', 
    componentProps: {
      options: [
        { label: '消费', value: '1' },
        { label: '充值', value: '2' },
        { label: '退款', value: '3' },
      ]
    },
    colProps: { span: 6 }
  },
];
