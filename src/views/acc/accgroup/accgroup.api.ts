import { defHttp } from '/@/utils/http/axios';

export interface AccGroupVO {
  id?: string;
  groupName: string;
  periodId?: string;
  periodName?: string;
  remark?: string;
  createTime?: string;
  memberCount?: number;
  deviceCount?: number;
  members?: string[];
  devices?: string[];
}

export interface AccMemberVO {
  id: string;
  memberName?: string;
  memberCode?: string;
  department?: string;
  position?: string;
  status?: string;
  remark?: string;
}

export interface AccDeviceVO {
  id: string;
  deviceName?: string;
  deviceCode?: string;
  deviceType?: string;
  location?: string;
  status?: string;
  ipAddress?: string;
  remark?: string;
}

enum Api {
  list = '/acc/accgroup/list',
  detail = '/acc/accgroup/detail',
  add = '/acc/accgroup/add',
  edit = '/acc/accgroup/edit',
  delete = '/acc/accgroup/delete',
  deleteBatch = '/acc/accgroup/deleteBatch',
  listMembers = '/acc/accgroupmember/listByGroup',
  listDevices = '/acc/accgroupdevice/listByGroup',
  addMembers = '/acc/accgroupmember/addMembers',
  removeMembers = '/acc/accgroupmember/removeMembers',
  addDevices = '/acc/accgroupdevice/addDevices',
  removeDevices = '/acc/accgroupdevice/removeDevices',
}

export const listAccGroups = (params?: Record<string, any>) =>
  defHttp.get({ url: Api.list, params });

export const getAccGroupDetail = (id: string) =>
  defHttp.get({ url: Api.detail, params: { id } }, { joinParamsToUrl: true });

export const addAccGroup = (vo: AccGroupVO) =>
  defHttp.post({ url: Api.add, params: vo });

export const editAccGroup = (vo: AccGroupVO) =>
  defHttp.put({ url: Api.edit, params: vo });

export const deleteAccGroup = (id: string) =>
  defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export const deleteBatchAccGroup = (ids: string) =>
  defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });

// 根据权限组ID查询成员列表
export const listAccGroupMembers = (groupId: string, pageNo: number = 1, pageSize: number = 10) =>
  defHttp.get({ url: Api.listMembers, params: { groupId, pageNo, pageSize } });

// 根据权限组ID查询设备列表
export const listAccGroupDevices = (groupId: string, pageNo: number = 1, pageSize: number = 10) =>
  defHttp.get({ url: Api.listDevices, params: { groupId, pageNo, pageSize } });

// 批量添加成员到权限组
export const addMembersToGroup = (groupId: string, ids: string[]) =>
  defHttp.post({ url: Api.addMembers, data: { groupId, ids } });

// 批量从权限组移除成员
export const removeMembersFromGroup = (groupId: string, ids: string[]) =>
  defHttp.post({ url: Api.removeMembers, data: { groupId, ids } });

// 批量添加设备到权限组
export const addDevicesToGroup = (groupId: string, ids: string[]) =>
  defHttp.post({ url: Api.addDevices, data: { groupId, ids } });

// 批量从权限组移除设备
export const removeDevicesFromGroup = (groupId: string, ids: string[]) =>
  defHttp.post({ url: Api.removeDevices, data: { groupId, ids } });