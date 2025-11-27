<template>
  <div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <ChartCard title="设备使用统计">
      <LineMulti :height="260" :data="deviceUsage" />
    </ChartCard>
    <ChartCard title="费用收入汇总">
      <Bar :height="260" :data="incomeData" />
    </ChartCard>
    <ChartCard title="用户消费排行">
      <RankList :list="userRank" />
    </ChartCard>
    <ChartCard title="时段使用分析">
      <BarAndLine :height="260" :data="periodUsage" />
    </ChartCard>
  </div>
</template>

<script setup lang="ts">
import ChartCard from '/@/components/chart/ChartCard.vue';
import LineMulti from '/@/components/chart/LineMulti.vue';
import Bar from '/@/components/chart/Bar.vue';
import RankList from '/@/components/chart/RankList.vue';
import BarAndLine from '/@/components/chart/BarAndLine.vue';

const deviceUsage = [
  { name: '设备A', data: [20, 30, 25, 40, 35, 50] },
  { name: '设备B', data: [15, 22, 28, 30, 32, 38] },
];
const incomeData = [
  { name: '1月', value: 12000 },
  { name: '2月', value: 15800 },
  { name: '3月', value: 13500 },
  { name: '4月', value: 16800 },
  { name: '5月', value: 17800 },
  { name: '6月', value: 19200 },
];
const userRank = [
  { name: '张三', total: 320 },
  { name: '李四', total: 298 },
  { name: '王五', total: 275 },
  { name: '赵六', total: 240 },
];
const periodUsage = [
  { name: '00-06', value: 120 },
  { name: '06-12', value: 380 },
  { name: '12-18', value: 520 },
  { name: '18-24', value: 460 },
];
</script>
