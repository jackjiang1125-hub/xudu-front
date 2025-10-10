import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/iot/acc/command/list',
  add = '/iot/acc/command/add',
  edit = '/iot/acc/command/edit',
  delete = '/iot/acc/command/delete',
  deleteBatch = '/iot/acc/command/deleteBatch',
  export = '/iot/acc/command/export',
  retry = '/iot/acc/command/retry',
}

/**
 * 获取命令列表
 */
export const listCommands = (params) => defHttp.get({ url: Api.list, params });

/**
 * 添加命令
 */
export const addCommand = (params) => defHttp.post({ url: Api.add, params });

/**
 * 编辑命令
 */
export const editCommand = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 删除命令
 */
export const deleteCommand = (id) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

/**
 * 批量删除命令
 */
export const deleteBatchCommands = (ids) => defHttp.delete({ url: Api.deleteBatch, params: { ids } }, { joinParamsToUrl: true });

/**
 * 导出命令
 */
export const exportCommands = () => defHttp.get({ url: Api.export }, { responseType: 'blob' });

/**
 * 重试命令
 */
export const retryCommand = (id) => defHttp.post({ url: Api.retry, params: { id } }, { joinParamsToUrl: true });
