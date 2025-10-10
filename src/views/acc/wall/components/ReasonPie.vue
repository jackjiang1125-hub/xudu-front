<template>
  <div class="panel">
    <div class="panel-title">Reject Reasons</div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';
import type { ReasonItem } from '../mock';

const props = defineProps<{ filters: { reasons?: ReasonItem[] } }>();
const refEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function render() {
  if (!refEl.value) return;
  const seriesData = props.filters?.reasons ?? [];
  if (!chart) chart = echarts.init(refEl.value, 'dark');
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        roseType: 'area',
        data: seriesData.map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } })),
      },
    ],
  });
}

onMounted(render);
watch(
  () => props.filters.reasons,
  () => render(),
  { deep: true }
);
</script>

<style scoped>
.panel {
  color: #f7fbff;
}
.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.chart {
  height: 280px;
  width: 100%;
}
</style>