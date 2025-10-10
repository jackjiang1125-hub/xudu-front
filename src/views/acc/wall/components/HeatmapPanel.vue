<template>
  <div class="panel">
    <div class="panel-title">Passage Heatmap</div>
    <div ref="refEl" class="chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from 'vue';
import * as echarts from 'echarts';
import type { HeatmapData } from '../mock';

const props = defineProps<{ filters: { heatmap?: HeatmapData } }>();
const refEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

function render() {
  if (!refEl.value) return;
  const data = props.filters?.heatmap;
  if (!chart) {
    chart = echarts.init(refEl.value, 'dark');
  }
  if (!data) return;
  chart.setOption({
    tooltip: { trigger: 'item' },
    grid: { top: 28, left: 36, right: 12, bottom: 32 },
    xAxis: { type: 'category', data: data.hours },
    yAxis: { type: 'category', data: data.days },
    visualMap: { min: 0, max: 260, calculable: true, orient: 'horizontal', left: 'center', bottom: 0 },
    series: [{ type: 'heatmap', data: data.values, progressive: 1e5, name: 'Passes' }],
  });
}

onMounted(render);
watch(
  () => props.filters.heatmap,
  () => {
    render();
    chart?.resize();
  },
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
  border-radius: 12px;
  overflow: hidden;
}
</style>