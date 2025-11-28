import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/wec/rateTemplate/list',
  add = '/wec/rateTemplate/add',
  edit = '/wec/rateTemplate/edit',
  delete = '/wec/rateTemplate/delete',
}

export const listRateTemplates = (params?: Record<string, any>) => defHttp.get({ url: Api.list, params });
export const addRateTemplate = (params: Record<string, any>) => defHttp.post({ url: Api.add, params });
export const editRateTemplate = (params: Record<string, any>) => defHttp.put({ url: Api.edit, params });
export const deleteRateTemplate = (id: string) => defHttp.delete({ url: Api.delete, params: { id } }, { joinParamsToUrl: true });

export type RateTemplateModel = {
  id?: string;
  templateName?: string;
  type?: string;
  freeSeconds?: number;
  workMode?: 'real_time' | 'pre_deduct' | 'per_count';
  deductionMethod?: 'timed' | 'pulse';
  realTimeAmount?: number;
  realTimeDuration?: number;
  preDeductTime?: number;
  preDeductRate?: number;
  preDeductAmount?: number;
  perTimeDuration?: number;
};
