// /src/api/sys/userSelector.api.ts
import { defHttp } from '/@/utils/http/axios';

export interface UserSelectorPageParams {
  pageNo?: number;
  pageSize?: number;
  departId?: string;
  realname?: string;
  username?: string;
  userType?: number | string;
}

/** 供前端表格/预览用的简化用户模型 */
export interface SysUserModel {
  id: string;
  username: string;
  realname: string;
  phone?: string;
  orgCodeTxt?: string;
  [key: string]: any;
}

/**
 * 分页查询用户（选人控件专用）
 * 后端接口：/sys/user/queryUserComponentData
 * 默认会带上 userType=2
 */
export function queryUserPage(params: UserSelectorPageParams) {
  return defHttp.get<any>({
    url: '/sys/user/queryUserComponentData',
    params,
  });
}

/**
 * 加载当前可见的部门树
 * 后端接口：/sys/sysDepart/queryMyDeptTreeList
 */
export function fetchDeptTree() {
  return defHttp.get<any>({
    url: '/sys/sysDepart/queryMyDeptTreeList',
  });
}

/**
 * 根据 ID 批量查询用户（用于回填预览）
 * 后端接口：/sys/user/queryByIds
 */
export function getUsersByIds(userIds: string[]) {
  return defHttp.get<SysUserModel[]>({
    url: '/sys/user/queryByIds',
    params: {
      userIds: userIds.join(','),
    },
  });
}
