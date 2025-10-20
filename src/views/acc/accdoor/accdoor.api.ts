import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/acc/door/list',
  detail = '/acc/door/detail',
  add = '/acc/door/add',
  edit = '/acc/door/edit',
  delete = '/acc/door/delete',
}

/**
 * 列表查询
 */
export const listDoor = (params) => {
  return defHttp.get({ url: Api.list, params });
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