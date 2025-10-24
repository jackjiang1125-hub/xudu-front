import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/pos/productCategory/list',
  add = '/pos/productCategory/add',
  edit = '/pos/productCategory/edit',
  delete = '/pos/productCategory/delete',
  deleteBatch = '/pos/productCategory/deleteBatch',
  checkCode = '/pos/productCategory/checkCode',
  getEnabledList = '/pos/productCategory/getEnabledList'
}

export const listProductCategory = async (params: any) => {
  try {
    const response = await defHttp.get({
      url: Api.list,
      params
    });
    // 确保返回的数据格式正确
    console.log('API响应:', response);
    return response;
  } catch (error) {
    console.error('API调用失败:', error);
    // 返回标准格式的错误数据
    return { data: { records: [], total: 0 } };
  }
};

export const addProductCategory = (params: any) => defHttp.post({
  url: Api.add,
  params
});

export const editProductCategory = (params: any) => defHttp.put({
  url: Api.edit,
  params
});

export const deleteProductCategory = (id: string) => defHttp.delete({
  url: Api.delete,
  params: { id }
}, { joinParamsToUrl: true });

export const deleteBatchProductCategory = (ids: string[]) => defHttp.delete({
  url: Api.deleteBatch,
  params: { ids: ids.join(',') }
}, { joinParamsToUrl: true });

export const checkCategoryCode = (params: any) => defHttp.get({
  url: Api.checkCode,
  params
});

export const getEnabledCategoryList = () => defHttp.get({
  url: Api.getEnabledList
});