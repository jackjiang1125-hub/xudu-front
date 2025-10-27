import { BasicColumn, FormSchema } from '/@/components/Table';
import { Tag } from 'ant-design-vue';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: 'Device Name',
    dataIndex: 'name',
    width: 250,
    fixed: 'left',
    customRender: ({ text, record }) => {
      const item = record as any;
      const name = text || '-';
      const type = String(item?.typeText || item?.type || '').trim().toUpperCase();
      const isChild = Boolean(item?.__isChild) || (Boolean(item?.parentId) && type !== 'NVR');
      const badgeClass = ['video-name-badge'];
      let badgeText = '';
      if (type === 'NVR') {
        badgeClass.push('video-name-badge-nvr');
        badgeText = 'NVR';
      } else if (isChild) {
        if (type === 'IPC') {
          badgeClass.push('video-name-badge-ipc');
          badgeText = 'IPC';
        } else {
          badgeClass.push('video-name-badge-child');
          badgeText = type || 'Child';
        }
      }
      const children: any[] = [];
      if (badgeText) {
        children.push(h('span', { class: badgeClass.join(' ') }, badgeText));
      }
      children.push(h('span', { class: 'video-name-text' }, name));
      return h('span', { class: 'video-name-cell' }, children);
    },
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
    customRender: ({ text, record }) => {
      const display = record?.manufacturerText || record?.manufacturer_dictText;
      if (display) {
        return h('span', display);
      }
      return render.renderDict(text, 'xudu_manufacturer');
    },
  },
  {
    title: '所属模块',
    dataIndex: 'model',
    width: 120,
    customRender: ({ text, record }) => {
      const display = record?.modelText || record?.model_dictText;
      if (display) {
        return h('span', display);
      }
      return render.renderDict(text, 'xudu_model_video');
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 120,
    customRender: ({ record }) => {
      const typeValue = String(record?.type ?? '').trim().toLowerCase();
      const display = record?.typeText || record?.type_dictText || record?.type || '-';
      const fallbackText = String(display || '-');
      const fallbackKey = fallbackText.trim().toLowerCase();
      const typeMeta: Record<string, { color: string; label: string; className: string }> = {
        nvr: { color: '#2f54eb', label: 'NVR', className: 'video-type-nvr' },
        ipc: { color: '#389e0d', label: 'IPC', className: 'video-type-ipc' },
      };
      const meta = typeMeta[typeValue] || typeMeta[fallbackKey];
      const tagText = meta ? meta.label : fallbackText;
      const classNames = ['video-type-tag'];
      if (meta?.className) classNames.push(meta.className);
      return h(
        Tag,
        {
          color: meta?.color,
          style: meta
            ? {
                backgroundColor: meta.color,
                borderColor: meta.color,
                color: '#fff',
              }
            : undefined,
          bordered: false,
          class: classNames,
        },
        () => tagText
      );
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
