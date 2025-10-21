import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

// 出入类型选项
export const typeOptions = [
  { label: '入', value: 'in' },
  { label: '出', value: 'out' },
  { label: '双向', value: 'both' },
];

// 表格列定义
export const columns: BasicColumn[] = [
  {
    title: '读头名称',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: '门名称',
    dataIndex: 'doorName',
    width: 150,
  },
  {
    title: '编号',
    dataIndex: 'num',
    width: 120,
  },
  {
    title: '出入类型',
    dataIndex: 'type',
    width: 100,
    customRender: ({ text }) => {
      const option = typeOptions.find(item => item.value === text);
      if (!option) return text;
      
      const colorMap = {
        'in': 'green',
        'out': 'blue',
        'both': 'orange'
      };
      
      return h(Tag, { color: colorMap[text] || 'default' }, () => option.label);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    sorter: true,
  },
];

// 搜索表单配置
export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '读头名称',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    field: 'doorName',
    label: '门名称',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    field: 'type',
    label: '出入类型',
    component: 'JSelectMultiple',
    componentProps: {
      options: typeOptions,
      placeholder: '请选择出入类型',
    },
    colProps: { span: 6 },
  },
];

// 表单配置
export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '读头名称',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入读头名称',
    },
  },
  {
    field: 'doorName',
    label: '门名称',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入门名称',
    },
  },
  {
    field: 'num',
    label: '编号',
    component: 'JInput',
    componentProps: {
      placeholder: '请输入编号',
    },
  },
  {
    field: 'type',
    label: '出入类型',
    component: 'JSelect',
    required: true,
    componentProps: {
      options: typeOptions,
      placeholder: '请选择出入类型',
    },
  },
];