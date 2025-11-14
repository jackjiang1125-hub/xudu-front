import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { dateUtil } from '/@/utils/dateUtil';

export const columns: BasicColumn[] = [
  { title: '设备', dataIndex: 'deviceName', width: 220, customRender: ({ record }) => `${record?.deviceName ?? ''}（${record?.sn ?? ''}）` },
  { title: '记录时间', dataIndex: 'logTime', width: 180 },
  { title: '抓拍照片', dataIndex: 'mediaFile', width: 80, customRender: render.renderImage },
  { title: '用户PIN', dataIndex: 'pin', width: 120 },
  { title: '卡号', dataIndex: 'cardNo', width: 120 },
  // { title: '事件地址', dataIndex: 'eventAddr', width: 100 },
  { title: '门名称', dataIndex: 'doorName', width: 160 },
  { title: '事件代码', dataIndex: 'eventCode', width: 100, customRender: ({ text }) => render.renderDict(text, 'acc_event_type') },
  { title: '进出状态', dataIndex: 'inoutStatus', width: 100, customRender: ({ text }) => render.renderDict(text, 'acc_inout_status') },
  { title: '验证方式', dataIndex: 'verifyType', width: 120, customRender: ({ text }) => render.renderDict(text, 'acc_verify_type') },
  // { title: '记录索引', dataIndex: 'recordIndex', width: 120 },
  // { title: '站点代码', dataIndex: 'siteCode', width: 100 },
  // { title: '链路ID', dataIndex: 'linkId', width: 100 },
  // { title: '口罩标识', dataIndex: 'maskFlag', width: 100 },
  // { title: '温度', dataIndex: 'temperature', width: 100 },
  // { title: '转换温度', dataIndex: 'convTemperature', width: 120 },
  // { title: '客户端IP', dataIndex: 'clientIp', width: 140 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'sn', label: '设备序列号', component: 'JInput' },
  { field: 'pin', label: '用户PIN', component: 'JInput' },
  { field: 'cardNo', label: '卡号', component: 'JInput' },
  { field: 'eventCode', label: '事件代码', component: 'JDictSelectTag', componentProps: { dictCode: 'acc_event_type' } },
  { field: 'verifyType', label: '验证方式', component: 'JDictSelectTag', componentProps: { dictCode: 'acc_verify_type' } },
  { field: 'logTime', label: '记录时间', component: 'RangePicker', defaultValue: [dateUtil().startOf('day'), dateUtil().endOf('day')], componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss', placeholder: ['开始时间', '结束时间'] } },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'sn', label: '设备序列号', component: 'JInput', required: true },
  { field: 'logTime', label: '记录时间', component: 'DatePicker', required: true, componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' } },
  { field: 'pin', label: '用户PIN', component: 'JInput' },
  { field: 'cardNo', label: '卡号', component: 'JInput' },
  { field: 'eventAddr', label: '事件地址', component: 'InputNumber' },
  { field: 'eventCode', label: '事件代码', component: 'InputNumber' },
  { field: 'inoutStatus', label: '进出状态', component: 'InputNumber' },
  { field: 'verifyType', label: '验证方式', component: 'InputNumber' },
  { field: 'recordIndex', label: '记录索引', component: 'InputNumber' },
  { field: 'siteCode', label: '站点代码', component: 'InputNumber' },
  { field: 'linkId', label: '链路ID', component: 'InputNumber' },
  { field: 'maskFlag', label: '口罩标识', component: 'InputNumber' },
  { field: 'temperature', label: '温度', component: 'InputNumber' },
  { field: 'convTemperature', label: '转换温度', component: 'InputNumber' },
  { field: 'clientIp', label: '客户端IP', component: 'JInput' },
  { field: 'rawPayload', label: '原始载荷', component: 'JInput' },
];