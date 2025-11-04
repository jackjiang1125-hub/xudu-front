import { defHttp } from '/@/utils/http/axios';
import type { ConsumptionRecordItem } from './consumptionRecord.data';

// 后端Result格式接口
interface Result<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

// 后端IPage格式接口
interface PageResult<T> {
  current: number;
  pages: number;
  records: T[];
  size: number;
  total: number;
}

enum Api {
  LIST = '/pos/consumptionRecord/list',
  DETAIL = '/pos/consumptionRecord/detail',
}

/**
 * 获取消费记录列表
 */
export const getConsumptionList = (params: Record<string, any>) =>
  defHttp.get<Result<PageResult<ConsumptionRecordItem>>>({
    url: Api.LIST,
    params,
  });

/**
 * 获取消费记录详情
 */
export const getConsumptionDetail = (id: string) =>
  defHttp.get<Result<ConsumptionRecordItem>>({
    url: Api.DETAIL,
    params: { id },
  });