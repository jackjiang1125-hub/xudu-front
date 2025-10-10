
<template>
  <div class="ticker" role="marquee">
    <div class="track">
      <div class="item" v-for="(it, idx) in items" :key="idx">
        <span class="badge" :class="it.level.toLowerCase()">{{ it.level }}</span>
        <span class="text">{{ it.text }}</span>
        <span class="time">{{ it.time }}</span>
      </div>
      <!-- duplicate for seamless loop -->
      <div class="item" v-for="(it, idx) in items" :key="'dup-'+idx">
        <span class="badge" :class="it.level.toLowerCase()">{{ it.level }}</span>
        <span class="text">{{ it.text }}</span>
        <span class="time">{{ it.time }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const items = ref([
  { level:'CRITICAL', text:'宿舍A-1 连续3次非法开门尝试', time:'10:21:08' },
  { level:'MAJOR', text:'图书馆西门 门磁异常', time:'10:18:42' },
  { level:'MINOR', text:'上学啦联动响应延迟 580ms', time:'10:17:26' },
  { level:'INFO', text:'一教北门 常开计划已生效', time:'10:16:03' },
]);
</script>

<style scoped>
.ticker{ position: relative; overflow: hidden; height: 34px; background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; color:#f8fbff; }
.track{ display:flex; gap:24px; white-space:nowrap; animation: scroll 25s linear infinite; align-items:center; height:34px; }
.item{ display:flex; align-items:center; gap:8px; padding:0 8px; }
.badge{ padding:2px 6px; border-radius:6px; font-size:12px; font-weight:700; color:#0b0f1a; }
.badge.critical{ background:#ff4d4f; }
.badge.major{ background:#ffa940; }
.badge.minor{ background:#69c0ff; }
.badge.info{ background:#b7eb8f; }
.text{ opacity:.95; }
.time{ opacity:.8; font-size:12px; margin-left:6px; }
@keyframes scroll{ from{ transform: translateX(0); } to{ transform: translateX(-50%); } }
</style>
