<template>
  <PageWrapper contentFullHeight class="pos-cockpit">
    <div class="cockpit-layout">
      <section class="summary-grid">
        <div
          v-for="card in summaryCardData"
          :key="card.key"
          class="summary-card"
          :style="{
            background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
          }"
        >
          <div class="summary-card__header">
            <Icon :icon="card.icon" :size="28" />
            <span>{{ card.title }}</span>
          </div>
          <div class="summary-card__value">
            <span class="number">{{ formatNumber(card.value) }}</span>
            <span class="unit">{{ card.unit }}</span>
          </div>
          <div class="summary-card__meta">
            <span>{{ card.desc }}</span>
            <span :class="['trend', card.trend]">{{ card.diff }}</span>
          </div>
        </div>
      </section>

      <section class="ticker">
        <div class="ticker__title">
          <Icon icon="mdi:sparkle" :size="18" />
          <span>实时事件播报</span>
        </div>
        <div class="ticker__items">
          <div v-for="item in realtimeTicker" :key="item.time" class="ticker__item">
            <span class="time">{{ item.time }}</span>
            <span class="message">{{ item.message }}</span>
          </div>
        </div>
      </section>

      <section class="chart-grid">
        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>充值与消费趋势</span>
              <small>单位：万元</small>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>钱包结构占比</span>
              <small>综合账户资产构成</small>
            </div>
          </template>
          <div ref="walletChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>账户等级分布</span>
              <small>账户体系健康度</small>
            </div>
          </template>
          <div ref="accountChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>餐厅运营雷达</span>
              <small>关键指标综合评分</small>
            </div>
          </template>
          <div ref="restaurantChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card chart-card--wide">
          <template #title>
            <div class="chart-card__title">
              <span>补贴发放与核销</span>
              <small>利用率趋势</small>
            </div>
          </template>
          <div ref="subsidyChartRef" class="chart-box chart-box--wide"></div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>设备在线率</span>
              <small>消费设备健康概览</small>
            </div>
          </template>
          <div class="device-panel">
            <div ref="deviceChartRef" class="chart-box chart-box--half"></div>
            <ul class="device-list">
              <li v-for="item in deviceUptime.heartbeat" :key="item.name">
                <span>{{ item.name }}</span>
                <span>{{ item.value }}%</span>
              </li>
            </ul>
          </div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>订餐渠道构成</span>
              <small>业务渠道热度</small>
            </div>
          </template>
          <div ref="mealChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card">
          <template #title>
            <div class="chart-card__title">
              <span>高频消费时段</span>
              <small>堂食 / 外送 / 自取对比</small>
            </div>
          </template>
          <div ref="peakChartRef" class="chart-box"></div>
        </a-card>

        <a-card bordered={false} class="chart-card chart-card--wide">
          <template #title>
            <div class="chart-card__title">
              <span>商品品类热销榜</span>
              <small>实时销量排行</small>
            </div>
          </template>
          <div ref="productChartRef" class="chart-box chart-box--wide"></div>
        </a-card>
      </section>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue';
  import { onMounted, ref } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { Icon } from '/@/components/Icon';
  import { useECharts } from '/@/hooks/web/useECharts';
  import {
    accountLevelDistribution,
    deviceUptime,
    mealOrderChannel,
    productTopCategories,
    peakConsumptionTrend,
    realtimeTicker,
    rechargeConsumptionTrend,
    restaurantPerformance,
    subsidyUsage,
    summaryCards,
    walletStructure,
  } from './cockpit.data';

  const summaryCardData = summaryCards;

  const trendChartRef = ref<HTMLDivElement | null>(null);
  const walletChartRef = ref<HTMLDivElement | null>(null);
  const accountChartRef = ref<HTMLDivElement | null>(null);
  const restaurantChartRef = ref<HTMLDivElement | null>(null);
  const subsidyChartRef = ref<HTMLDivElement | null>(null);
  const deviceChartRef = ref<HTMLDivElement | null>(null);
  const mealChartRef = ref<HTMLDivElement | null>(null);
  const productChartRef = ref<HTMLDivElement | null>(null);
  const peakChartRef = ref<HTMLDivElement | null>(null);

  const { setOptions: setTrendOptions } = useECharts(trendChartRef as Ref<HTMLDivElement>);
  const { setOptions: setWalletOptions } = useECharts(walletChartRef as Ref<HTMLDivElement>);
  const { setOptions: setAccountOptions } = useECharts(accountChartRef as Ref<HTMLDivElement>);
  const { setOptions: setRestaurantOptions } = useECharts(restaurantChartRef as Ref<HTMLDivElement>);
  const { setOptions: setSubsidyOptions } = useECharts(subsidyChartRef as Ref<HTMLDivElement>);
  const { setOptions: setDeviceOptions } = useECharts(deviceChartRef as Ref<HTMLDivElement>);
  const { setOptions: setMealOptions } = useECharts(mealChartRef as Ref<HTMLDivElement>);
  const { setOptions: setProductOptions } = useECharts(productChartRef as Ref<HTMLDivElement>);
  const { setOptions: setPeakOptions } = useECharts(peakChartRef as Ref<HTMLDivElement>);

  const subsidyCompletion = subsidyUsage.consumed.map((value, index) =>
    Number(((value / subsidyUsage.issued[index]) * 100).toFixed(1)),
  );

  onMounted(() => {
    initCharts();
  });

  function initCharts() {
    setTrendOptions({
      tooltip: { trigger: 'axis', backgroundColor: '#151c3b', borderColor: '#3556ff', textStyle: { color: '#d8e1ff' } },
      legend: {
        data: ['充值', '消费'],
        top: 10,
        textStyle: { color: '#c4d0ff' },
        icon: 'circle',
      },
      grid: { left: 38, right: 18, top: 50, bottom: 25 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: rechargeConsumptionTrend.days,
        axisLine: { lineStyle: { color: '#2f3c74' } },
        axisLabel: { color: '#8fa4ff' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1f2a52' } },
        axisLabel: { color: '#8fa4ff', formatter: '{value}' },
      },
      series: [
        {
          name: '充值',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: rechargeConsumptionTrend.recharge,
          lineStyle: { color: '#45e1ff', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(69, 225, 255, 0.35)' },
                { offset: 1, color: 'rgba(69, 225, 255, 0.05)' },
              ],
            },
          },
        },
        {
          name: '消费',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: rechargeConsumptionTrend.consumption,
          lineStyle: { color: '#5a75ff', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(90, 117, 255, 0.35)' },
                { offset: 1, color: 'rgba(90, 117, 255, 0.05)' },
              ],
            },
          },
        },
      ],
    });

    setWalletOptions({
      tooltip: { trigger: 'item', backgroundColor: '#151c3b', borderColor: '#3556ff', textStyle: { color: '#d8e1ff' } },
      legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#aab7ff' } },
      series: [
        {
          type: 'pie',
          roseType: 'area',
          radius: ['30%', '70%'],
          center: ['40%', '50%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#0b1130',
            borderWidth: 2,
          },
          label: { color: '#d8e1ff' },
          data: walletStructure.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    });

    setAccountOptions({
      tooltip: { trigger: 'item', formatter: '{b} <br/>数量：{c} 个 ({d}%)' },
      legend: { bottom: 0, textStyle: { color: '#acbdff' } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          itemStyle: { borderColor: '#0b1130', borderWidth: 2 },
          label: { color: '#d8e1ff' },
          data: accountLevelDistribution,
        },
      ],
    });

    setRestaurantOptions({
      tooltip: { trigger: 'item' },
      radar: {
        indicator: restaurantPerformance.indicators.map((item) => ({
          name: item.name,
          max: item.max,
        })),
        axisName: { color: '#9eb0ff' },
        splitLine: { lineStyle: { color: ['#283764', '#1f2a52'] } },
        splitArea: { areaStyle: { color: ['rgba(40, 55, 100, 0.4)', 'rgba(31, 42, 82, 0.4)'] } },
        axisLine: { lineStyle: { color: '#2f3c74' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: restaurantPerformance.values,
              name: '运营综合指数',
              areaStyle: { color: 'rgba(90, 117, 255, 0.4)' },
              lineStyle: { color: '#5a75ff', width: 2 },
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color: '#5a75ff', borderColor: '#90a2ff', borderWidth: 2 },
            },
          ],
        },
      ],
    });

    setSubsidyOptions({
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['已发放', '已核销', '利用率'],
        top: 10,
        textStyle: { color: '#c4d0ff' },
      },
      grid: { left: 40, right: 50, top: 50, bottom: 30 },
      xAxis: {
        type: 'category',
        data: subsidyUsage.months,
        axisLine: { lineStyle: { color: '#2f3c74' } },
        axisLabel: { color: '#8fa4ff' },
      },
      yAxis: [
        {
          type: 'value',
          name: '金额 (万元)',
          nameTextStyle: { color: '#8fa4ff' },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#1f2a52' } },
          axisLabel: { color: '#8fa4ff' },
        },
        {
          type: 'value',
          name: '利用率',
          nameTextStyle: { color: '#8fa4ff' },
          axisLabel: { color: '#8fa4ff', formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '已发放',
          type: 'bar',
          data: subsidyUsage.issued,
          barWidth: 18,
          itemStyle: { color: 'rgba(90, 117, 255, 0.85)' },
        },
        {
          name: '已核销',
          type: 'bar',
          data: subsidyUsage.consumed,
          barWidth: 18,
          itemStyle: { color: 'rgba(69, 225, 255, 0.85)' },
        },
        {
          name: '利用率',
          type: 'line',
          yAxisIndex: 1,
          data: subsidyCompletion,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#ffa63d', width: 3 },
        },
      ],
    });

    setDeviceOptions({
      series: [
        {
          type: 'gauge',
          center: ['50%', '55%'],
          radius: '90%',
          startAngle: 200,
          endAngle: -20,
          progress: { show: true, roundCap: true, width: 12 },
          itemStyle: { color: '#4ce8a7' },
          axisLine: { lineStyle: { width: 12, color: [[1, '#1f2a52']] } },
          pointer: { show: true, length: '70%', width: 4 },
          detail: {
            formatter: '{value}%',
            color: '#fff',
            fontSize: 26,
            offsetCenter: [0, '65%'],
          },
          data: [{ value: deviceUptime.uptime, name: '在线率' }],
        },
      ],
    });

    setMealOptions({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: '#acbdff' } },
      series: [
        {
          type: 'pie',
          radius: ['35%', '70%'],
          roseType: 'radius',
          itemStyle: { borderColor: '#0b1130', borderWidth: 2 },
          label: { color: '#d8e1ff' },
          data: mealOrderChannel,
        },
      ],
    });

    setProductOptions({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 80, right: 20, top: 30, bottom: 20 },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1f2a52' } },
        axisLabel: { color: '#8fa4ff' },
      },
      yAxis: {
        type: 'category',
        data: productTopCategories.categories,
        axisLine: { lineStyle: { color: '#2f3c74' } },
        axisLabel: { color: '#d8e1ff' },
      },
      series: [
        {
          type: 'bar',
          data: productTopCategories.sales,
          barWidth: 16,
          itemStyle: {
            borderRadius: 6,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3dd2ff' },
                { offset: 1, color: '#5a75ff' },
              ],
            },
          },
        },
      ],
    });

    setPeakOptions({
      tooltip: { trigger: 'axis', backgroundColor: '#151c3b', borderColor: '#3556ff', textStyle: { color: '#d8e1ff' } },
      legend: { data: ['堂食', '外送', '自取'], top: 10, textStyle: { color: '#c4d0ff' } },
      grid: { left: 40, right: 20, top: 50, bottom: 30 },
      xAxis: {
        type: 'category',
        data: peakConsumptionTrend.hours,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#2f3c74' } },
        axisLabel: { color: '#8fa4ff' },
      },
      yAxis: {
        type: 'value',
        name: '指数',
        nameTextStyle: { color: '#8fa4ff' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1f2a52' } },
        axisLabel: { color: '#8fa4ff' },
      },
      series: [
        {
          name: '堂食',
          type: 'line',
          smooth: true,
          data: peakConsumptionTrend.dineIn,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#5a75ff', width: 3 },
          areaStyle: { color: 'rgba(90, 117, 255, 0.25)' },
        },
        {
          name: '外送',
          type: 'line',
          smooth: true,
          data: peakConsumptionTrend.delivery,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#45e1ff', width: 3 },
          areaStyle: { color: 'rgba(69, 225, 255, 0.2)' },
        },
        {
          name: '自取',
          type: 'line',
          smooth: true,
          data: peakConsumptionTrend.pickup,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#ffa63d', width: 3 },
          areaStyle: { color: 'rgba(255, 166, 61, 0.2)' },
        },
      ],
    });
  }

  function formatNumber(value: number) {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(2)}亿`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(2)}万`;
    }
    return value.toLocaleString();
  }
