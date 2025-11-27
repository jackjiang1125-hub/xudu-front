<template>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
    <div>
      <BasicTable @register="registerBuildingTable">
        <template #toolbar>
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="openBuildingForm()">新增楼栋</a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getBuildingActions(record)" />
        </template>
      </BasicTable>
    </div>
    <div>
      <BasicTable @register="registerFloorTable">
        <template #toolbar>
          <a-button type="primary" preIcon="ant-design:plus-outlined" :disabled="!selectedBuildingId" @click="openFloorForm()">新增楼层</a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getFloorActions(record)" />
        </template>
      </BasicTable>
    </div>
    <div>
      <BasicTable @register="registerRoomTable">
        <template #toolbar>
          <a-button type="primary" preIcon="ant-design:plus-outlined" :disabled="!selectedFloorId" @click="openRoomForm()">新增房间</a-button>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getRoomActions(record)" />
        </template>
      </BasicTable>
    </div>
  </div>
  <BasicDrawer v-model:visible="buildingDrawer" title="楼栋信息" width="600px" :showFooter="false">
    <BuildingForm :record="currentBuilding" @success="onBuildingSaved" />
  </BasicDrawer>
  <BasicDrawer v-model:visible="floorDrawer" title="楼层信息" width="600px" :showFooter="false">
    <FloorForm :record="currentFloor" @success="onFloorSaved" />
  </BasicDrawer>
  <BasicDrawer v-model:visible="roomDrawer" title="房间信息" width="600px" :showFooter="false">
    <RoomForm :record="currentRoom" @success="onRoomSaved" />
  </BasicDrawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { BasicDrawer } from '/@/components/Drawer';
import { useMessage } from '/@/hooks/web/useMessage';
import { buildingColumns, floorColumns, roomColumns, buildingSearchSchema, floorSearchSchema, roomSearchSchema } from './structure.data';
import { listBuildings, deleteBuilding, type BuildingModel, listFloors, deleteFloor, type FloorModel, listRooms, deleteRoom, type RoomModel } from './structure.api';
import BuildingForm from './BuildingForm.vue';
import FloorForm from './FloorForm.vue';
import RoomForm from './RoomForm.vue';

const { createMessage, createConfirm } = useMessage();

const selectedBuildingId = ref<string>('');
const selectedFloorId = ref<string>('');

const [registerBuildingTable, { reload: reloadBuildings, getSelectRows: getSelectedBuildings }] = useTable({
  api: listBuildings,
  rowKey: 'id',
  columns: buildingColumns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  rowSelection: { type: 'radio', onChange: (keys: (string | number)[]) => { selectedBuildingId.value = String(keys[0] || ''); } },
  formConfig: { labelWidth: 120, schemas: buildingSearchSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const [registerFloorTable, { reload: reloadFloors, getSelectRows: getSelectedFloors }] = useTable({
  api: (params) => listFloors({ ...params, buildingId: selectedBuildingId.value }),
  rowKey: 'id',
  columns: floorColumns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  rowSelection: { type: 'radio', onChange: (keys: (string | number)[]) => { selectedFloorId.value = String(keys[0] || ''); } },
  formConfig: { labelWidth: 120, schemas: floorSearchSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

const [registerRoomTable, { reload: reloadRooms }] = useTable({
  api: (params) => listRooms({ ...params, floorId: selectedFloorId.value }),
  rowKey: 'id',
  columns: roomColumns,
  actionColumn: { width: 140, fixed: 'right', title: '操作' },
  formConfig: { labelWidth: 120, schemas: roomSearchSchema, autoSubmitOnEnter: true, showAdvancedButton: true },
});

watch(selectedBuildingId, () => { selectedFloorId.value = ''; reloadFloors(); reloadRooms(); });
watch(selectedFloorId, () => { reloadRooms(); });

const buildingDrawer = ref(false);
const floorDrawer = ref(false);
const roomDrawer = ref(false);

const currentBuilding = ref<Record<string, any>>({});
const currentFloor = ref<Record<string, any>>({});
const currentRoom = ref<Record<string, any>>({});

function openBuildingForm(record?: BuildingModel) { currentBuilding.value = record ? { ...record } : {}; buildingDrawer.value = true; }
function openFloorForm(record?: FloorModel) { currentFloor.value = record ? { ...record } : { buildingId: selectedBuildingId.value }; floorDrawer.value = true; }
function openRoomForm(record?: RoomModel) { currentRoom.value = record ? { ...record } : { floorId: selectedFloorId.value }; roomDrawer.value = true; }

function onBuildingSaved() { buildingDrawer.value = false; reloadBuildings(); }
function onFloorSaved() { floorDrawer.value = false; reloadFloors(); }
function onRoomSaved() { roomDrawer.value = false; reloadRooms(); }

function handleDeleteBuilding(record: BuildingModel) {
  createConfirm({ title: '确认删除', content: `确定要删除楼栋【${record.buildingName}】吗？`, async onOk() { await deleteBuilding(String(record.id)); createMessage.success('删除成功'); reloadBuildings(); } });
}
function handleDeleteFloor(record: FloorModel) {
  createConfirm({ title: '确认删除', content: `确定要删除楼层【${record.floorName}】吗？`, async onOk() { await deleteFloor(String(record.id)); createMessage.success('删除成功'); reloadFloors(); } });
}
function handleDeleteRoom(record: RoomModel) {
  createConfirm({ title: '确认删除', content: `确定要删除房间【${record.roomName}】吗？`, async onOk() { await deleteRoom(String(record.id)); createMessage.success('删除成功'); reloadRooms(); } });
}

function getBuildingActions(record: BuildingModel) { return [ { label: '编辑', onClick: () => openBuildingForm(record) }, { label: '删除', color: 'error', onClick: () => handleDeleteBuilding(record) } ]; }
function getFloorActions(record: FloorModel) { return [ { label: '编辑', onClick: () => openFloorForm(record) }, { label: '删除', color: 'error', onClick: () => handleDeleteFloor(record) } ]; }
function getRoomActions(record: RoomModel) { return [ { label: '编辑', onClick: () => openRoomForm(record) }, { label: '删除', color: 'error', onClick: () => handleDeleteRoom(record) } ]; }
</script>
