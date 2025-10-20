import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

enum Api {
  list = '/acc/reader/list',
  detail = '/acc/reader/detail',
  add = '/acc/reader/add',
  edit = '/acc/reader/edit',
  delete = '/acc/reader/delete',
  deleteBatch = '/acc/reader/deleteBatch',
}

/**
 * 分页查询读头列表
 */
export const listReaders = (params?: any) => defHttp.get({ url: Api.list, params });

/**
 * 根据ID查询读头详情
 */
export const getReaderDetail = (params: { id: string }) => defHttp.get({ url: Api.detail, params });

/**
 * 新增读头
 */
export const addReader = (params: any) => defHttp.post({ url: Api.add, params });

/**
 * 更新读头
 */
export const updateReader = (params: any) => defHttp.put({ url: Api.edit, params });

/**
 * 删除读头
 */
export const deleteReader = (params: { id: string }, handleSuccess?: () => void) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

/**
 * 批量删除读头
 */
export const deleteBatchReaders = (params: { ids: string }, handleSuccess?: () => void) => {
  return defHttp.delete({ url: Api.deleteBatch, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess && handleSuccess();
  });
};

/**
 * 删除读头（带确认）
 */
export const deleteReaderWithConfirm = (record: any, handleSuccess?: () => void) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: `确定要删除读头【${record.name}】吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteReader({ id: record.id }, handleSuccess);
    },
  });
};