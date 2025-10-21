import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  { title: '设备名称', dataIndex: 'deviceName', width: 200 },
  { title: '门名称', dataIndex: 'doorName', width: 180 },
  { title: '门编号', dataIndex: 'doorNumber', width: 100 },
  { title: '验证方式', dataIndex: 'verificationMethod', width: 120 },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'deviceName', label: '设备名称', component: 'Input', colProps: { span: 8 } },
  { field: 'doorName', label: '门名称', component: 'Input', colProps: { span: 8 } },
  { field: 'ipAddress', label: 'IP地址', component: 'Input', colProps: { span: 8 } },
];

// 枚举选项
export const verificationMethodOptions = [
  { label: '仅密码', value: '仅密码' },
  { label: '仅卡', value: '仅卡' },
  { label: '密码或卡', value: '密码或卡' },
  { label: '密码和卡', value: '密码和卡' },
];
export const accessStatusOptions = [
  { label: '入', value: '入' },
  { label: '出', value: '出' },
  { label: '双向', value: '双向' },
];
export const contactTypeOptions = [
  { label: '无', value: '无' },
  { label: '常闭', value: '常闭' },
  { label: '常开', value: '常开' },
];

export const formSchema: FormSchema[] = [
  { label: '', field: 'id', component: 'Input', show: false },
  { field: 'deviceName', label: '设备名称', component: 'Input', required: true, colProps: { span: 12 } },
  { field: 'doorName', label: '门名称', component: 'Input', required: true, colProps: { span: 12 } },
  { field: 'doorNumber', label: '门编号', component: 'InputNumber', colProps: { span: 12 } },
  { field: 'ipAddress', label: 'IP地址', component: 'Input', colProps: { span: 12 } },
  {
    field: 'verificationMethod',
    label: '验证方式',
    component: 'Select',
    componentProps: { options: verificationMethodOptions },
    colProps: { span: 12 },
  },
  { field: 'operationInterval', label: '操作间隔(秒)', component: 'InputNumber', colProps: { span: 12 } },
  { field: 'antiBacktrackingDuration', label: '入反潜时长(分)', component: 'InputNumber', colProps: { span: 12 } },
  { field: 'coercionPassword', label: '胁迫密码', component: 'Input', colProps: { span: 12 } },
  { field: 'emergencyPassword', label: '紧急状态密码', component: 'Input', colProps: { span: 12 } },
  { field: 'lockDriveDuration', label: '锁驱动时长(秒)', component: 'InputNumber', colProps: { span: 12 } },
  {
    field: 'hostAccessStatus',
    label: '主机出入状态',
    component: 'Select',
    componentProps: { options: accessStatusOptions },
    colProps: { span: 12 },
  },
  {
    field: 'slaveAccessStatus',
    label: '从机出入状态',
    component: 'Select',
    componentProps: { options: accessStatusOptions },
    colProps: { span: 12 },
  },
  {
    field: 'doorContactType',
    label: '门磁类型',
    component: 'Select',
    componentProps: { options: contactTypeOptions },
    colProps: { span: 12 },
  },
  { field: 'doorContactDelay', label: '门磁延时(秒)', component: 'InputNumber', colProps: { span: 12 } },
  { field: 'multiPersonOpenInterval', label: '多人开门间隔(秒)', component: 'InputNumber', colProps: { span: 12 } },
  { field: 'disableAlarmReminder', label: '禁用报警提醒', component: 'Switch', colProps: { span: 12 } },
  { field: 'doorValidTimeRange', label: '门有效时间段', component: 'Input', colProps: { span: 24 } },
  { field: 'doorAlwaysOpenTime', label: '门常开时间段', component: 'Input', colProps: { span: 24 } },
  { field: 'workScheduleTime', label: '上下班时间段', component: 'Input', colProps: { span: 24 } },
];