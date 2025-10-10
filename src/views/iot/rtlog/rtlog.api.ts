import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/iot/accDeviceRtLog/list',
  queryById = '/iot/accDeviceRtLog/queryById',
  findPhotoByLogTime = '/iot/accDevicePhoto/findByLogTime',
}

/**
 * 门禁设备实时记录列表
 */
export const listRtLogs = (params) => defHttp.get({ url: Api.list, params });

/**
 * 通过id查询门禁设备实时记录
 */
export const getRtLogById = (id) => defHttp.get({ url: Api.queryById, params: { id } }, { joinParamsToUrl: true });

/**
 * 根据设备序列号和记录时间查找匹配的抓拍照片
 */
export const findPhotoByLogTime = (sn: string, logTime: string) => 
  defHttp.get({ url: Api.findPhotoByLogTime, params: { sn, logTime } }, { joinParamsToUrl: true });
