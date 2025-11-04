import { defHttp } from '/@/utils/http/axios';
import type { MealOrderRecord } from './mealOrderRecord.data';

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
  LIST = '/pos/mealOrderRecord/list',
  DETAIL = '/pos/mealOrderRecord/detail',
}

/**
 * 获取订餐记录列表
 */
export const getMealOrderList = (params: Record<string, any>) =>
  defHttp.get<Result<PageResult<MealOrderRecord>>>({
    url: Api.LIST,
    params,
  });

/**
 * 获取订餐记录详情
 */
export const getMealOrderDetail = (id: string) =>
  defHttp.get<Result<MealOrderRecord>>({
    url: Api.DETAIL,
    params: { id },
  });