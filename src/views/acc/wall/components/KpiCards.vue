<template>
  <a-row :gutter="12" class="kpi-row">
    <a-col v-for="card in cards" :key="card.key" :span="4">
      <a-card bordered={false} class="kpi-card">
        <div class="kpi-title">{{ card.title }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div class="kpi-sub" v-if="card.delta">Day-over-day {{ card.delta }}</div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { KpiItem } from '../mock';

const props = defineProps<{ filters: { kpi?: KpiItem[] } }>();

const cards = computed(() => props.filters?.kpi ?? []);
</script>

<style scoped>
.kpi-row {
  color: #f7fbff;
}
.kpi-card {
  background: rgba(20, 26, 40, 0.72);
  border: 1px solid rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 24px rgba(124, 77, 255, 0.12) inset, 0 0 12px rgba(0, 229, 255, 0.25);
  border-radius: 14px;
}
.kpi-title {
  font-size: 13px;
  opacity: 0.75;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 6px;
}
.kpi-sub {
  font-size: 12px;
  opacity: 0.65;
  margin-top: 4px;
}
</style>