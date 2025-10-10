import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const accessDashboard: AppRouteModule = {
  path: '/acc-dashboard',
  name: 'AccessDashboardRoot',
  component: LAYOUT,
  redirect: '/acc-dashboard/overview',
  meta: {
    orderNo: 25,
    icon: 'mdi:view-dashboard-outline',
    title: 'Access Dashboard',
  },
  children: [
    {
      path: 'overview',
      name: 'AccessDashboard',
      component: () => import('/@/views/acc/dashboard/index.vue'),
      meta: {
        title: 'Realtime Command Center',
        affix: false,
      },
    },
  ],
};

export default accessDashboard;