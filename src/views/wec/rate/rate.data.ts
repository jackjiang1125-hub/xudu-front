import type { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { ajaxGetDictItems } from '/@/utils/dict/index';

let RATE_TYPE_CACHE: Array<{ value: string; text: string }> = [];
export async function initRateTypeDict() {
  const res = await ajaxGetDictItems('wec_rate_type');
  RATE_TYPE_CACHE = Array.isArray(res) ? res : [];
}

const workModeLabel: Record<string, string> = {
  real_time: '实时扣费',
  pre_deduct: '预扣费',
  per_count: '计次消费',
};

const deductionLabel: Record<string, string> = {
  timed: '计时',
  pulse: '脉冲',
};

export const columns: BasicColumn[] = [
  { title: '模板名称', dataIndex: 'templateName', width: 180 },
  { title: '费率类型', dataIndex: 'type', width: 140, customRender: ({ text }) => {
    const v = String(text ?? '').trim();
    const hit = RATE_TYPE_CACHE.find((i) => String(i.value) === v);
    const label = hit ? hit.text : v;
    return render.renderTag(label);
  } },
  { title: '免费时间(秒)', dataIndex: 'freeSeconds', width: 140 },
  { title: '工作模式', dataIndex: 'workMode', width: 140, customRender: ({ text }) => workModeLabel[String(text)] || String(text) },
  { title: '扣费方式', dataIndex: 'deductionMethod', width: 120, customRender: ({ text }) => deductionLabel[String(text)] || String(text) },
];

export const searchFormSchema: FormSchema[] = [
  { field: 'templateName', label: '模板名称', component: 'JInput' },
  { field: 'type', label: '费率类型', component: 'JDictSelectTag', componentProps: { dictCode: 'wec_rate_type' } },
  {
    field: 'workMode',
    label: '工作模式',
    component: 'Select',
    componentProps: {
      options: [
        { label: '实时扣费', value: 'real_time' },
        { label: '预扣费', value: 'pre_deduct' },
        { label: '计次消费', value: 'per_count' },
      ],
      allowClear: true,
    },
  },
];

export const formSchema: FormSchema[] = [
  { field: 'id', component: 'Input', show: false },
  { field: 'templateName', label: '模板名称', component: 'JInput', required: true },
  { field: 'type', label: '费率类型', component: 'JDictSelectTag', required: true, componentProps: { dictCode: 'wec_rate_type' } },
  {
    field: 'freeSeconds',
    label: '免费时间',
    component: 'InputNumber',
    required: true,
    componentProps: { min: 0, placeholder: '单位秒' },
  },
  {
    field: 'workMode',
    label: '设置工作模式',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '实时扣费', value: 'real_time' },
        { label: '预扣费', value: 'pre_deduct' },
        { label: '计次消费', value: 'per_count' },
      ],
    },
  },
  {
    field: 'deductionMethod',
    label: '扣费方式',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '计时', value: 'timed' },
        { label: '脉冲', value: 'pulse' },
      ],
    },
  },
  {
    field: 'realTimeAmount',
    label: '实时扣费金额',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'real_time',
    componentProps: { min: 0 },
  },
  {
    field: 'realTimeDuration',
    label: '实时扣费时间(秒)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'real_time',
    componentProps: { min: 1, placeholder: '单位秒' },
  },
  {
    field: 'preDeductTime',
    label: '预扣费时间(秒)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'pre_deduct',
    componentProps: { min: 1, placeholder: '单位秒' },
  },
  {
    field: 'preDeductRate',
    label: '费率',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'pre_deduct',
    componentProps: { min: 0 },
  },
  {
    field: 'preDeductAmount',
    label: '预扣费金额',
    component: 'InputNumber',
    ifShow: ({ values }) => values.workMode === 'pre_deduct',
    componentProps: { disabled: true },
  },
  {
    field: 'perTimeDuration',
    label: '计次时间(秒)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'per_count',
    componentProps: { min: 1, placeholder: '单位秒' },
  },
];
