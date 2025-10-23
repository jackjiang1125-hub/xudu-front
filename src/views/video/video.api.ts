import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/video/list',
  add = '/video/add',
  edit = '/video/update',
  delete = '/video',
  deleteBatch = '/video/batch',
  getById = '/video',
  export = '/video/export',
  import = '/video/import',
  preparePlay = '/video/preparePlay',
}

/**
 * 获取视频流列表
 */
export const listVideos = (params) => {
  console.log('调用视频流列表API:', Api.list, params);
  return defHttp.get({ url: Api.list, params }).catch(error => {
    console.error('视频流列表API调用失败:', error);
    throw error;
  });
};

/**
 * 添加视频流
 */
export const addVideo = (params) => defHttp.post({ url: Api.add, data: params });

/**
 * 编辑视频流
 */
export const editVideo = (params) => defHttp.put({ url: Api.edit, data: params });

/**
 * 删除视频流
 */
export const deleteVideo = (id) => defHttp.delete({ url: `${Api.delete}/${id}` });

/**
 * 批量删除视频流
 */
export const deleteBatchVideos = (ids) => defHttp.delete({ url: Api.deleteBatch, data: ids });

/**
 * 根据ID获取视频流详情
 */
export const getVideoById = (id) => defHttp.get({ url: `${Api.getById}/${id}` });

/**
 * 导出视频流
 */
export const exportVideos = () => defHttp.get({ url: Api.export });

/**
 * 导入视频流
 */
export const importVideos = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({ url: Api.import, data: formData });
};

/**
 * 准备播放视频流
 */
export const preparePlay = (cameraId: string, target: string = 'PC', preferNvenc: boolean = false) => {
  return defHttp.get({ 
    url: Api.preparePlay, 
    params: { cameraId, target, preferNvenc } 
  });
};
