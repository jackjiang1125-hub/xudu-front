import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

const park: AppRouteModule = {
  path: '/park',
  name: 'ParkRoot',
  component: LAYOUT,
  redirect: '/park/manage',
  meta: {
    orderNo: 520,
    icon: 'mdi:garage-variant',
    title: '停车场管理',
  },
  children: [
    {
      path: 'manage',
      name: 'ParkManage',
      component: () => import('/@/views/park/parkManage/index.vue'),
      meta: {
        title: '车场管理',
      },
    },
    {
      path: 'area',
      name: 'ParkArea',
      component: () => import('/@/views/park/parkArea/index.vue'),
      meta: {
        title: '区域管理',
      },
    },
    {
      path: 'device',
      name: 'ParkDevice',
      component: () => import('/@/views/park/parkDevice/index.vue'),
      meta: {
        title: '设备管理',
      },
    },
    {
      path: 'channel',
      name: 'ParkChannel',
      component: () => import('/@/views/park/parkChannel/index.vue'),
      meta: {
        title: '通道管理',
      },
    },
  ],
};

export default park;
