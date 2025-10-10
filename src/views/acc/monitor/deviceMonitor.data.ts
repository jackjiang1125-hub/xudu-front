import type { BasicColumn } from '/@/components/Table';

export type DeviceStatus = 'online' | 'offline' | 'disabled';

export interface DoorDevice {
  id: string;
  name: string;
  location: string;
  sn: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  snapshot?: string;
}

export interface EventRecord {
  id: string;
  type: string;
  person: string;
  time: string;
  deviceName: string;
  deviceSn: string;
  result: string;
  extra?: FaceProfile;
}

export interface FaceProfile {
  avatar: string;
  name: string;
  department: string;
  credential?: string;
}

export const deviceStatusMeta: Record<DeviceStatus, { label: string; color: string; description: string }> = {
  online: { label: 'Online', color: '#52c41a', description: 'Device online and ready for remote control' },
  offline: { label: 'Offline', color: '#f5222d', description: 'Connection lost, please check network and power' },
  disabled: { label: 'Disabled', color: '#faad14', description: 'Device disabled by administrator' },
};

export const mockDoorDevices: DoorDevice[] = [
  {
    id: 'door-001',
    name: 'Main Lobby Door',
    location: 'HQ Lobby - Level 1',
    sn: 'ACC-0001',
    status: 'online',
    lastHeartbeat: '2025-10-05 10:15:32',
  },
  {
    id: 'door-002',
    name: 'West Side Entrance',
    location: 'HQ West Wing - Level 1',
    sn: 'ACC-0002',
    status: 'offline',
    lastHeartbeat: '2025-10-05 09:48:10',
  },
  {
    id: 'door-003',
    name: 'R&D Center Entry',
    location: 'R&D Building - Level 3',
    sn: 'ACC-0003',
    status: 'online',
    lastHeartbeat: '2025-10-05 10:16:05',
  },
  {
    id: 'door-004',
    name: 'Server Room Gate',
    location: 'B1 Data Center Corridor',
    sn: 'ACC-0004',
    status: 'disabled',
    lastHeartbeat: '2025-10-04 17:32:55',
  },
  {
    id: 'door-005',
    name: 'Parking Garage',
    location: 'Underground Parking Area',
    sn: 'ACC-0005',
    status: 'online',
    lastHeartbeat: '2025-10-05 10:15:54',
  },
  {
    id: 'door-006',
    name: 'Visitor Turnstile',
    location: 'Visitor Zone - Level 1',
    sn: 'ACC-0006',
    status: 'offline',
    lastHeartbeat: '2025-10-05 08:13:20',
  },
];

export const eventColumns: BasicColumn[] = [
  {
    title: 'Event Type',
    dataIndex: 'type',
    width: 160,
  },
  {
    title: 'Person / Operator',
    dataIndex: 'person',
    width: 180,
  },
  {
    title: 'Timestamp',
    dataIndex: 'time',
    width: 180,
  },
  {
    title: 'Device Name',
    dataIndex: 'deviceName',
    width: 180,
  },
  {
    title: 'Device SN',
    dataIndex: 'deviceSn',
    width: 140,
  },
  {
    title: 'Result',
    dataIndex: 'result',
  },
];

export const mockFaceProfiles: FaceProfile[] = [
  {
    avatar: 'https://cdn.jsdelivr.net/gh/placeholderjs/face@main/male/64.png',
    name: 'Ethan Chen',
    department: 'R&D Department',
    credential: 'ID 430981199002143315',
  },
  {
    avatar: 'https://cdn.jsdelivr.net/gh/placeholderjs/face@main/female/64.png',
    name: 'Sophia Li',
    department: 'Product Design',
    credential: 'ID 440582199309146628',
  },
];

export const mockInitialEvents: EventRecord[] = [
  {
    id: 'evt-1001',
    type: 'Standard Entry',
    person: 'Zhang Wei',
    time: '2025-10-05 10:15:12',
    deviceName: 'Main Lobby Door',
    deviceSn: 'ACC-0001',
    result: 'Access granted',
  },
  {
    id: 'evt-1002',
    type: 'Remote Open',
    person: 'Security Center',
    time: '2025-10-05 10:14:33',
    deviceName: 'Parking Garage',
    deviceSn: 'ACC-0005',
    result: 'Success',
  },
  {
    id: 'evt-1003',
    type: 'Face Access Granted',
    person: 'Sophia Li',
    time: '2025-10-05 10:13:55',
    deviceName: 'R&D Center Entry',
    deviceSn: 'ACC-0003',
    result: 'Face match 99%',
    extra: mockFaceProfiles[1],
  },
];

export const actionDefinitions = [
  { key: 'open', label: 'Remote Open', statusAllow: ['online'] },
  { key: 'close', label: 'Remote Close', statusAllow: ['online'] },
  { key: 'lock', label: 'Lock Device', statusAllow: ['online'] },
  { key: 'unlock', label: 'Unlock Device', statusAllow: ['online'] },
  { key: 'fetch', label: 'Fetch Recent Logs', statusAllow: ['online', 'offline', 'disabled'] },
];