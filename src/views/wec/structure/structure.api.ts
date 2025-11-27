import { defHttp } from '/@/utils/http/axios';

enum BuildingApi {
  list = '/wec/building/list',
  add = '/wec/building/add',
  edit = '/wec/building/edit',
  delete = '/wec/building/delete',
}

enum FloorApi {
  list = '/wec/floor/list',
  add = '/wec/floor/add',
  edit = '/wec/floor/edit',
  delete = '/wec/floor/delete',
}

enum RoomApi {
  list = '/wec/room/list',
  add = '/wec/room/add',
  edit = '/wec/room/edit',
  delete = '/wec/room/delete',
}

export const listBuildings = (params?: Record<string, any>) => defHttp.get({ url: BuildingApi.list, params });
export const addBuilding = (params: Record<string, any>) => defHttp.post({ url: BuildingApi.add, params });
export const editBuilding = (params: Record<string, any>) => defHttp.put({ url: BuildingApi.edit, params });
export const deleteBuilding = (id: string) => defHttp.delete({ url: BuildingApi.delete, params: { id } }, { joinParamsToUrl: true });

export const listFloors = (params?: Record<string, any>) => defHttp.get({ url: FloorApi.list, params });
export const addFloor = (params: Record<string, any>) => defHttp.post({ url: FloorApi.add, params });
export const editFloor = (params: Record<string, any>) => defHttp.put({ url: FloorApi.edit, params });
export const deleteFloor = (id: string) => defHttp.delete({ url: FloorApi.delete, params: { id } }, { joinParamsToUrl: true });

export const listRooms = (params?: Record<string, any>) => defHttp.get({ url: RoomApi.list, params });
export const addRoom = (params: Record<string, any>) => defHttp.post({ url: RoomApi.add, params });
export const editRoom = (params: Record<string, any>) => defHttp.put({ url: RoomApi.edit, params });
export const deleteRoom = (id: string) => defHttp.delete({ url: RoomApi.delete, params: { id } }, { joinParamsToUrl: true });

export type BuildingModel = { id?: string; buildingName?: string; buildingCode?: string; areaId?: string };
export type FloorModel = { id?: string; floorName?: string; floorCode?: string; buildingId?: string };
export type RoomModel = { id?: string; roomName?: string; roomCode?: string; floorId?: string };
