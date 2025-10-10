import type { BasicColumn, FormSchema } from '/@/components/Table';

export type ProductCategoryStatus = 'enabled' | 'disabled';

export interface ProductCategoryItem {
  id: string;
  categoryCode: string;
  categoryName: string;
  alias: string;
  description: string;
  status: ProductCategoryStatus;
  productCount: number;
  manager: string;
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
    title: '商品数量',
    dataIndex: 'productCount',
    width: 110,
  },
  {
    title: '排序号',
    dataIndex: 'displayOrder',
    width: 90,
  },
  {
    title: '负责人',
    dataIndex: 'manager',
    width: 120,
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
    dataIndex: 'createdAt',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
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
  },
  {
    label: '负责人',
    field: 'manager',
    component: 'Input',
    colProps: { span: 6 },
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

export const mockProductCategoryList: ProductCategoryItem[] = [
  {
    id: 'PC-1001',
    categoryCode: 'BEV',
    categoryName: '饮料冲调',
    alias: '饮料区',
    description: '含瓶装饮料、粉末冲调、功能饮料等系列商品',
    status: 'enabled',
    productCount: 24,
    manager: '李华',
    displayOrder: 1,
    createdAt: '2025-09-01 09:30:00',
    updatedAt: '2025-09-28 14:20:00',
    remark: '重点关注新品推广效果',
  },
  {
    id: 'PC-1002',
    categoryCode: 'SNK',
    categoryName: '休闲零食',
    alias: '零食屋',
    description: '薯片、坚果、饼干糕点等休闲类商品集合',
    status: 'enabled',
    productCount: 38,
    manager: '王敏',
    displayOrder: 2,
    createdAt: '2025-08-18 10:15:00',
    updatedAt: '2025-09-30 18:42:00',
  },
  {
    id: 'PC-1003',
    categoryCode: 'FRU',
    categoryName: '果蔬生鲜',
    alias: '鲜果吧',
    description: '精选时令水果、即切果盘、沙拉组合',
    status: 'enabled',
    productCount: 18,
    manager: '赵倩',
    displayOrder: 3,
    createdAt: '2025-06-02 08:50:00',
    updatedAt: '2025-09-21 11:05:00',
  },
  {
    id: 'PC-1004',
    categoryCode: 'BAK',
    categoryName: '烘焙面点',
    alias: '烘焙坊',
    description: '鲜制面包、蛋糕甜品、预包装烘焙产品',
    status: 'disabled',
    productCount: 12,
    manager: '陈亮',
    displayOrder: 4,
    createdAt: '2025-05-12 07:40:00',
    updatedAt: '2025-09-10 16:30:00',
    remark: '原材料供应调整中，暂停售卖',
  },
  {
    id: 'PC-1005',
    categoryCode: 'HOT',
    categoryName: '即热餐饮',
    alias: '热食区',
    description: '包含便当、汤品、炸物等即热食品',
    status: 'enabled',
    productCount: 15,
    manager: '周杰',
    displayOrder: 5,
    createdAt: '2025-04-26 11:18:00',
    updatedAt: '2025-09-25 13:25:00',
  },
  {
    id: 'PC-1006',
    categoryCode: 'DAI',
    categoryName: '日用百货',
    alias: '日用区',
    description: '办公用品、个人清洁、一次性耗材等',
    status: 'enabled',
    productCount: 42,
    manager: '刘洁',
    displayOrder: 6,
    createdAt: '2025-03-15 09:05:00',
    updatedAt: '2025-09-14 09:56:00',
  },
  {
    id: 'PC-1007',
    categoryCode: 'GIF',
    categoryName: '礼品卡券',
    alias: '福利卡券',
    description: '企业福利卡、门店代金券、联合促销券',
    status: 'enabled',
    productCount: 9,
    manager: '蒋楠',
    displayOrder: 7,
    createdAt: '2025-01-08 10:22:00',
    updatedAt: '2025-09-02 17:35:00',
  },
  {
    id: 'PC-1008',
    categoryCode: 'HEA',
    categoryName: '健康轻食',
    alias: '轻食区',
    description: '沙拉、代餐棒、低糖零食与功能性饮品',
    status: 'enabled',
    productCount: 21,
    manager: '苏远',
    displayOrder: 8,
    createdAt: '2025-02-20 08:20:00',
    updatedAt: '2025-09-27 19:08:00',
  },
];

export const productCategorySelectOptions = mockProductCategoryList.map((item) => ({
  label: item.categoryName,
  value: item.categoryCode,
}));
