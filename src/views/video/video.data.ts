import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '视频流名称',
    dataIndex: 'name',
    width: 150,
    fixed: 'left',
  },
  {
    title: '设备IP',
    dataIndex: 'ip',
    width: 120,
  },
  {
    title: '端口',
    dataIndex: 'port',
    width: 80,
  },
  {
    title: '制造商',
    dataIndex: 'manufacturer',
    width: 120,
    customRender: ({ text }) => render.renderDict(text, 'xudu_manufacturer'),
  },
  {
    title: '所属模块',
    dataIndex: 'model',
    width: 120,
    customRender: ({ text }) => render.renderDict(text, 'xudu_model_video'),
  },
  {
    title: '监控类型',
    dataIndex: 'type',
    width: 100,
    customRender: ({ text }) => render.renderDict(text, 'xudu_video_type'),
  },
  {
    title: '在线状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const statusMap = {
        'online': { text: '在线', color: '#52c41a' },
        'offline': { text: '离线', color: '#ff4d4f' },
        '1': { text: '在线', color: '#52c41a' },
        '0': { text: '离线', color: '#ff4d4f' },
        true: { text: '在线', color: '#52c41a' },
        false: { text: '离线', color: '#ff4d4f' }
      };
      const statusInfo = statusMap[text] || { text: text, color: '#666' };
      return h('span', { style: { color: statusInfo.color, fontWeight: 'bold' } }, statusInfo.text);
    },
  },
  {
    title: '流名称',
    dataIndex: 'stream',
    width: 150,
  },
  {
    title: '应用名',
    dataIndex: 'app',
    width: 100,
  },
  {
    title: 'HLS地址',
    dataIndex: 'hlsUrl',
    width: 200,
    ellipsis: true,
  },
  {
    title: 'WebRTC地址',
    dataIndex: 'webRtcUrl',
    width: 200,
    ellipsis: true,
  },
  {
    title: '视频编码',
    dataIndex: 'videoCodec',
    width: 100,
  },
  {
    title: '音频编码',
    dataIndex: 'audioCodec',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    customRender: ({ text }) => render.renderDate(text),
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '视频流名称',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入视频流名称',
    },
  },
  {
    field: 'ip',
    label: '设备IP',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入设备IP',
    },
  },
  {
    field: 'port',
    label: '端口',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入端口',
    },
  },
  {
    field: 'manufacturer',
    label: '制造商',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'xudu_manufacturer',
      placeholder: '请选择制造商',
    },
  },
  {
    field: 'model',
    label: '所属模块',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'xudu_model_video',
      placeholder: '请选择所属模块',
    },
  },
  {
    field: 'type',
    label: '监控类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'xudu_video_type',
      placeholder: '请选择监控类型',
    },
  },
  {
    field: 'status',
    label: '在线状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '在线', value: 'online' },
        { label: '离线', value: 'offline' },
      ],
      placeholder: '请选择在线状态',
    },
  },
  {
    field: 'stream',
    label: '流名称',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入流名称',
    },
  },
  {
    field: 'app',
    label: '应用名',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入应用名',
    },
  },
  {
    field: 'createTime',
    label: '创建时间',
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择创建时间',
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '视频流名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入视频流名称',
    },
    rules: [
      {
        required: true,
        message: '请输入视频流名称',
      },
    ],
  },
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入用户名',
    },
    rules: [
      {
        required: true,
        message: '请输入用户名',
      },
    ],
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    required: true,
    componentProps: {
      placeholder: '请输入密码',
    },
    rules: [
      {
        required: true,
        message: '请输入密码',
      },
    ],
  },
  {
    field: 'ip',
    label: '设备IP',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入设备IP',
    },
    rules: [
      {
        required: true,
        message: '请输入设备IP',
      },
    ],
  },
  {
    field: 'port',
    label: '端口',
    component: 'Input',
    componentProps: {
      placeholder: '请输入端口',
    },
  },
  {
    field: 'manufacturer',
    label: '制造商',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'xudu_manufacturer',
      placeholder: '请选择制造商',
    },
    rules: [
      {
        required: true,
        message: '请选择制造商',
      },
    ],
  },
  {
    field: 'model',
    label: '所属模块',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'xudu_device_type',
    ///  disabled: true,
      allowClear: false,
      showSearch: false,
      placeholder: '',
    },
  },
  {
    field: 'type',
    label: '监控类型',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'xudu_video_type',
      placeholder: '请选择监控类型',
    },
    rules: [
      {
        required: true,
        message: '请选择监控类型',
      },
    ],
  },
  {
    field: 'app',
    label: '应用名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入应用名',
      defaultValue: 'xudu',
    },
  },
  {
    field: 'status',
    label: '在线状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '在线', value: 'online' },
        { label: '离线', value: 'offline' },
      ],
      placeholder: '请选择在线状态',
    },
  },
];
