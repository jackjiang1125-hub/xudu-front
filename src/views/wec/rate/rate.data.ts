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
    field: 'deductionMethod',
    label: '扣费方式',
    component: 'RadioGroup',
    required: true,
    defaultValue: 'timed',
    componentProps: {
      options: [
        { label: '计时', value: 'timed' },
        { label: '计量（脉冲）', value: 'pulse' },
      ],
    },
  },
  {
    field: 'workMode',
    label: '工作模式',
    component: 'RadioGroup',
    required: true,
    defaultValue: 'real_time',
    componentProps: {
      options: [
        { label: '实时扣费', value: 'real_time' },
        { label: '预扣费', value: 'pre_deduct' },
        { label: '计次消费', value: 'per_count' },
      ],
    },
  },
  // 实时扣费字段
  {
    field: 'realTimeAmount',
    label: '扣费金额(元)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'real_time',
    componentProps: { min: 0.01, step: 0.01, placeholder: '如：0.1元' },
  },
  {
    field: 'realTimeDuration',
    label: '时间/脉冲数',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'real_time',
    componentProps: ({ formModel }) => ({
      min: 1,
      step: 1,
      placeholder: formModel.deductionMethod === 'pulse' ? '单位：个脉冲' : '单位：秒',
      addonAfter: formModel.deductionMethod === 'pulse' ? '脉冲' : '秒',
    }),
  },
  // 预扣费字段
  {
    field: 'preDeductAmount',
    label: '预扣金额(元)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'pre_deduct',
    componentProps: { min: 0.01, step: 0.01, placeholder: '如：5.00元' },
  },
  {
    field: 'preDeductRate',
    label: '费率(元/单位)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'pre_deduct',
    componentProps: ({ formModel }) => ({
      min: 0.0001,
      step: 0.01,
      placeholder: formModel.deductionMethod === 'pulse' ? '如：0.05元/脉冲' : '如：0.05元/秒',
      addonAfter: formModel.deductionMethod === 'pulse' ? '元/脉冲' : '元/秒',
    }),
  },
  // 计次字段
  {
    field: 'perCountAmount',
    label: '单次金额(元)',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'per_count',
    componentProps: { min: 0.01, step: 0.01, placeholder: '如：2.00元' },
  },
  {
    field: 'perTimeDuration',
    label: '单次用水量/时长',
    component: 'InputNumber',
    required: true,
    ifShow: ({ values }) => values.workMode === 'per_count',
    componentProps: ({ formModel }) => ({
      min: 1,
      step: 1,
      placeholder: formModel.deductionMethod === 'pulse' ? '单位：个脉冲' : '单位：秒',
      addonAfter: formModel.deductionMethod === 'pulse' ? '脉冲' : '秒',
    }),
  },
];
