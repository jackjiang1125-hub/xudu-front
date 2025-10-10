
<template>
  <div>
    <div class="panel-title">门联动状态</div>
    <div class="matrix">
      <div v-for="(cell, idx) in cells" :key="idx" class="cell" :class="cell.state.toLowerCase()">
        <div class="name">{{ cell.name }}</div>
        <div class="state">{{ cell.state }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';

const props = defineProps<{ filters: Record<string, any> }>();
const cells = ref<any[]>([]);

function mock(){
  const names = Array.from({length:18}, (_,i)=> `联动组-${i+1}`);
  return names.map(n=>{
    const s = ['OPEN','CLOSE','LOCKED','LINKED'][Math.floor(Math.random()*4)];
    return { name:n, state:s };
  });
}
async function load(){
  // const res = await defHttp.get({ url:'/api/acc/linkage/matrix', params: props.filters });
  cells.value = mock();
}
onMounted(load);
watch(()=>props.filters, load, { deep:true });
</script>

<style scoped>
.panel-title{ font-weight:600; margin-bottom:8px; letter-spacing:.5px; color:#f8fbff; }
.matrix{ display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; }
.cell{ padding:10px; border-radius:10px; background: rgba(20,26,40,.7); border:1px solid rgba(255,255,255,.12); text-align:center; color:#f8fbff; }
.cell .name{ font-size:12px; opacity:.9; }
.cell .state{ margin-top:6px; font-weight:600; letter-spacing:.5px; }
.cell.open{ box-shadow: 0 0 10px rgba(0,212,138,.3) inset; border-color: rgba(0,212,138,.35); }
.cell.close{ box-shadow: 0 0 10px rgba(255,255,255,.12) inset; }
.cell.locked{ box-shadow: 0 0 10px rgba(124,77,255,.3) inset; border-color: rgba(124,77,255,.35); }
.cell.linked{ box-shadow: 0 0 10px rgba(0,229,255,.3) inset; border-color: rgba(0,229,255,.35); }
</style>
