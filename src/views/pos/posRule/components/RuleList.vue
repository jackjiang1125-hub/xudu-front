<template> 
  <div class="rule-list-wrapper">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" @click="openDrawer()">
            <PlusOutlined />
            新建规则
          </a-button>
          <a-button @click="onCopyRule" :disabled="!hasSelection">
            <CopyOutlined />
            复制规则
          </a-button>
          <a-button @click="onBatchEnable" :disabled="!hasSelection">
            <CheckCircleOutlined />
            批量启用
          </a-button>
          <a-button danger @click="onBatchDisable" :disabled="!hasSelection">
            <StopOutlined />
            批量停用
          </a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <!-- 规则名称 -->
        <template v-if="column.key === 'ruleName'">
          <a-space>
            <a-typography-link @click="viewDetails(record)">
              {{ record.ruleName }}
            </a-typography-link>
          </a-space>
        </template>

        <!-- 生效时间 -->
        <template v-else-if="column.key === 'effectRange'">
          <span>{{ record.effectBegin }} ~ {{ record.effectEnd || '长期有效' }}</span>
        </template>

        <!-- 状态 -->
        <template v-else-if="column.key === 'status'">
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '停用'"
          />
        </template>

        <!-- 限制摘要 -->
        <template v-else-if="column.key === 'limitSummary'">
          <a-tooltip :title="record.limitSummaryFull || record.limitSummary">
            <span>{{ record.limitSummary || '-' }}</span>
          </a-tooltip>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '查看',
                onClick: () => viewDetails(record),
              },
              {
                label: '编辑',
                onClick: () => openDrawer(record),
              },
              {
                label: '绑定对象',
                onClick: () => openBindModal(record),
              },
            ]"
            :dropDownActions="[
              {
                label: record.status === 1 ? '停用' : '启用',
                onClick: () => toggleStatus(record),
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>

    <!-- 抽屉：新建 / 编辑规则 -->
    <a-drawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
      :width="820"
      :body-style="{ paddingBottom: '80px' }"
      destroyOnClose
    >
      <a-tabs v-model:activeKey="formActiveTab">
        <!-- 基础设置 -->
        <a-tab-pane key="basic" tab="基础设置">
          <a-form
            ref="basicFormRef"
            layout="vertical"
            :model="formModel"
            :rules="basicRules"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="规则名称" name="ruleName">
                  <a-input v-model:value="formModel.ruleName" placeholder="请输入规则名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="生效日期" name="effectRange">
                  <a-range-picker
                    v-model:value="formModel.effectRange"
                    style="width: 100%"
                    :allowClear="true"
                    :disabled="formModel.permanent"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="生效星期" name="weekdays">
                  <a-select
                    v-model:value="formModel.weekdays"
                    mode="multiple"
                    placeholder="选择生效星期"
                  >
                    <a-select-option value="1">周一</a-select-option>
                    <a-select-option value="2">周二</a-select-option>
                    <a-select-option value="3">周三</a-select-option>
                    <a-select-option value="4">周四</a-select-option>
                    <a-select-option value="5">周五</a-select-option>
                    <a-select-option value="6">周六</a-select-option>
                    <a-select-option value="7">周日</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="长期有效">
                  <a-switch v-model:checked="formModel.permanent" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="状态">
                  <a-switch
                    v-model:checked="formModel.status"
                    checked-children="启用"
                    un-checked-children="停用"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-divider />

            <a-form-item label="允许消费设备类型">
              <a-select
                v-model:value="formModel.deviceTypes"
                mode="multiple"
                placeholder="请选择设备类型"
              >
                <a-select-option value="pos">POS 收银机</a-select-option>
                <a-select-option value="self">自助点餐机</a-select-option>
                <a-select-option value="vending">自动售货机</a-select-option>
                <a-select-option value="bath">洗浴扣费终端</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="备注说明">
              <a-textarea
                v-model:value="formModel.remark"
                :rows="3"
                placeholder="可填写规则使用说明，方便后续维护"
              />
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- 餐次与金额 -->
        <a-tab-pane key="meal" tab="餐次与金额">
          <a-alert
            type="info"
            show-icon
            style="margin-bottom: 16px"
            message="可按早餐 / 午餐 / 晚餐分别设置单次额度、每餐次数和每日总额。"
          />
          <a-row :gutter="16">
            <a-col :span="8" v-for="meal in mealConfigs" :key="meal.key">
              <a-card :title="meal.title" size="small" class="meal-card">
                <a-form layout="vertical" :model="meal.model">
                  <a-form-item label="每餐最大次数">
                    <a-input-number
                      v-model:value="meal.model.maxTimes"
                      :min="0"
                      style="width: 100%"
                    />
                  </a-form-item>
                  <a-form-item label="单次金额上限(元)">
                    <a-input-number
                      v-model:value="meal.model.singleMax"
                      :min="0"
                      style="width: 100%"
                    />
                  </a-form-item>
                  <a-form-item label="每餐总额上限(元)">
                    <a-input-number
                      v-model:value="meal.model.totalMax"
                      :min="0"
                      style="width: 100%"
                    />
                  </a-form-item>
                  <a-form-item label="最小间隔(分钟)">
                    <a-input-number
                      v-model:value="meal.model.minInterval"
                      :min="0"
                      style="width: 100%"
                    />
                  </a-form-item>
                </a-form>
              </a-card>
            </a-col>
          </a-row>

          <a-divider />
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form layout="vertical" :model="formModel">
                <a-form-item label="每日总消费次数上限">
                  <a-input-number
                    v-model:value="formModel.dayMaxTimes"
                    :min="0"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-form>
            </a-col>
            <a-col :span="8">
              <a-form layout="vertical" :model="formModel">
                <a-form-item label="每日消费金额上限(元)">
                  <a-input-number
                    v-model:value="formModel.dayMaxAmount"
                    :min="0"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-form>
            </a-col>
            <a-col :span="8">
              <a-form layout="vertical" :model="formModel">
                <a-form-item label="每月消费金额上限(元)">
                  <a-input-number
                    v-model:value="formModel.monthMaxAmount"
                    :min="0"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>
        </a-tab-pane>

        <!-- 钱包与透支 -->
        <a-tab-pane key="wallet" tab="钱包与透支">
          <a-form layout="vertical" :model="formModel">
            <a-form-item label="可用钱包类型">
              <a-select
                v-model:value="formModel.walletTypes"
                mode="multiple"
                placeholder="请选择可用钱包类型"
              >
                <a-select-option value="personal">个人钱包</a-select-option>
                <a-select-option value="subsidy">补贴钱包</a-select-option>
                <a-select-option value="public">公务/公用钱包</a-select-option>
              </a-select>
            </a-form-item>

            <a-divider />

            <a-alert
              type="info"
              show-icon
              message="透支与余额控制"
              description="允许透支时，可配置透支额度；不允许透支时，可通过余额下限控制是否禁止消费。"
              style="margin-bottom: 16px"
            />

            <a-form-item label="是否允许透支">
              <a-switch v-model:checked="formModel.allowOverdraft" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="透支限额(元)">
                  <a-input-number
                    v-model:value="formModel.overdraftLimit"
                    :min="0"
                    style="width: 100%"
                    :disabled="!formModel.allowOverdraft"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="余额提醒阈值(元)">
                  <a-input-number
                    v-model:value="formModel.balanceWarn"
                    :min="0"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="余额下限禁止消费(元)">
                  <a-input-number
                    v-model:value="formModel.balanceBlock"
                    :min="0"
                    style="width: 100%"
                    :disabled="formModel.allowOverdraft"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>

        <!-- 补贴规则 -->
        <a-tab-pane key="subsidy" tab="补贴规则">
          <a-alert
            type="info"
            show-icon
            message="补贴规则"
            description="可限制补贴在指定餐别、餐厅和金额范围内使用，满足教育补贴专款专用的管理要求。"
            style="margin-bottom: 16px"
          />
          <a-form layout="vertical" :model="formModel">
            <a-form-item label="启用补贴规则">
              <a-switch v-model:checked="formModel.enableSubsidy" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="补贴适用餐别">
                  <a-select
                    v-model:value="formModel.subsidyMeals"
                    mode="multiple"
                    placeholder="选择餐别"
                    :disabled="!formModel.enableSubsidy"
                  >
                    <a-select-option value="breakfast">早餐</a-select-option>
                    <a-select-option value="lunch">午餐</a-select-option>
                    <a-select-option value="dinner">晚餐</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="补贴适用餐厅">
                  <a-select
                    v-model:value="formModel.subsidyMerchants"
                    mode="multiple"
                    placeholder="不选则表示全部餐厅"
                    :disabled="!formModel.enableSubsidy"
                  >
                    <a-select-option value="canteen1">一号食堂</a-select-option>
                    <a-select-option value="canteen2">二号食堂</a-select-option>
                    <a-select-option value="shop1">便利店</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="单餐补贴上限(元)">
                  <a-input-number
                    v-model:value="formModel.subsidyMealLimit"
                    :min="0"
                    style="width: 100%"
                    :disabled="!formModel.enableSubsidy"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="每日补贴上限(元)">
                  <a-input-number
                    v-model:value="formModel.subsidyDayLimit"
                    :min="0"
                    style="width: 100%"
                    :disabled="!formModel.enableSubsidy"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="每月补贴上限(元)">
                  <a-input-number
                    v-model:value="formModel.subsidyMonthLimit"
                    :min="0"
                    style="width: 100%"
                    :disabled="!formModel.enableSubsidy"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="超出补贴部分处理方式">
                  <a-select
                    v-model:value="formModel.subsidyOverflowMode"
                    placeholder="请选择"
                    :disabled="!formModel.enableSubsidy"
                  >
                    <a-select-option value="self">超出部分个人自费</a-select-option>
                    <a-select-option value="reject">超出则拒绝交易</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>

        <!-- 商户与品类 -->
        <a-tab-pane key="merchant" tab="商户与品类">
          <a-form layout="vertical" :model="formModel">
            <a-form-item label="餐厅范围">
              <a-radio-group v-model:value="formModel.merchantScopeType">
                <a-radio value="all">全部餐厅</a-radio>
                <a-radio value="partial">指定餐厅</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item
              v-if="formModel.merchantScopeType === 'partial'"
              label="允许消费的餐厅"
            >
              <a-select
                v-model:value="formModel.allowMerchants"
                mode="multiple"
                placeholder="请选择允许消费的餐厅"
              >
                <a-select-option value="canteen1">一号食堂</a-select-option>
                <a-select-option value="canteen2">二号食堂</a-select-option>
                <a-select-option value="shop1">便利店</a-select-option>
              </a-select>
            </a-form-item>

            <a-divider />

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="允许消费品类">
                  <a-select
                    v-model:value="formModel.allowCategories"
                    mode="multiple"
                    placeholder="不选则表示全部品类"
                  >
                    <a-select-option value="meal">套餐/主食</a-select-option>
                    <a-select-option value="drink">饮品</a-select-option>
                    <a-select-option value="snack">小吃</a-select-option>
                    <a-select-option value="dessert">甜品</a-select-option>
                    <a-select-option value="fruit">水果</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="禁止消费品类">
                  <a-select
                    v-model:value="formModel.denyCategories"
                    mode="multiple"
                    placeholder="如能量饮料等敏感品类"
                  >
                    <a-select-option value="energy">能量饮料</a-select-option>
                    <a-select-option value="coffee">高咖啡因饮品</a-select-option>
                    <a-select-option value="junk">高糖/高油炸品</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-tab-pane>
      </a-tabs>

      <template #footer>
        <div class="drawer-footer">
          <a-space>
            <a-button @click="drawerVisible = false">取消</a-button>
            <a-button type="primary" @click="onSaveRule">保存</a-button>
          </a-space>
        </div>
      </template>
    </a-drawer>

    <!-- 规则详情 Drawer -->
    <a-drawer
      v-model:visible="detailVisible"
      title="规则详情"
      :width="640"
      destroyOnClose
    >
      <a-descriptions bordered :column="2" size="small">
        <a-descriptions-item label="规则名称">
          {{ currentRecord?.ruleName }}
        </a-descriptions-item>
        <a-descriptions-item label="生效时间">
          {{ currentRecord?.effectBegin }} ~
          {{ currentRecord?.effectEnd || '长期有效' }}
        </a-descriptions-item>
        <a-descriptions-item label="生效星期">
          {{ currentRecord?.weekdaysText || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge
            :status="currentRecord?.status === 1 ? 'success' : 'default'"
            :text="currentRecord?.status === 1 ? '启用' : '停用'"
          />
        </a-descriptions-item>
        <a-descriptions-item label="限制摘要" :span="2">
          {{ currentRecord?.limitSummaryFull || currentRecord?.limitSummary }}
        </a-descriptions-item>
        <a-descriptions-item label="备注说明" :span="2">
          {{ currentRecord?.remark || '-' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <!-- 规则绑定弹窗 -->
    <RuleBindingModal @register="registerBindModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { BasicTable, useTable, type BasicColumn, TableAction } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { useModal } from '/@/components/Modal';
import {
  PlusOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';
import RuleBindingModal from './RuleBindingModal.vue';

interface RuleRecord {
  id?: string;
  ruleName: string;
  effectBegin?: string;
  effectEnd?: string | null;
  status: number;
  limitSummary?: string;
  limitSummaryFull?: string;
  weekdaysText?: string;
  scopeText?: string;
  remark?: string;
}

const { createMessage } = useMessage();

const columns: BasicColumn[] = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    key: 'ruleName',
    width: 240,
    align: 'left',
  },
  {
    title: '生效时间',
    dataIndex: 'effectRange',
    key: 'effectRange',
    width: 220,
  },
  {
    title: '适用范围',
    dataIndex: 'scopeText',
    key: 'scopeText',
    width: 220,
    ellipsis: true,
  },
  {
    title: '限制摘要',
    dataIndex: 'limitSummary',
    key: 'limitSummary',
    width: 260,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 220,
    fixed: 'right',
  },
];

const searchFormSchema = [
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: '[effectBegin,effectEnd]',
    label: '生效日期',
    component: 'RangePicker',
    colProps: { span: 8 },
  },
];

async function fakeListApi(params: Recordable) {
  // TODO: 替换为实际后端接口
  console.log('加载规则列表参数', params);
  const list: RuleRecord[] = [
    {
      id: '1',
      ruleName: '学生标准消费规则',
      effectBegin: '2025-09-01',
      effectEnd: null,
      status: 1,
      limitSummary: '每餐≤2次；单次≤30元；每日≤60元',
      limitSummaryFull: '早餐/午餐/晚餐每餐最多消费2次；单次不超过30元；每日总额不超过60元。',
      weekdaysText: '周一至周日',
      scopeText: '全校学生',
      remark: '全校默认学生消费规则',
    },
    {
      id: '2',
      ruleName: '低保学生补贴规则',
      effectBegin: '2025-09-01',
      effectEnd: null,
      status: 1,
      limitSummary: '午餐补贴12元/餐；每日补贴≤24元',
      weekdaysText: '工作日',
      scopeText: '标签：困难/补贴学生',
      remark: '仅适用于标记为“困难/补贴学生”的账户',
    },
  ];
  return {
    list,
    total: list.length,
  };
}

const [registerTable, { getSelectRows }] = useTable({
  title: '消费规则列表',
  api: fakeListApi,
  columns,
  formConfig: {
    labelWidth: 90,
    schemas: searchFormSchema,
  },
  useSearchForm: true,
  showTableSetting: true,
  bordered: false,
  striped: false,
  showIndexColumn: false,
  rowSelection: {
    type: 'checkbox',
  },
});

const [registerBindModal, { openModal: openBindModalInner }] = useModal();

const drawerVisible = ref(false);
const drawerTitle = ref('新建规则');
const detailVisible = ref(false);
const currentRecord = ref<RuleRecord | null>(null);

const formActiveTab = ref('basic');
const basicFormRef = ref();
const formModel = reactive<any>({
  ruleName: '',
  effectRange: [],
  permanent: true,
  weekdays: ['1', '2', '3', '4', '5'],
  status: 1,
  remark: '',

  // 餐次与金额
  dayMaxTimes: null,
  dayMaxAmount: null,
  monthMaxAmount: null,

  // 钱包与透支
  walletTypes: ['personal'],
  allowOverdraft: false,
  overdraftLimit: null,
  balanceWarn: 10,
  balanceBlock: 0,

  // 补贴规则
  enableSubsidy: false,
  subsidyMeals: [],
  subsidyMerchants: [],
  subsidyMealLimit: null,
  subsidyDayLimit: null,
  subsidyMonthLimit: null,
  subsidyOverflowMode: 'self',

  // 商户与品类
  merchantScopeType: 'all',
  allowMerchants: [],
  allowCategories: [],
  denyCategories: [],

  // 设备
  deviceTypes: [],
});

const mealConfigs = reactive([
  {
    key: 'breakfast',
    title: '早餐',
    model: {
      maxTimes: 2,
      singleMax: 20,
      totalMax: 30,
      minInterval: 5,
    },
  },
  {
    key: 'lunch',
    title: '午餐',
    model: {
      maxTimes: 2,
      singleMax: 30,
      totalMax: 40,
      minInterval: 5,
    },
  },
  {
    key: 'dinner',
    title: '晚餐',
    model: {
      maxTimes: 2,
      singleMax: 30,
      totalMax: 40,
      minInterval: 5,
    },
  },
]);

const basicRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
};

const hasSelection = computed(() => {
  const rows = getSelectRows();
  return rows && rows.length > 0;
});

watch(
  () => formModel.permanent,
  (val) => {
    if (val) {
      formModel.effectRange = [];
    }
  },
);

watch(
  () => formModel.allowOverdraft,
  (val) => {
    if (val) {
      formModel.balanceBlock = null;
    } else {
      formModel.overdraftLimit = null;
    }
  },
);

function openDrawer(record?: RuleRecord) {
  if (record) {
    drawerTitle.value = '编辑规则';
    Object.assign(formModel, {
      ruleName: record.ruleName,
      status: record.status,
      remark: record.remark || '',
    });
  } else {
    drawerTitle.value = '新建规则';
    Object.assign(formModel, {
      ruleName: '',
      status: 1,
      remark: '',
    });
  }
  formActiveTab.value = 'basic';
  drawerVisible.value = true;
}

function viewDetails(record: RuleRecord) {
  currentRecord.value = record;
  detailVisible.value = true;
}

function toggleStatus(record: RuleRecord) {
  const targetStatus = record.status === 1 ? 0 : 1;
  createMessage.success(`已将【${record.ruleName}】${targetStatus === 1 ? '启用' : '停用'}`);
  record.status = targetStatus;
}

function onCopyRule() {
  const rows = getSelectRows() as RuleRecord[];
  if (!rows || rows.length !== 1) {
    createMessage.warning('请选择一条要复制的规则');
    return;
  }
  const record = rows[0];
  drawerTitle.value = '复制规则';
  Object.assign(formModel, {
    ruleName: `${record.ruleName}-复制`,
    status: record.status,
    remark: record.remark || '',
  });
  formActiveTab.value = 'basic';
  drawerVisible.value = true;
}

function onBatchEnable() {
  const rows = getSelectRows() as RuleRecord[];
  if (!rows || rows.length === 0) return;
  rows.forEach((r) => (r.status = 1));
  createMessage.success(`已启用 ${rows.length} 条规则`);
}

function onBatchDisable() {
  const rows = getSelectRows() as RuleRecord[];
  if (!rows || rows.length === 0) return;
  rows.forEach((r) => (r.status = 0));
  createMessage.success(`已停用 ${rows.length} 条规则`);
}

function onSaveRule() {
  (basicFormRef.value as any)
    .validate()
    .then(() => {
      // TODO: 调用后端保存接口
      console.log('保存规则数据：', {
        formModel,
        mealConfigs,
      });
      createMessage.success('规则已保存（示例环境，仅前端展示）');
      drawerVisible.value = false;
    })
    .catch(() => {
      formActiveTab.value = 'basic';
    });
}

function openBindModal(record: RuleRecord) {
  openBindModalInner(true, { ruleId: record.id, ruleName: record.ruleName });
}
</script>

<style scoped>
.rule-list-wrapper {
  width: 100%;
}

.meal-card {
  margin-bottom: 16px;
}

.drawer-footer {
  text-align: right;
}
</style>
