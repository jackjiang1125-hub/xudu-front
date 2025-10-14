import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const accRealtime: AppRouteModule = {
  path: '/acc-realtime',
  name: 'AccRealtimeRoot',
  component: LAYOUT,
  redirect: '/acc-realtime/list',
  meta: {
    orderNo: 26,
    icon: 'mdi:account-multiple-outline',
    title: '人员与设备实时列表',
  },
  children: [
    {
      path: 'list',
      name: 'AccRealtimeList',
      component: () => import('/@/views/acc/realtimeList/index.vue'),
      meta: {
        title: '实时列表',
      },
    },
  ],
};

export default accRealtime;