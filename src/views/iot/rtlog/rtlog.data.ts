import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '设备序列号',
    dataIndex: 'sn',
    width: 150,
    fixed: 'left',
  },
  {
    title: '记录时间',
    dataIndex: 'logTime',
    width: 160,
    customRender: ({ text }) => {
      if (!text) return '';
      return new Date(text).toLocaleString('zh-CN');
    },
  },
  {
    title: '用户PIN',
    dataIndex: 'pin',
    width: 100,
  },
  {
    title: '卡号',
    dataIndex: 'cardNo',
    width: 120,
  },
  {
    title: '事件地址',
    dataIndex: 'eventAddr',
    width: 100,
  },
  {
    title: '事件代码',
    dataIndex: 'eventCode',
    width: 100,
  },
  {
    title: '进出状态',
    dataIndex: 'inoutStatus',
    width: 100,
    customRender: ({ text }) => {
      const statusMap = {
        0: { text: '出', color: 'orange' },
        1: { text: '进', color: 'green' },
      };
      const status = statusMap[text];
      if (status) {
        return render.renderTag(status.text, status.color);
      }
      return text;
    },
  },
  {
    title: '验证方式',
    dataIndex: 'verifyType',
    width: 100,
    customRender: ({ text }) => {
      const typeMap = {
        1: '密码',
        2: '卡片',
        3: '密码+卡片',
        4: '指纹',
        5: '指纹+密码',
        6: '指纹+卡片',
        7: '指纹+密码+卡片',
        8: '人脸',
        9: '人脸+密码',
        10: '人脸+卡片',
        11: '人脸+密码+卡片',
        15: '人脸',
        200: '其他',
      };
      return typeMap[text] || text;
    },
  },
  {
    title: '记录索引',
    dataIndex: 'recordIndex',
    width: 100,
  },
  {
    title: '客户端IP',
    dataIndex: 'clientIp',
    width: 130,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'sn',
    label: '设备序列号',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入设备序列号',
    },
    colProps: { span: 6 },
  },
  {
    field: 'pin',
    label: '用户PIN',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入用户PIN',
    },
    colProps: { span: 6 },
  },
  {
    field: 'cardNo',
    label: '卡号',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入卡号',
    },
    colProps: { span: 6 },
  },
  {
    field: 'inoutStatus',
    label: '进出状态',
    component: 'JSelect',
    componentProps: {
      placeholder: '请选择进出状态',
      options: [
        { label: '进', value: 1 },
        { label: '出', value: 0 },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'verifyType',
    label: '验证方式',
    component: 'JSelect',
    componentProps: {
      placeholder: '请选择验证方式',
      options: [
        { label: '密码', value: 1 },
        { label: '卡片', value: 2 },
        { label: '密码+卡片', value: 3 },
        { label: '指纹', value: 4 },
        { label: '指纹+密码', value: 5 },
        { label: '指纹+卡片', value: 6 },
        { label: '指纹+密码+卡片', value: 7 },
        { label: '人脸', value: 8 },
        { label: '人脸+密码', value: 9 },
        { label: '人脸+卡片', value: 10 },
        { label: '人脸+密码+卡片', value: 11 },
        { label: '掌纹', value: 15 },
        { label: '其他', value: 200 },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'logTime',
    label: '记录时间',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    colProps: { span: 12 },
  },
];
