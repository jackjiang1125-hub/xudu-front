import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const wec: AppRouteModule = {
  path: '/wec',
  name: 'WecRoot',
  component: LAYOUT,
  redirect: '/wec/device',
  meta: {
    orderNo: 521,
    icon: 'ic:outline-water-drop',
    title: '水电控',
  },
  children: [
    {
      path: 'basic/structure',
      name: 'WecStructure',
      component: () => import('/@/views/wec/structure/index.vue'),
      meta: { title: '楼栋/楼层/房间' },
    },
    {
      path: 'basic/location',
      name: 'WecLocation',
      component: () => import('/@/views/wec/location/index.vue'),
      meta: { title: '设备安装位置管理' },
    },
    {
      path: 'device',
      name: 'WecDevice',
      component: () => import('/@/views/wec/device/index.vue'),
      meta: { title: '设备管理' },
    },
    {
      path: 'rate',
      name: 'WecRate',
      component: () => import('/@/views/wec/rate/index.vue'),
      meta: { title: '费率策略' },
    },
    {
      path: 'monitor',
      name: 'WecMonitor',
      component: () => import('/@/views/wec/monitor/index.vue'),
      meta: { title: '实时监控' },
    },
    {
      path: 'user',
      name: 'WecUser',
      component: () => import('/@/views/wec/user/index.vue'),
      meta: { title: '用户管理' },
    },
    {
      path: 'transaction',
      name: 'WecTransaction',
      component: () => import('/@/views/wec/transaction/index.vue'),
      meta: { title: '交易管理' },
    },
    {
      path: 'analysis',
      name: 'WecAnalysis',
      component: () => import('/@/views/wec/analysis/index.vue'),
      meta: { title: '统计分析' },
    },
    {
      path: 'system',
      name: 'WecSystem',
      component: () => import('/@/views/wec/system/index.vue'),
      meta: { title: '系统管理' },
    },
  ],
};

export default wec;
