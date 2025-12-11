import type { BasicColumn } from '/@/components/Table/src/types/table';
import type { SysUserModel, SimpleDeptModel } from '/@/api/sys/userSelector.api';

// 人员列表列配置（右侧主表）
export const userColumns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'realname',
    width: 140,
  },
  // {
  //   title: '账号',
  //   dataIndex: 'username',
  //   width: 140,
  // },
  {
    title: '部门/班级',
    dataIndex: 'orgCodeTxt', // 这里用 orgCodeTxt
    width: 220,
    ellipsis: true,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 160,
  },
];

// 已选人员预览列
export const userPreviewColumns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'realname',
    width: 140,
  },
  // {
  //   title: '账号',
  //   dataIndex: 'username',
  //   width: 140,
  // },
  {
    title: '部门/班级',
    dataIndex: 'orgCodeTxt',
    width: 220,
    ellipsis: true,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 160,
  },
];

// 已选部门预览列（目前简单展示，后面改“按部门选人”时可以再丰富）
export const deptPreviewColumns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'title',
    width: 260,
  },
  {
    title: 'ID',
    dataIndex: 'id',
    width: 200,
  },
  {
    title: '路径',
    dataIndex: 'path',
    width: 260,
    ellipsis: true,
  },
];

// 导出一下类型，方便外部引用
export type { SysUserModel, SimpleDeptModel };
