<template>
  <PageWrapper contentFullHeight @back="handleBack">
    <template #title>账户详情</template>
    <template #extra>
      <a-space v-if="detail">
        <a-tag :color="getStatusColor(detail.accountStatus)">{{ formatStatus(detail.accountStatus) }}</a-tag>
        <a-tag color="blue">{{ formatType(detail.accountType) }}</a-tag>
        <span class="extra-text">账户编号：{{ detail.accountNo }}</span>
      </a-space>
    </template>

    <a-spin :spinning="loading">
      <div v-if="detail" class="account-detail-page">
        <a-card class="header-card" bordered>
          <a-row :gutter="16" align="middle">
            <a-col :span="10">
              <div class="account-basic">
                <div class="avatar-wrap">
                  <a-avatar :size="72">
                    <span class="avatar-placeholder">?</span>
                  </a-avatar>
                </div>
                <div class="info-wrap">
                  <div class="name-row">
                    <span class="name">{{ detail.realName }}</span>
                    <a-tag color="blue" class="chip">{{ formatType(detail.accountType) }}</a-tag>
                    <a-tag color="geekblue" class="chip">{{ formatLevel(detail.accountLevel) }}</a-tag>
                  </div>
                  <div class="sub-row">
                    <span class="sub-text">
                      {{ detail.departmentName || '未分配部门' }}
                      <span v-if="detail.position"> / {{ detail.position }}</span>
                    </span>
                  </div>
                  <div class="sub-row">
                    <span class="sub-text">手机号：{{ detail.phone || '-' }}</span>
                    <span class="divider">|</span>
                    <span class="sub-text">性别：{{ formatGender(detail.gender) }}</span>
                  </div>
                  <div class="sub-row">
                    <span class="sub-text">开户时间：{{ detail.registerTime || '-' }}</span>
                    <span class="divider">|</span>
                    <span class="sub-text">最近活跃：{{ detail.lastActiveTime || '-' }}</span>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="14">
              <div class="header-metrics">
                <div class="metric-item total">
                  <div class="label">账户总余额</div>
                  <div class="value">{{ formatAmount(detail.wallet?.totalBalance) }}</div>
                </div>
                <div class="metric-item">
                  <div class="label">现金钱包</div>
                  <div class="value">{{ formatAmount(detail.wallet?.cashWallet) }}</div>
                </div>
                <div class="metric-item">
                  <div class="label">补贴钱包</div>
                  <div class="value">{{ formatAmount(detail.wallet?.subsidyWallet) }}</div>
                </div>
                <div class="metric-item">
                  <div class="label">欠费金额</div>
                  <div class="value arrears">{{ formatAmount(detail.wallet?.arrearsAmount) }}</div>
                </div>
              </div>
              <div class="header-status">
                <div class="status-item">
                  <span class="label">账户状态：</span>
                  <a-tag :color="getStatusColor(detail.accountStatus)">{{ formatStatus(detail.accountStatus) }}</a-tag>
                </div>
                <div class="status-item">
                  <span class="label">自动充值：</span>
                  <span>{{ detail.autoRechargeEnabled ? '开启' : '关闭' }}</span>
                  <span v-if="detail.autoRechargeEnabled" class="muted">
                    （阈值 {{ detail.autoRechargeThreshold }} 元 / 金额 {{ detail.autoRechargeAmount }} 元）
                  </span>
                </div>
                <div class="status-item">
                  <span class="label">交易权限：</span>
                  <span>
                    {{
                      [
                        detail.allowMealOrder ? '订餐' : '',
                        detail.allowDelivery ? '外送' : '',
                        detail.allowSelfPickup ? '自取' : '',
                      ]
                        .filter(Boolean)
                        .join(' / ') || '无'
                    }}
                  </span>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="action-card" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="4">
              <div class="op-tile op-recharge" @click="openRecharge">
                <div class="op-icon">💰</div>
                <div class="op-title">充值</div>
                <div class="op-desc">为账户充值余额</div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="op-tile op-withdraw" @click="openRefund">
                <div class="op-icon">↩️</div>
                <div class="op-title">取款 / 退款</div>
                <div class="op-desc">余额原路退回</div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="op-tile op-freeze" @click="handleFreeze">
                <div class="op-icon">🧊</div>
                <div class="op-title">{{ detail.accountStatus === 'suspended' ? '解除冻结' : '冻结' }}</div>
                <div class="op-desc">{{ detail.accountStatus === 'suspended' ? '恢复交易' : '暂停消费' }}</div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="op-tile op-loss" @click="handleLoss">
                <div class="op-icon">📵</div>
                <div class="op-title">挂失</div>
                <div class="op-desc">卡片丢失立即挂失</div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="op-tile op-pwd" @click="handleChangePayPwd">
                <div class="op-icon">🔐</div>
                <div class="op-title">修改支付密码</div>
                <div class="op-desc">重置或修改支付密码</div>
              </div>
            </a-col>
            <a-col :span="4">
              <div class="op-tile op-card" @click="handleReissueCard">
                <div class="op-icon">💳</div>
                <div class="op-title">一键补卡</div>
                <div class="op-desc">挂失旧卡并补发</div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <a-row :gutter="16" class="info-row">
          <a-col :span="12">
            <a-card title="账户信息" bordered>
              <a-descriptions size="small" :column="2" bordered>
                <a-descriptions-item label="账户编号">{{ detail.accountNo }}</a-descriptions-item>
                <a-descriptions-item label="用户编号">{{ detail.userId || '-' }}</a-descriptions-item>
                <a-descriptions-item label="身份证号">{{ detail.idCardNo || '-' }}</a-descriptions-item>
                <a-descriptions-item label="胸牌编号">{{ detail.badgeNo || '-' }}</a-descriptions-item>
                <a-descriptions-item label="注册渠道">{{ detail.registerChannel || '-' }}</a-descriptions-item>
                <a-descriptions-item label="标签">
                  {{ (detail.tags && detail.tags.join(' / ')) || '无' }}
                </a-descriptions-item>
                <a-descriptions-item label="备注" :span="2">
                  {{ detail.remark || '暂无备注' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="额度与权限" bordered>
              <a-descriptions size="small" :column="2" bordered>
                <a-descriptions-item label="日消费限额">
                  {{ formatAmount(detail.limits?.dailyConsumptionLimit) }}
                </a-descriptions-item>
                <a-descriptions-item label="单笔消费限额">
                  {{ formatAmount(detail.limits?.singleConsumptionLimit) }}
                </a-descriptions-item>
                <a-descriptions-item label="日充值限额">
                  {{ formatAmount(detail.limits?.dailyRechargeLimit) }}
                </a-descriptions-item>
                <a-descriptions-item label="单笔充值限额">
                  {{ formatAmount(detail.limits?.singleRechargeLimit) }}
                </a-descriptions-item>
                <a-descriptions-item label="订餐权限">
                  {{ detail.allowMealOrder ? '允许' : '禁止' }}
                </a-descriptions-item>
                <a-descriptions-item label="外送权限">
                  {{ detail.allowDelivery ? '允许' : '禁止' }}
                </a-descriptions-item>
                <a-descriptions-item label="自取权限">
                  {{ detail.allowSelfPickup ? '允许' : '禁止' }}
                </a-descriptions-item>
                <a-descriptions-item label="自动充值">
                  <span v-if="detail.autoRechargeEnabled">
                    阈值 {{ detail.autoRechargeThreshold }} 元 / 金额 {{ detail.autoRechargeAmount }} 元
                  </span>
                  <span v-else>关闭</span>
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="txn-card" :bordered="false">
          <template #title>今日收支明细</template>
          <template #extra>
            <a-space>
              <span class="muted">显示范围：</span>
              <a-switch
                v-model:checked="showAllHistory"
                checked-children="全部流水"
                un-checked-children="仅今日"
                @change="reloadTxn"
              />
            </a-space>
          </template>

          <div class="today-summary-bar">
            <div class="summary-item">
              <span class="label">今日交易：</span>
              <span class="value">{{ todaySummary.totalCount }} 笔</span>
            </div>
            <div class="summary-item">
              <span class="label">充值：</span>
              <span class="value">{{ formatAmount(todaySummary.rechargeAmount) }} 元</span>
              <span class="sub">（{{ todaySummary.rechargeCount }} 笔）</span>
            </div>
            <div class="summary-item">
              <span class="label">退款：</span>
              <span class="value">{{ formatAmount(todaySummary.refundAmount) }} 元</span>
              <span class="sub">（{{ todaySummary.refundCount }} 笔）</span>
            </div>
            <div class="summary-item">
              <span class="label">消费：</span>
              <span class="value">{{ formatAmount(todaySummary.expenseAmount) }} 元</span>
              <span class="sub">（{{ todaySummary.expenseCount }} 笔）</span>
            </div>
          </div>

          <BasicTable @register="registerTxnTable">
            <template #bizType="{ text }">
              {{ formatTransactionType(text) }}
            </template>
            <template #direction="{ text }">
              <a-tag :color="text === 'income' ? 'green' : 'red'">
                {{ text === 'income' ? '收入' : '支出' }}
              </a-tag>
            </template>
          </BasicTable>
        </a-card>
      </div>
      <a-empty v-else description="未找到账户信息" />
    </a-spin>

    <BasicModal v-model:visible="rechargeVisible" title="账户充值" @ok="submitRecharge" width="480">
      <BasicForm @register="registerRechargeForm" />
    </BasicModal>

    <BasicModal v-model:visible="refundVisible" title="账户取款 / 退款" @ok="submitRefund" width="480">
      <BasicForm @register="registerRefundForm" />
    </BasicModal>

    <BasicModal v-model:visible="editVisible" title="修改账户资料" @ok="submitEdit" width="720">
      <BasicForm @register="registerEditForm" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';

  import {
    accountLevelOptions,
    accountStatusOptions,
    accountTransactionColumns,
    accountTransactionSearchFormSchema,
    accountTypeOptions,
    editAccountFormSchema,
    rechargeFormSchema,
    refundFormSchema,
    transactionTypeOptions,
  } from './posAccount.data';
  import {
    changeAccountStatus,
    getPosAccountDetail,
    getPosAccountTodaySummary,
    getPosAccountTransactions,
    rechargeAccount,
    refundAccount,
    reissueCard,
    reportLoss,
    resetPayPassword,
    updateAccountProfile,
  } from '/@/api/pos/posAccount';
  import type { PosAccountRecord, PosAccountTodaySummary } from '/@/api/pos/model/posAccountModel';

  const route = useRoute();
  const router = useRouter();
  const { createMessage, createConfirm } = useMessage();

  const accountId = computed<string | undefined>(() => {
    return (route.query.accountId as string) || (route.query.id as string) || (route.params.id as string);
  });

  const detail = ref<PosAccountRecord | null>(null);
  const loading = ref(false);
  const todaySummary = ref<PosAccountTodaySummary>(createEmptySummary());
  const showAllHistory = ref(false);

  const [registerTxnTable, { reload: reloadTxn }] = useTable({
    rowKey: 'id',
    api: fetchTransactionList,
    columns: accountTransactionColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 100,
      schemas: accountTransactionSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    showIndexColumn: false,
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
  });

  const rechargeVisible = ref(false);
  const refundVisible = ref(false);
  const editVisible = ref(false);

  const [registerRechargeForm, { validate: validateRecharge, resetFields: resetRecharge }] = useForm({
    labelWidth: 100,
    schemas: rechargeFormSchema,
    showActionButtonGroup: false,
  });

  const [registerRefundForm, { validate: validateRefund, resetFields: resetRefund }] = useForm({
    labelWidth: 100,
    schemas: refundFormSchema,
    showActionButtonGroup: false,
  });

  const [registerEditForm, { validate: validateEdit, resetFields: resetEdit, setFieldsValue }] = useForm({
    labelWidth: 100,
    schemas: editAccountFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
  });

  onMounted(() => {
    loadDetail();
  });

  function createEmptySummary(): PosAccountTodaySummary {
    return {
      totalCount: 0,
      rechargeAmount: 0,
      rechargeCount: 0,
      refundAmount: 0,
      refundCount: 0,
      expenseAmount: 0,
      expenseCount: 0,
    };
  }

  async function fetchTransactionList(params: Record<string, any> = {}) {
    if (!accountId.value) {
      return { records: [], total: 0 };
    }
    const payload: Record<string, any> = {
      accountId: accountId.value,
      showAll: showAllHistory.value,
      ...params,
    };
    if (Array.isArray(payload.occurTimeRange) && payload.occurTimeRange.length === 2) {
      const [start, end] = payload.occurTimeRange;
      payload.occurTimeStart = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
      payload.occurTimeEnd = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
    }
    delete payload.occurTimeRange;
    try {
      return await getPosAccountTransactions(payload);
    } catch (error) {
      console.warn('load transactions failed', error);
      return { records: [], total: 0 };
    }
  }

  async function loadDetail() {
    if (!accountId.value) {
      detail.value = null;
      todaySummary.value = createEmptySummary();
      return;
    }
    loading.value = true;
    try {
      detail.value = await getPosAccountDetail(accountId.value);
      await loadTodaySummary();
      reloadTxn();
    } catch (error) {
      console.warn('load account detail failed', error);
      detail.value = null;
      todaySummary.value = createEmptySummary();
      createMessage.warning('未找到账户信息');
    } finally {
      loading.value = false;
    }
  }

  async function loadTodaySummary() {
    if (!accountId.value) {
      todaySummary.value = createEmptySummary();
      return;
    }
    try {
      todaySummary.value = await getPosAccountTodaySummary(accountId.value);
    } catch (error) {
      todaySummary.value = createEmptySummary();
    }
  }

  function openRecharge() {
    if (!detail.value) return;
    rechargeVisible.value = true;
    resetRecharge();
  }

  async function submitRecharge() {
    if (!detail.value) return;
    const values = await validateRecharge();
    await rechargeAccount({
      accountId: detail.value.id,
      walletType: values.walletType,
      amount: values.amount,
      channel: values.channel,
      remark: values.remark,
    });
    createMessage.success('充值成功');
    rechargeVisible.value = false;
    await loadDetail();
  }

  function openRefund() {
    if (!detail.value) return;
    refundVisible.value = true;
    resetRefund();
  }

  async function submitRefund() {
    if (!detail.value) return;
    const values = await validateRefund();
    await refundAccount({
      accountId: detail.value.id,
      walletType: values.walletType,
      amount: values.amount,
      originalBizNo: values.bizNo,
      remark: values.remark,
    });
    createMessage.success('退款成功');
    refundVisible.value = false;
    await loadDetail();
  }

  function openEditProfile() {
    if (!detail.value) return;
    editVisible.value = true;
    resetEdit();
    setFieldsValue({
      realName: detail.value.realName,
      phone: detail.value.phone,
      gender: detail.value.gender,
      departmentName: detail.value.departmentName,
      position: detail.value.position,
      accountStatus: detail.value.accountStatus,
      remark: detail.value.remark,
    });
  }

  async function submitEdit() {
    if (!detail.value) return;
    const values = await validateEdit();
    await updateAccountProfile({
      accountId: detail.value.id,
      realName: values.realName,
      phone: values.phone,
      gender: values.gender,
      deptId: detail.value.departmentId,
      departmentName: values.departmentName,
      position: values.position,
      accountStatus: values.accountStatus,
      remark: values.remark,
      tags: detail.value.tags,
    });
    createMessage.success('资料已更新');
    editVisible.value = false;
    await loadDetail();
  }

  function handleFreeze() {
    if (!detail.value) return;
    const isFrozen = detail.value.accountStatus === 'suspended';
    createConfirm({
      title: isFrozen ? '解除冻结' : '冻结账户',
      iconType: isFrozen ? 'info' : 'warning',
      content: isFrozen
        ? `确认解除账户【${detail.value.realName}】的冻结状态？`
        : `确认冻结账户【${detail.value.realName}】？冻结后将无法消费。`,
      onOk: async () => {
        if (!detail.value) return;
        await changeAccountStatus({
          accountId: detail.value.id,
          targetStatus: isFrozen ? 'active' : 'suspended',
        });
        createMessage.success(isFrozen ? '已解除冻结' : '账户已冻结');
        await loadDetail();
      },
    });
  }

  function handleLoss() {
    if (!detail.value) return;
    createConfirm({
      title: '账户挂失',
      iconType: 'warning',
      content: `确认对账户【${detail.value.realName}】进行挂失处理？系统将提示前台卡片挂失。`,
      onOk: async () => {
        if (!detail.value) return;
        await reportLoss({ accountId: detail.value.id });
        createMessage.success('挂失操作已提交');
      },
    });
  }

  function handleChangePayPwd() {
    if (!detail.value) return;
    createConfirm({
      title: '修改支付密码',
      iconType: 'info',
      content: `确认为账户【${detail.value.realName}】重置/修改支付密码？`,
      onOk: async () => {
        if (!detail.value) return;
        await resetPayPassword({ accountId: detail.value.id });
        createMessage.success('已发起支付密码修改流程');
      },
    });
  }

  function handleReissueCard() {
    if (!detail.value) return;
    createConfirm({
      title: '一键补卡',
      iconType: 'warning',
      content: `确认为账户【${detail.value.realName}】挂失旧卡并补发新卡？`,
      onOk: async () => {
        if (!detail.value) return;
        await reissueCard({ accountId: detail.value.id });
        createMessage.success('补卡申请已提交');
      },
    });
  }

  function formatFromOptions<T extends string>(collection: { label: string; value: T }[], value: T) {
    const match = collection.find((item) => item.value === value);
    return match ? match.label : value;
  }

  function formatType(value: string) {
    return formatFromOptions(accountTypeOptions as any, value);
  }

  function formatLevel(value: string) {
    return formatFromOptions(accountLevelOptions as any, value);
  }

  function formatStatus(value: string) {
    return formatFromOptions(accountStatusOptions as any, value);
  }

  function formatGender(value: string) {
    switch (value) {
      case 'male':
        return '男';
      case 'female':
        return '女';
      default:
        return '其他';
    }
  }

  function getStatusColor(value: string) {
    switch (value) {
      case 'active':
        return 'green';
      case 'suspended':
        return 'orange';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  }

  function formatAmount(value: number | undefined) {
    return Number(value ?? 0).toFixed(2);
  }

  function formatTransactionType(value: string) {
    return formatFromOptions(transactionTypeOptions as any, value as any);
  }

  function handleBack() {
    router.back();
  }
</script>

<style scoped>
  .account-detail-page {
    padding-bottom: 16px;
  }

  .extra-text {
    color: #999;
    font-size: 12px;
  }

  .header-card {
    margin-bottom: 16px;
  }

  .account-basic {
    display: flex;
    align-items: center;
  }

  .avatar-wrap {
    margin-right: 16px;
  }

  .avatar-placeholder {
    font-size: 24px;
    line-height: 72px;
  }

  .info-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .name-row .name {
    font-size: 20px;
    font-weight: 600;
  }

  .chip {
    border-radius: 999px;
  }

  .sub-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #666;
  }

  .divider {
    color: #d9d9d9;
  }

  .header-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }

  .metric-item {
    padding: 8px 12px;
    border-radius: 6px;
    background: #fafafa;
  }

  .metric-item.total {
    background: #f0f7ff;
    border: 1px solid #1890ff;
  }

  .metric-item .label {
    font-size: 12px;
    color: #999;
  }

  .metric-item .value {
    margin-top: 4px;
    font-size: 20px;
    font-weight: 600;
    color: #1890ff;
  }

  .metric-item .value.arrears {
    color: #f5222d;
  }

  .header-status {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: #666;
  }

  .status-item .label {
    color: #999;
    margin-right: 4px;
  }

  .muted {
    color: #999;
    font-size: 12px;
  }

  .action-card {
    margin-bottom: 16px;
  }

  .op-tile {
    cursor: pointer;
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    background: #fafafa;
    transition: all 0.2s;
  }

  .op-tile:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .op-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .op-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .op-desc {
    font-size: 12px;
    color: #666;
  }

  .info-row {
    margin-bottom: 16px;
  }

  .txn-card {
    margin-bottom: 8px;
  }

  .today-summary-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 10px 16px;
    margin-bottom: 12px;
    border-radius: 6px;
    background: #f7f9fc;
  }

  .summary-item .label {
    color: #999;
    margin-right: 4px;
  }

  .summary-item .value {
    font-weight: 600;
  }

  .summary-item .sub {
    margin-left: 4px;
    color: #999;
    font-size: 12px;
  }
</style>
