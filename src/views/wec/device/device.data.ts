import type { BasicColumn, FormSchema } from '/@/components/Table';
import { listRateTemplates } from '/@/views/wec/rate/rate.api';
import { listLocations } from '/@/views/wec/location/location.api';

export const columns: BasicColumn[] = [
  { title: '设备名称', dataIndex: 'deviceName', width: 160 },
  { title: '在线', dataIndex: 'onlineStatus', width: 80, slots: { customRender: 'onlineStatus' } },
  { title: '机号（系列号）', dataIndex: 'sn', width: 140 },
  { title: '安装位置', dataIndex: 'installLocation_dictText', width: 180 },
  { title: '费率模板', dataIndex: 'rateTemplateId_dictText', width: 160 },
  { title: '状态', dataIndex: 'status', width: 100, customRender: ({ text }) => {
    return text === '1' ? '启用' : '停用';
  } },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'deviceName', label: '设备名称', component: 'JInput' },
  { field: 'deviceType', label: '设备类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_device_type' } },
  { field: 'status', label: '状态', component: 'JDictSelectTag', componentProps: { dictCode: 'device_status' } },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'deviceName', label: '设备名称', component: 'JInput', required: true },
  { field: 'sn', label: '机号', component: 'InputNumber', required: true, dynamicDisabled: ({ values }) => !!values.id },
  { field: 'installLocation', label: '安装位置', component: 'ApiSelect', componentProps: { api: listLocations, labelField: 'locationName', valueField: 'id' } },
  { field: 'rateTemplateId', label: '费率模板', component: 'ApiSelect', componentProps: { api: listRateTemplates, labelField: 'templateName', valueField: 'id' } },
  { field: 'maxTimeMinutes', label: '最大时长(分钟)', component: 'InputNumber', componentProps: { min: 1 } },
  { field: 'maxVolumeLiters', label: '最大计量(升/度)', component: 'InputNumber', componentProps: { min: 0 } },
  { field: 'qrEnabled', label: '二维码启用', component: 'JSwitch', defaultValue: '1', componentProps: { options: ['1','0'], labelOptions: ['启用','禁用'] } },
  { field: 'allowOffline', label: '允许脱机', component: 'JSwitch', defaultValue: '0', componentProps: { options: ['1','0'], labelOptions: ['是','否'] } },
];
