import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/acc/door/list',
  listByGroup = '/acc/door/listByGroup',
  detail = '/acc/door/detail',
  add = '/acc/door/add',
  edit = '/acc/door/edit',
  delete = '/acc/door/delete',
  remoteOpen = '/acc/door/remoteOpen',
  remoteClose = '/acc/door/remoteClose',
  remoteCancelAlarm = '/acc/door/remoteCancelAlarm',
  remoteHoldOpen = '/acc/door/remoteHoldOpen',
  remoteLock = '/acc/door/remoteLock',
  remoteUnlock = '/acc/door/remoteUnlock',
}

/**
 * 列表查询
 */
export const listDoor = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 按权限组查询门列表
 */
export const listDoorByGroup = (groupId: string, pageNo = 1, pageSize = 10) => {
  return defHttp.get({ url: Api.listByGroup, params: { groupId, pageNo, pageSize } });
};

/**
 * 查询详情
 */
export const getDoorDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};

/**
 * 新增
 */
export const addDoor = (params) => {
  return defHttp.post({ url: Api.add, params });
};

/**
 * 更新
 */
export const updateDoor = (params) => {
  return defHttp.put({ url: Api.edit, params });
};

/**
 * 删除
 */
export const deleteDoor = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp
        .delete({ url: Api.delete, data: params }, { joinParamsToUrl: true })
        .then(() => {
          handleSuccess && handleSuccess();
        });
    },
  });
};

/**
 * 远程开门（批量）
 */
export const remoteOpenDoor = (ids: string[], pulseSeconds?: number) => {
  return defHttp.post({ url: Api.remoteOpen, params: { ids, pulseSeconds } });
};

/**
 * 远程关门（批量）
 */
export const remoteCloseDoor = (ids: string[]) => {
  return defHttp.post({ url: Api.remoteClose, params: { ids } });
};

/**
 * 取消报警（批量）
 */
export const remoteCancelAlarm = (ids: string[]) => {
  return defHttp.post({ url: Api.remoteCancelAlarm, params: { ids } });
};

/**
 * 远程常开（批量）
 */
export const remoteHoldOpen = (ids: string[]) => {
  return defHttp.post({ url: Api.remoteHoldOpen, params: { ids } });
};

/**
 * 远程锁定（批量）
 */
export const remoteLockDoor = (ids: string[]) => {
  return defHttp.post({ url: Api.remoteLock, params: { ids } });
};

/**
 * 远程解锁（批量）
 */
export const remoteUnlockDoor = (ids: string[]) => {
  return defHttp.post({ url: Api.remoteUnlock, params: { ids } });
};