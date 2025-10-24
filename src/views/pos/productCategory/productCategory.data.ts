import type { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import dayjs from 'dayjs';

export type ProductCategoryStatus = 'enabled' | 'disabled';

export interface ProductCategoryItem {
  id: string;
  categoryCode: string;
  categoryName: string;
  alias: string;
  description: string;
  status: ProductCategoryStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

export const categoryStatusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];

export const categoryColumns: BasicColumn[] = [
  {
    title: '分类编号',
    dataIndex: 'categoryCode',
    width: 140,
    align: 'left',
  },
  {
    title: '分类名称',
    dataIndex: 'categoryName',
    width: 160,
    align: 'left',
  },
  {
    title: '展示别名',
    dataIndex: 'alias',
    width: 160,
    align: 'left',
  },
  {
    title: '排序号',
    dataIndex: 'displayOrder',
    width: 90,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 180
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

export const categorySearchFormSchema: FormSchema[] = [
  {
    label: '分类名称',
    field: 'categoryName',
    component: 'Input',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '支持模糊查询分类名称或别名',
    },
  },
  {
    label: '分类编号',
    field: 'categoryCode',
    component: 'Input',
    colProps: { span: 6 },
    componentProps: {
      placeholder: '请输入分类编号',
    },
  },

  {
    label: '状态',
    field: 'status',
    component: 'Select',
    colProps: { span: 6 },
    componentProps: {
      allowClear: true,
      options: categoryStatusOptions,
    },
  },
  {
    label: '创建时间',
    field: 'createdAtRange',
    component: 'RangePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    },
  },
];

// 表单配置
export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    show: false,
  },
  {    field: 'categoryCode',    label: '分类编号',    component: 'JInput',    required: true,    componentProps: {      placeholder: '请输入分类编号',      maxLength: 20,    },  },
  {
    field: 'categoryName',
    label: '分类名称',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    field: 'alias',
    label: '展示别名',
    component: 'JInput',
    required: true,
    componentProps: {
      placeholder: '请输入展示别名',
      maxLength: 50,
    },
  },
  {
    field: 'description',
    label: '分类简介',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入分类简介',
      maxLength: 200,
      rows: 3,
    },
  },
  {
    field: 'displayOrder',
    label: '排序号',
    component: 'InputNumber',
    required: true,
    defaultValue: 0,
    componentProps: {
      min: 0,
      placeholder: '请输入排序号',
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'JDictSelectTag',
    required: true,
    defaultValue: 'enabled',
    componentProps: {
      placeholder: '请选择状态',
      options: categoryStatusOptions,
    },
  },
  {
    field: 'remark',
    label: '备注信息',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入备注信息',
      maxLength: 500,
      rows: 2,
    },
  },
];
