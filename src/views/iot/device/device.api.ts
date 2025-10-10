import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/iot/acc/device/list',
  add = '/iot/acc/device/add',
  edit = '/iot/acc/device/edit',
  delete = '/iot/acc/device/delete',
  deleteBatch = '/iot/acc/device/deleteBatch',
  export = '/iot/acc/device/export',
  import = '/iot/acc/device/import',
  authorize = '/iot/acc/device/authorize',
  commands = '/iot/acc/device/commands',
  personnel = '/iot/acc/device/personnel',
}

/**
 * 获取设备列表
 */
export const listDevices = (params) => {
  console.log('调用设备列表API:', Api.list, params);
  return defHttp.get({ url: Api.list, params }).catch(error => {
    console.error('设备列表API调用失败:', error);
    throw error;
  });
};

/**
 * 添加设备
 */
export const addDevice = (params) => defHttp.post({ url: Api.add, params });

/**
 * 编辑设备
 */
export const editDevice = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 删除设备
 */
export const deleteDevice = (id) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

/**
 * 批量删除设备
 */
export const deleteBatchDevices = (ids) => defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });

/**
 * 导出设备
 */
export const exportDevices = () => defHttp.get({ url: Api.export });

/**
 * 导入设备
 */
export const importDevices = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({ url: Api.import, data: formData });
};

/**
 * 设备授权
 */
export const authorizeDevice = (sn, registryCode, remark) => defHttp.post({ url: Api.authorize, params: { sn, registryCode, remark } });

/**
 * 发送命令
 */
export const sendCommands = (sn, commands) => defHttp.post({ url: Api.commands, params: { sn, commands } });

/**
 * 人员信息下发
 */
export const dispatchPersonnel = (sn, personnelData) => {
  console.log('Dispatching personnel data:', { sn, personnelData });
  return defHttp.post({ 
    url: Api.personnel, 
    data: { sn, ...personnelData } 
  });
};
