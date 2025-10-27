import type { BasicColumn, FormSchema } from '/@/components/Table';

export type RestaurantCategory = 'meal_type' | 'product';
export type DiningServiceType = 'restaurant' | 'supermarket';



export interface RestaurantRecord {
  id: string;
  restaurantCode: string;
  restaurantName: string;
  category: RestaurantCategory;
  diningServiceType: DiningServiceType;
  remark?: string;
}



export const restaurantCategoryOptions = [
  { label: '餐别', value: 'meal_type' },
  { label: '商品', value: 'product' },
];

export const diningServiceTypeOptions = [
  { label: '餐厅', value: 'restaurant' },
  { label: '超市', value: 'supermarket' },
];



export const restaurantColumns: BasicColumn[] = [
  {
    title: '餐厅编码',
    dataIndex: 'restaurantCode',
    width: 150,
    align: 'left',
  },
  {
    title: '餐厅名称',
    dataIndex: 'restaurantName',
    width: 180,
    align: 'left',
  },
  {
    title: '经营模式',
    dataIndex: 'category',
    width: 110,
    align: 'center',
    slots: { customRender: 'category' },
  },
  {
    title: '餐厅类型',
    dataIndex: 'diningServiceType',
    width: 120,
    align: 'center',
    slots: { customRender: 'serviceType' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 160,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

export const restaurantSearchFormSchema: FormSchema[] = [
  {
    field: 'restaurantCode',
    label: '餐厅编码',
    component: 'JInput',
    colProps: { span: 8 },
  },
  {
    field: 'restaurantName',
    label: '餐厅名称',
    component: 'JInput',
    colProps: { span: 8 },
  },
  {
    field: 'category',
    label: '经营模式',
    component: 'JDictSelectTag',
    colProps: { span: 8 },
    componentProps: {
      options: restaurantCategoryOptions,
    },
  },
  {
    field: 'diningServiceType',
    label: '餐厅类型',
    component: 'JDictSelectTag',
    colProps: { span: 8 },
    componentProps: {
      options: diningServiceTypeOptions,
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'JInput',
    show: false,
  },
  {
    field: 'restaurantCode',
    label: '餐厅编码',
    component: 'JInput',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入餐厅编码',
      disabled: false,
    },
    rules: [
      {
        required: true,
        message: '请输入餐厅编码',
      },
    ],
  },
  {
    field: 'restaurantName',
    label: '餐厅名称',
    component: 'JInput',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入餐厅名称',
    },
    rules: [
      {
        required: true,
        message: '请输入餐厅名称',
      },
    ],
  },
  {
    field: 'category',
    label: '经营模式',
    component: 'JDictSelectTag',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      options: restaurantCategoryOptions,
      placeholder: '请选择经营模式',
    },
  },
  {
    field: 'diningServiceType',
    label: '餐厅类型',
    component: 'JDictSelectTag',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      options: diningServiceTypeOptions,
      placeholder: '请选择餐厅类型',
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '请输入备注信息',
      showCount: true,
      maxLength: 500,
    },
  },
];

// 移除mock数据，直接从数据库获取
