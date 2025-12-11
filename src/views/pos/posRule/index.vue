<template>
  <div class="cons-rule-page">
    <!-- 顶部标题 + 统计卡片 -->
    <a-card :bordered="false" class="page-header-card">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-typography-title :level="4" style="margin-bottom: 4px">
            消费规则
          </a-typography-title>
          <a-typography-text type="secondary">
            用于控制园区 / 校园日常消费的额度、频次与适用范围
          </a-typography-text>
        </a-col>
        <a-col>
          <a-space>
            <a-button type="link" @click="onHelp">
              <QuestionCircleOutlined />
              使用说明
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="8">
          <a-card size="small" :bordered="false" class="stat-card">
            <div class="stat-value">{{ stat.totalRules }}</div>
            <div class="stat-label">规则总数</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" :bordered="false" class="stat-card">
            <div class="stat-value">{{ stat.enabledRules }}</div>
            <div class="stat-label">启用中规则</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card size="small" :bordered="false" class="stat-card">
            <div class="stat-value">{{ stat.todayHits }}</div>
            <div class="stat-label">今日触发次数</div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- Tabs 区域 -->
    <a-card :bordered="false" class="content-card">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="list" tab="规则列表">
          <RuleList />
        </a-tab-pane>
        <a-tab-pane key="binding" tab="规则绑定">
          <RuleBinding />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import RuleList from './components/RuleList.vue';
import RuleBinding from './components/RuleBinding.vue';

const activeTab = ref<string>('list');
const stat = ref({
  totalRules: 12,
  enabledRules: 9,
  todayHits: 128,
});

function onHelp() {
  // TODO: 打开帮助文档或说明页
}
</script>

<style scoped>
.cons-rule-page {
  padding: 12px;
}

.page-header-card {
  margin-bottom: 12px;
}

.content-card {
  margin-top: 0;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
}

.stat-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
