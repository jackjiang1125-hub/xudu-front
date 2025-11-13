<template>
  <div class="p-4">
    <a-row :gutter="16" class="enter-y">
      <a-col :span="24">
        <div class="md:flex">
          <ChartCard v-for="(item,index) in topCards" :key="index" :title="item.title" :total="item.total" :loading="loading" class="md:w-1/5 w-full !md:mt-0 !mt-4" :class="[index + 1 < 5 && '!md:mr-4']">
            <template #footer>
              <span>{{ item.footer }}<span>{{ item.value }}</span></span>
            </template>
          </ChartCard>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="!mt-4">
      <a-col :span="12">
        <a-card :loading="loading" :bordered="false" title="门禁通行趋势">
          <LineMulti :chartData="lineDoorAccess" type="line" height="260px"></LineMulti>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :loading="loading" :bordered="false" title="门禁点TOP5">
          <Bar :chartData="barTopGates" height="260px" :seriesColor="seriesColor"></Bar>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :loading="loading" :bordered="false" title="门禁设备在线率">
          <Gauge :chartData="gaugeDoorOnline" height="260px" :seriesColor="seriesColor"></Gauge>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="!mt-4">
      <a-col :span="8">
        <a-card :loading="loading" :bordered="false" title="考勤出勤率">
          <Pie :chartData="pieAttendance" height="240px"></Pie>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card :loading="loading" :bordered="false" title="停车出入量">
          <Bar :chartData="barParkingFlow" height="240px" :seriesColor="seriesColor"></Bar>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card :loading="loading" :bordered="false" title="消费品类分布">
          <Pie :chartData="pieConsumption" height="240px"></Pie>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="!mt-4">
      <a-col :span="12">
        <a-card :loading="loading" :bordered="false" title="视频告警趋势">
          <LineMulti :chartData="lineVideoAlerts" type="line" height="260px"></LineMulti>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :loading="loading" :bordered="false" title="告警设备TOP10">
          <RankList :list="rankAlarmDevices" height="220"></RankList>
        </a-card>
      </a-col>
    </a-row>
  </div>
  
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRootSetting } from '/@/hooks/setting/useRootSetting'
import ChartCard from '/@/components/chart/ChartCard.vue'
import Bar from '/@/components/chart/Bar.vue'
import LineMulti from '/@/components/chart/LineMulti.vue'
import Pie from '/@/components/chart/Pie.vue'
import Gauge from '/@/components/chart/Gauge.vue'
import RankList from '/@/components/chart/RankList.vue'
const loading = ref(false)
const { getThemeColor } = useRootSetting()
const seriesColor = computed(() => getThemeColor.value)
const topCards = ref([
  { title: '门禁今日通行', total: '1276', value: '1276', footer: '今日通行' },
  { title: '考勤出勤率', total: '96%', value: '96%', footer: '当前' },
  { title: '停车使用数', total: '865', value: '865', footer: '已用车位' },
  { title: '今日消费额', total: '￥35236', value: '￥35236', footer: '金额' },
  { title: '在线摄像头', total: '156', value: '156', footer: '在线' }
])
const lineDoorAccess = ref([
  { name: '00时', type: '进', value: 120 },
  { name: '00时', type: '出', value: 110 },
  { name: '02时', type: '进', value: 90 },
  { name: '02时', type: '出', value: 80 },
  { name: '04时', type: '进', value: 60 },
  { name: '04时', type: '出', value: 50 },
  { name: '06时', type: '进', value: 180 },
  { name: '06时', type: '出', value: 170 },
  { name: '08时', type: '进', value: 320 },
  { name: '08时', type: '出', value: 300 },
  { name: '10时', type: '进', value: 280 },
  { name: '10时', type: '出', value: 260 },
  { name: '12时', type: '进', value: 240 },
  { name: '12时', type: '出', value: 230 },
  { name: '14时', type: '进', value: 260 },
  { name: '14时', type: '出', value: 250 },
  { name: '16时', type: '进', value: 300 },
  { name: '16时', type: '出', value: 290 },
  { name: '18时', type: '进', value: 340 },
  { name: '18时', type: '出', value: 320 },
  { name: '20时', type: '进', value: 260 },
  { name: '20时', type: '出', value: 240 },
  { name: '22时', type: '进', value: 180 },
  { name: '22时', type: '出', value: 170 }
])
const barTopGates = ref([
  { name: '东门1', value: 1320 },
  { name: '南门1', value: 1180 },
  { name: '北门2', value: 960 },
  { name: '西门3', value: 880 },
  { name: '中心大门', value: 820 }
])
const gaugeDoorOnline = ref({ name: '在线率', value: 93 })
const pieAttendance = ref([
  { name: '正常', value: 820 },
  { name: '迟到', value: 45 },
  { name: '早退', value: 21 },
  { name: '缺勤', value: 13 }
])
const barParkingFlow = ref([
  { name: '06时', value: 120 },
  { name: '08时', value: 260 },
  { name: '10时', value: 220 },
  { name: '12时', value: 180 },
  { name: '14时', value: 200 },
  { name: '16时', value: 240 },
  { name: '18时', value: 300 },
  { name: '20时', value: 210 }
])
const pieConsumption = ref([
  { name: '餐饮', value: 5400 },
  { name: '超市', value: 3200 },
  { name: '洗衣', value: 900 },
  { name: '其他', value: 600 }
])
const lineVideoAlerts = ref([
  { name: '周一', type: '告警', value: 20 },
  { name: '周二', type: '告警', value: 32 },
  { name: '周三', type: '告警', value: 28 },
  { name: '周四', type: '告警', value: 24 },
  { name: '周五', type: '告警', value: 30 },
  { name: '周六', type: '告警', value: 18 },
  { name: '周日', type: '告警', value: 15 }
])
const rankAlarmDevices = ref([
  { name: '摄像头A', total: 18 },
  { name: '摄像头B', total: 16 },
  { name: '摄像头C', total: 14 },
  { name: '摄像头D', total: 12 },
  { name: '摄像头E', total: 11 },
  { name: '摄像头F', total: 10 },
  { name: '摄像头G', total: 9 },
  { name: '摄像头H', total: 8 },
  { name: '摄像头I', total: 7 },
  { name: '摄像头J', total: 6 }
])
</script>
<style lang="less" scoped>
.title { font-weight: normal; }
</style>