</script>

<style scoped>
  .pos-cockpit {
    background: radial-gradient(circle at 20% 20%, #1f295a, transparent 45%),
      radial-gradient(circle at 80% 10%, #2a3b8f, transparent 50%), #0b1130;
    color: #f2f6ff;
  }

  .cockpit-layout {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-bottom: 16px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .summary-card {
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(15, 25, 52, 0.4);
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: #fff;
  }

  .summary-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
  }

  .summary-card__value {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .summary-card__value .number {
    font-size: 28px;
    font-weight: 700;
  }

  .summary-card__value .unit {
    font-size: 14px;
    opacity: 0.9;
  }

  .summary-card__meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    opacity: 0.85;
  }

  .summary-card__meta .trend {
    font-weight: 600;
  }

  .summary-card__meta .trend.up {
    color: #35ffbf;
  }

  .summary-card__meta .trend.down {
    color: #ff6a6a;
  }

  .ticker {
    background: linear-gradient(135deg, rgba(24, 38, 80, 0.6), rgba(16, 24, 60, 0.8));
    border: 1px solid rgba(81, 117, 255, 0.3);
    border-radius: 12px;
    padding: 12px 18px;
  }

  .ticker__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .ticker__items {
    display: grid;
    gap: 6px;
  }

  .ticker__item {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #d8e1ff;
    background: rgba(28, 40, 84, 0.5);
    border-radius: 8px;
    padding: 6px 10px;
  }

  .ticker__item .time {
    font-family: 'JetBrains Mono', monospace;
    color: #8bd7ff;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 16px;
  }

  .chart-card {
    background: rgba(17, 24, 52, 0.72);
    border-radius: 12px;
    border: 1px solid rgba(59, 92, 216, 0.2);
  }

  .chart-card :deep(.ant-card-body) {
    padding: 18px;
  }

  .chart-card__title {
    display: flex;
    flex-direction: column;
    color: #e5ecff;
    font-weight: 600;
  }

  .chart-card__title small {
    font-size: 12px;
    color: #9aacff;
    font-weight: 400;
  }

  .chart-box {
    width: 100%;
    height: 260px;
  }

  .chart-box--wide {
    height: 320px;
  }

  .chart-box--half {
    height: 220px;
  }

  .chart-card--wide {
    grid-column: span 2;
  }

  .device-panel {
    display: flex;
    gap: 12px;
  }

  .device-list {
    flex: 1;
    list-style: none;
    margin: 0;
    padding: 6px 0;
    display: grid;
    gap: 8px;
  }

  .device-list li {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(33, 45, 92, 0.6);
    color: #d8e1ff;
    font-size: 13px;
  }

  .device-list li span:last-child {
    color: #35ffbf;
    font-family: 'JetBrains Mono', monospace;
  }

  .remark {
    margin: 0;
    font-size: 13px;
    color: #c4cffb;
    line-height: 1.6;
  }
</style>
