import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
// import { dateUtil } from '/@/utils/dateUtil';

export const columns: BasicColumn[] = [
  {
    title: '设备序列号',
    dataIndex: 'sn',
    width: 150,
    fixed: 'left',
  },
  {
    title: '命令代码',
    dataIndex: 'commandCode',
    width: 120,
  },
  {
    title: '命令内容',
    dataIndex: 'commandContent',
    width: 300,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const statusMap = {
        'PENDING': { text: '待发送', color: 'orange' },
        'SENT': { text: '已发送', color: 'blue' },
        'ACKED': { text: '已确认', color: 'green' },
        'FAILED': { text: '失败', color: 'red' },
      };
      const status = statusMap[text] || { text: text, color: 'default' };
      return render.renderTag(status.text, status.color);
    },
  },
  {
    title: '入队时间',
    dataIndex: 'enqueueTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
  {
    title: '发送时间',
    dataIndex: 'sentTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
  {
    title: '确认时间',
    dataIndex: 'ackTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
  {
    title: '结果代码',
    dataIndex: 'resultCode',
    width: 100,
  },
  {
    title: '结果消息',
    dataIndex: 'resultMessage',
    width: 200,
    ellipsis: true,
  },
  {
    title: '最后报告IP',
    dataIndex: 'lastReportIp',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
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
  },
  {
    field: 'commandCode',
    label: '命令代码',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入命令代码',
    },
  },
  {
    field: 'createTime',
    label: '创建时间',
    component: 'JDatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择创建时间',
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'sn',
    label: '设备序列号',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入设备序列号',
    },
    rules: [
      {
        required: true,
        message: '请输入设备序列号',
      },
    ],
  },
  {
    field: 'commandCode',
    label: '命令代码',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入命令代码',
    },
    rules: [
      {
        required: true,
        message: '请输入命令代码',
      },
    ],
  },
  {
    field: 'commandContent',
    label: '命令内容',
    component: 'JTextarea',
    required: true,
    componentProps: {
      placeholder: '请输入命令内容',
      rows: 6,
    },
    rules: [
      {
        required: true,
        message: '请输入命令内容',
      },
    ],
  },
  {
    field: 'status',
    label: '状态',
    component: 'JSelect',
    required: true,
    componentProps: {
      options: [
        { label: '待发送', value: 'PENDING' },
        { label: '已发送', value: 'SENT' },
        { label: '已确认', value: 'ACKNOWLEDGED' },
        { label: '失败', value: 'FAILED' },
        { label: '超时', value: 'TIMEOUT' },
      ],
      placeholder: '请选择状态',
    },
    rules: [
      {
        required: true,
        message: '请选择状态',
      },
    ],
  },
];
