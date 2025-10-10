export interface KpiItem {
  key: string;
  title: string;
  value: string;
  delta?: string;
}

export interface HeatmapData {
  hours: string[];
  days: string[];
  values: [number, number, number][];
}

export interface ReasonItem {
  name: string;
  value: number;
  color: string;
}

export interface OccupancyData {
  labels: string[];
  actual: number[];
  forecast: number[];
}

export interface AlarmItem {
  time: string;
  title: string;
  severity: 'info' | 'minor' | 'major' | 'critical';
  gate: string;
  remark: string;
}

export const kpiMock: KpiItem[] = [
  { key: 'pass', title: 'Pass Count', value: '12,876', delta: '+12%' },
  { key: 'unique', title: 'Unique Users', value: '5,943', delta: '+6%' },
  { key: 'reject', title: 'Reject Rate', value: '3.1%', delta: '-0.4%' },
  { key: 'device', title: 'Online Devices', value: '482', delta: '+1%' },
  { key: 'alarm', title: 'Alarm Count', value: '14', delta: '+2' },
  { key: 'latency', title: 'Avg Release Time', value: '182 ms', delta: '-8 ms' },
];

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatValues: [number, number, number][] = [];
for (let h = 0; h < hours.length; h++) {
  for (let d = 0; d < days.length; d++) {
    const base = 80 + Math.sin((h / 24) * Math.PI * 2) * 60 + Math.random() * 30;
    heatValues.push([h, d, Math.round(base + d * 10)]);
  }
}
export const heatmapMock: HeatmapData = {
  hours,
  days,
  values: heatValues,
};

export const reasonMock: ReasonItem[] = [
  { name: 'Expired Permission', value: 34, color: '#7c4dff' },
  { name: 'Blacklist', value: 22, color: '#ff4d4f' },
  { name: 'Mismatch', value: 18, color: '#00e5ff' },
  { name: 'Time Window', value: 12, color: '#faad14' },
  { name: 'Anti-passback', value: 8, color: '#00d48a' },
];

const occupancyLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const occupancyActual = occupancyLabels.map((_, i) => 4000 + Math.round(Math.sin(i / 3) * 800 + Math.random() * 200));
const occupancyForecast = occupancyActual.map((v, i) => (i > 18 ? v + (i - 18) * 120 : v + Math.random() * 80));
export const occupancyMock: OccupancyData = {
  labels: occupancyLabels,
  actual: occupancyActual,
  forecast: occupancyForecast,
};

export const alarmMock: AlarmItem[] = [
  { time: '14:35', title: 'Force open detected', severity: 'critical', gate: 'North Gate', remark: 'Acknowledgement pending' },
  { time: '14:21', title: 'Door held open > 120s', severity: 'major', gate: 'Library South', remark: 'Ops Team · Wei Lian' },
  { time: '13:58', title: 'Anti-passback violation', severity: 'minor', gate: 'Dorm Entry', remark: 'Auto suppressed after 3 min' },
  { time: '13:20', title: 'Multiple denials', severity: 'info', gate: 'Lab 301', remark: 'Student forgot card' },
];