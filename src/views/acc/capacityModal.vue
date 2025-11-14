<!-- d:\jwz\xudu-front\src\views\acc\capacityModal.vue -->
<template>
  <BasicModal @register="registerModal" title="查询设备容量" :width="1000" okText="关闭" @ok="closeModal">
    <a-spin :spinning="loading">
      <BasicTable @register="registerTable">
        <template #toolbar>
          <a-button type="primary" @click="handleViewAll">查看全部</a-button>
        </template>
        <template #action="{ record }">
          <a-button type="link" @click="handleViewOne(record)">查看</a-button>
        </template>
      </BasicTable>
      <div style="margin-top: 12px">
        <a-alert type="warning" show-icon message="如发现软件和设备数据不一致，请先同步二者数据后再查询！" />
      </div>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/Table';
import type { AccDeviceModel } from './devce.api';
import { queryDeviceCapacity } from './devce.api';

const loading = ref(false);
const dataRows = ref<any[]>([]);

const columns: BasicColumn[] = [
  { title: '设备名称', dataIndex: 'deviceName', width: 180 },
  { title: '人员数量', dataIndex: 'personCount', width: 120 },
  { title: '指纹数量', dataIndex: 'fingerCount', width: 120 },
  { title: '指纹版本', dataIndex: 'fingerVersion', width: 120 },
  { title: '指静脉数量', dataIndex: 'fingerVeinCount', width: 120 },
  { title: '比对照片数量', dataIndex: 'biophotoCount', width: 140 },
  { title: '人脸数量', dataIndex: 'faceCount', width: 120 },
  { title: '人脸版本', dataIndex: 'faceVersion', width: 120 },
  { title: '掌静脉数量', dataIndex: 'palmVeinCount', width: 120 },
  { title: '掌静脉版本', dataIndex: 'palmVeinVersion', width: 120 },
  { title: '操作', dataIndex: 'action', width: 120, slots: { customRender: 'action' } },
];

const [registerTable, { setTableData }] = useTable({
  columns,
  dataSource: [],
  rowKey: 'id',
  showIndexColumn: true,
});

const [registerModal, { closeModal, setModalProps }] = useModalInner((data?: { records?: AccDeviceModel[] }) => {
  setModalProps({ confirmLoading: false });
  const list = (data?.records || []) as AccDeviceModel[];
  const rows = (list || []).map((d) => ({
    id: String(d.id || d.sn || ''),
    sn: String(d.sn || ''),
    deviceName: String(d.deviceName || d.sn || ''),
    personCount: '',
    biophotoCount: '',
    fingerCount: '',
    fingerVersion: '',
    fingerVeinCount: '',
    faceCount: '',
    faceVersion: '',
    palmVeinCount: '',
    palmVeinVersion: '',
  }));
  dataRows.value = rows;
  setTableData(rows);
});

async function handleViewAll() {
  const sns = dataRows.value.map((r) => r.sn).filter(Boolean);
  if (sns.length === 0) return;
  loading.value = true;
  try {
    const resp: any = await queryDeviceCapacity(sns);
    const list: any[] = Array.isArray(resp?.result) ? resp.result : Array.isArray(resp) ? resp : [];
    const map = new Map(list.map((it: any) => [String(it.sn || ''), it]));
    dataRows.value = dataRows.value.map((r) => {
      const it = map.get(r.sn);
      return it
        ? {
            ...r,
            personCount: it.personCount ?? r.personCount,
            biophotoCount: it.biophotoCount ?? r.biophotoCount,
            fingerCount: it.fingerCount ?? r.fingerCount,
            fingerVersion: it.fingerVersion ?? r.fingerVersion,
            fingerVeinCount: it.fingerVeinCount ?? r.fingerVeinCount,
            faceCount: it.faceCount ?? r.faceCount,
            faceVersion: it.faceVersion ?? r.faceVersion,
            palmVeinCount: it.palmVeinCount ?? r.palmVeinCount,
            palmVeinVersion: it.palmVeinVersion ?? r.palmVeinVersion,
          }
        : r;
    });
    setTableData(dataRows.value.slice());
  } finally {
    loading.value = false;
  }
}

async function handleViewOne(record: any) {
  const sn = String(record?.sn || '');
  if (!sn) return;
  loading.value = true;
  try {
    const resp: any = await queryDeviceCapacity([sn]);
    const list: any[] = Array.isArray(resp?.result) ? resp.result : Array.isArray(resp) ? resp : [];
    const it = list.find((x: any) => String(x.sn || '') === sn);
    if (it) {
      dataRows.value = dataRows.value.map((r) =>
        r.sn === sn
          ? {
              ...r,
              personCount: it.personCount ?? r.personCount,
              biophotoCount: it.biophotoCount ?? r.biophotoCount,
              fingerCount: it.fingerCount ?? r.fingerCount,
              fingerVersion: it.fingerVersion ?? r.fingerVersion,
              fingerVeinCount: it.fingerVeinCount ?? r.fingerVeinCount,
              faceCount: it.faceCount ?? r.faceCount,
              faceVersion: it.faceVersion ?? r.faceVersion,
              palmVeinCount: it.palmVeinCount ?? r.palmVeinCount,
              palmVeinVersion: it.palmVeinVersion ?? r.palmVeinVersion,
            }
          : r
      );
      setTableData(dataRows.value.slice());
    }
  } finally {
    loading.value = false;
  }
}
</script>