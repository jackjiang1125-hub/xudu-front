<template>
  <PageWrapper title="消费账户操作台" class="account-console">
    <section class="card-section">
      <div class="section-header">
        <h2>单账户操作</h2>
        <span>适用于单个账户的余额、资料即时处理</span>
      </div>
      <div class="card-grid">
        <a-card
          v-for="card in mainCards"
          :key="card.key"
          :hoverable="true"
          class="action-card"
          @click="openAction(card)"
        >
          <div class="action-card__icon">
            <Icon :icon="card.icon" :size="28" />
          </div>
          <div class="action-card__content">
            <h3>{{ card.title }}</h3>
            <p>{{ getCardDesc(card.key) }}</p>
          </div>
          <Icon icon="mdi:chevron-right" :size="20" class="action-card__arrow" />
        </a-card>
      </div>
    </section>

    <section class="card-section">
      <div class="section-header">
        <h2>批量操作</h2>
        <span>一次性处理多个账户的充值与退款</span>
      </div>
      <div class="card-grid card-grid--batch">
        <a-card
          v-for="card in batchCards"
          :key="card.key"
          :hoverable="true"
          class="action-card"
          @click="openAction(card)"
        >
          <div class="action-card__icon">
            <Icon :icon="card.icon" :size="28" />
          </div>
          <div class="action-card__content">
            <h3>{{ card.title }}</h3>
            <p>{{ getCardDesc(card.key) }}</p>
          </div>
          <Icon icon="mdi:chevron-right" :size="20" class="action-card__arrow" />
        </a-card>
      </div>
    </section>

    <BasicModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="760"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="modalFormRef"
        layout="vertical"
        :model="formModel"
        :rules="formRules"
        class="operation-form"
      >
        <a-form-item label="选择账户" name="account">
          <a-select
            v-model:value="accountFieldValue"
            allow-clear
            show-search
            :mode="isBatchOperation ? 'multiple' : undefined"
            placeholder="请选择账户"
            :options="accountOptions"
            :filter-option="filterAccount"
          />
        </a-form-item>

        <div v-if="selectedAccount" class="account-preview">
          <a-descriptions :column="3" bordered size="small">
            <a-descriptions-item label="账户编号">{{ selectedAccount.accountNo }}</a-descriptions-item>
            <a-descriptions-item label="姓名">{{ selectedAccount.realName }}</a-descriptions-item>
            <a-descriptions-item label="手机号">{{ selectedAccount.phone }}</a-descriptions-item>
            <a-descriptions-item label="部门">{{ selectedAccount.department }}</a-descriptions-item>
            <a-descriptions-item label="岗位">{{ selectedAccount.position }}</a-descriptions-item>
            <a-descriptions-item label="账户状态">
              <a-tag :color="selectedAccount.status === '正常' ? 'success' : 'warning'">
                {{ selectedAccount.status }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="账户类型">{{ selectedAccount.type }}</a-descriptions-item>
            <a-descriptions-item label="账户等级">{{ selectedAccount.level }}</a-descriptions-item>
            <a-descriptions-item label="现金钱包 (元)">{{ selectedAccount.cashBalance.toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="补贴钱包 (元)">{{ selectedAccount.subsidyBalance.toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="可用余额 (元)">{{ selectedAccount.totalBalance.toFixed(2) }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <template v-if="currentAction && !isProfileEdit">
          <a-form-item label="操作原因" name="reasons">
            <a-select
              v-model:value="formModel.reasons"
              mode="multiple"
              placeholder="请选择操作原因"
              :options="operationReasonOptions"
            />
          </a-form-item>

          <a-form-item label="通知范围" name="notifyScopes">
            <a-select
              v-model:value="formModel.notifyScopes"
              mode="multiple"
              placeholder="请选择通知范围"
              :options="notifyScopeOptions"
            />
          </a-form-item>

          <a-form-item :label="amountLabel" name="amount">
            <a-input-number
              v-model:value="formModel.amount"
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="请输入金额"
              addon-after="元"
            />
          </a-form-item>

          <a-form-item label="备注说明" name="remark">
            <a-textarea
              v-model:value="formModel.remark"
              placeholder="可填写本次操作说明，便于追溯"
              :rows="3"
              :max-length="200"
              show-count
            />
          </a-form-item>
        </template>

        <template v-else-if="currentAction">
          <a-form-item label="账户类别" name="type">
            <a-select v-model:value="formModel.type" :options="accountTypeOptions" placeholder="请选择账户类别" />
          </a-form-item>

          <a-form-item label="账户等级" name="level">
            <a-select v-model:value="formModel.level" :options="accountLevelOptions" placeholder="请选择账户等级" />
          </a-form-item>

          <a-form-item label="所属部门" name="department">
            <a-input v-model:value="formModel.department" placeholder="请输入所属部门" />
          </a-form-item>

          <a-form-item label="岗位信息" name="position">
            <a-input v-model:value="formModel.position" placeholder="请输入岗位信息" />
          </a-form-item>

          <a-form-item label="联系方式" name="phone">
            <a-input v-model:value="formModel.phone" placeholder="请输入联系电话" />
          </a-form-item>

          <a-form-item label="资料备注" name="remark">
            <a-textarea
              v-model:value="formModel.remark"
              placeholder="如需说明请填写，最多 200 字"
              :rows="3"
              :max-length="200"
              show-count
            />
          </a-form-item>
        </template>
      </a-form>
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import type { FormInstance } from 'ant-design-vue';
  import type { PosAccountSnapshot } from './accountConsole.data';
  import { computed, reactive, ref, watch } from 'vue';
  import { PageWrapper } from '/@/components/Page';
  import { BasicModal } from '/@/components/Modal';
  import { Icon } from '/@/components/Icon';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    accountLevelOptions,
    accountList,
    accountTypeOptions,
    actionCards,
    notifyScopeOptions,
    operationReasonOptions,
  } from './accountConsole.data';

  interface OperationFormModel {
    accountIds: string[];
    reasons: string[];
    notifyScopes: string[];
    amount?: number;
    remark: string;
    type?: string;
    level?: string;
    department?: string;
    position?: string;
    phone?: string;
  }

  const mainCards = actionCards.filter((item) => !item.key.includes('batch'));
  const batchCards = actionCards.filter((item) => item.key.includes('batch'));

  const modalVisible = ref(false);
  const currentAction = ref<(typeof actionCards)[number] | null>(null);
  const modalFormRef = ref<FormInstance | null>(null);
  const { createMessage } = useMessage();

  const formModel = reactive<OperationFormModel>({
    accountIds: [],
    reasons: [],
    notifyScopes: [],
    remark: '',
  });

  const isBatchOperation = computed(() =>
    currentAction.value ? /batch/.test(currentAction.value.key) : false,
  );
  const isProfileEdit = computed(() => currentAction.value?.key === 'profile-edit');

  const accountOptions = accountList.map((item) => ({
    label: `${item.realName}（${item.accountNo}）`,
    value: item.id,
  }));

  const accountMap = accountList.reduce<Record<string, PosAccountSnapshot>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const accountFieldValue = computed({
    get() {
      if (isBatchOperation.value) {
        return [...formModel.accountIds];
      }
      return formModel.accountIds[0] ?? undefined;
    },
    set(value: string | string[] | undefined) {
      if (isBatchOperation.value) {
        formModel.accountIds = Array.isArray(value) ? value : value ? [value] : [];
      } else {
        formModel.accountIds = value ? [value as string] : [];
      }
    },
  });

  const selectedAccount = computed(() => {
    if (isBatchOperation.value) return null;
    const accountId = formModel.accountIds[0];
    return accountId ? accountMap[accountId] ?? null : null;
  });

  watch(
    () => selectedAccount.value,
    (account) => {
      if (account && isProfileEdit.value) {
        formModel.type = account.type;
        formModel.level = account.level;
        formModel.department = account.department;
        formModel.position = account.position;
        formModel.phone = account.phone;
      }
    },
  );

  const formRules = computed(() => {
    const accountValidator = () => {
      if (!formModel.accountIds.length) {
        return Promise.reject(new Error('请选择账户'));
      }
      return Promise.resolve();
    };

    if (isProfileEdit.value) {
      return {
        account: [{ validator: accountValidator, trigger: 'change' }],
        type: [{ required: true, message: '请选择账户类别' }],
        level: [{ required: true, message: '请选择账户等级' }],
        department: [{ required: true, message: '请输入所属部门' }],
      };
    }

    return {
      account: [{ validator: accountValidator, trigger: 'change' }],
      amount: [{ required: true, message: '请输入金额' }],
    };
  });

  const modalTitle = computed(() => currentAction.value?.title ?? '账户操作');

  const amountLabel = computed(() => {
    switch (currentAction.value?.key) {
      case 'recharge':
        return '充值金额';
      case 'refund':
        return '退款金额';
      case 'open':
        return '开户初始金额';
      case 'subsidy-reverse':
        return '冲正金额';
      case 'recharge-batch':
        return '批量充值金额';
      case 'refund-batch':
        return '批量退款金额';
      default:
        return '操作金额';
    }
  });

  function openAction(card: (typeof actionCards)[number]) {
    currentAction.value = card;
    resetForm();
    modalVisible.value = true;
  }

  function resetForm() {
    formModel.accountIds = [];
    formModel.reasons = [];
    formModel.notifyScopes = [];
    formModel.amount = undefined;
    formModel.remark = '';
    formModel.type = undefined;
    formModel.level = undefined;
    formModel.department = undefined;
    formModel.position = '';
    formModel.phone = '';
    modalFormRef.value?.clearValidate?.();
  }

  function getCardDesc(key: string) {
    switch (key) {
      case 'recharge':
        return '为指定账户补充余额';
      case 'refund':
        return '处理消费纠纷和差额退款';
      case 'open':
        return '快速创建新账户并初始化额度';
      case 'subsidy-reverse':
        return '补贴核算差错时进行冲正';
      case 'profile-edit':
        return '更新账户资料与权限配置';
      case 'recharge-batch':
        return '批量为多个账户充值';
      case 'refund-batch':
        return '批量为多个账户退款';
      default:
        return '';
    }
  }

  function filterAccount(input: string, option: { label: string }) {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  }

  function handleSubmit() {
    modalFormRef.value
      ?.validate()
      .then(() => {
        createMessage.success(`「${currentAction.value?.title}」操作已提交（示例数据，无真实操作）`);
        modalVisible.value = false;
        resetForm();
      })
      .catch(() => {});
  }

  function handleCancel() {
    modalVisible.value = false;
    resetForm();
  }
</script>

<style scoped>
  .account-console {
    background: #f5f7fb;
    padding-bottom: 12px;
  }

  .card-section {
    margin-bottom: 32px;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 14px;
    color: var(--text-color-base, #1f2a44);
  }

  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .section-header span {
    font-size: 13px;
    color: var(--text-color-secondary, #6f7fa3);
  }

  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .card-grid--batch {
    margin-top: 8px;
  }

  .account-console :deep(.ant-card) {
    background: linear-gradient(135deg, var(--ant-primary-color, var(--primary-color, #2f54eb)), rgba(255, 255, 255, 0.08));
    border: none;
    color: #ffffff;
  }

  .action-card {
    flex: 0 1 240px;
    max-width: 240px;
    height: 140px;
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px;
    box-shadow: 0 10px 22px rgba(38, 76, 150, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 32px rgba(38, 76, 150, 0.38);
  }

  .action-card__icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    margin-bottom: 12px;
  }

  .action-card__content h3 {
    font-size: 17px;
    margin-bottom: 6px;
    color: #ffffff;
  }

  .action-card__content p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.4;
  }

  .action-card__arrow {
    position: absolute;
    right: 18px;
    bottom: 18px;
    color: rgba(255, 255, 255, 0.85);
    transition: transform 0.2s;
  }

  .action-card:hover .action-card__arrow {
    transform: translateX(4px);
  }

  .operation-form {
    margin-top: 12px;
  }

  .account-preview {
    margin-bottom: 16px;
  }

  .account-preview :deep(.ant-descriptions-item-label) {
    width: 120px;
  }
</style>
