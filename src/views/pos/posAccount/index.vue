<template>
  <PageWrapper title="用户账户列表">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-alert type="info" show-icon>
          <template #message>账户信息仅用于展示示例数据，可按条件筛选。</template>
        </a-alert>
      </template>
      <template #type="{ text }">
        <a-tag color="blue">{{ formatType(text) }}</a-tag>
      </template>
      <template #level="{ text }">
        <a-tag color="purple">{{ formatLevel(text) }}</a-tag>
      </template>
      <template #status="{ text }">
        <a-tag :color="getStatusColor(text)">{{ formatStatus(text) }}</a-tag>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableActions(record)" />
      </template>
      <template #expandedRowRender="{ record }">
        <div class="expand-content">
          <a-descriptions size="small" :column="3" bordered>
            <a-descriptions-item label="账户编号">{{ record.accountNo }}</a-descriptions-item>
            <a-descriptions-item label="用户姓名">{{ record.realName }}</a-descriptions-item>
            <a-descriptions-item label="所属部门">{{ record.department }}</a-descriptions-item>
            <a-descriptions-item label="手机号">{{ record.phone }}</a-descriptions-item>
            <a-descriptions-item label="职位">{{ record.position }}</a-descriptions-item>
            <a-descriptions-item label="证件号码">{{ record.idCardNo }}</a-descriptions-item>
            <a-descriptions-item label="胸牌编号">{{ record.badgeNo ?? '—' }}</a-descriptions-item>
            <a-descriptions-item label="注册渠道">{{ record.registerChannel }}</a-descriptions-item>
            <a-descriptions-item label="注册时间">{{ record.registerTime }}</a-descriptions-item>
          </a-descriptions>
          <a-divider orientation="left" plain>钱包信息</a-divider>
          <div class="wallet-summary">
            <div class="wallet-card">
              <div class="label">现金钱包</div>
              <div class="value">{{ formatAmount(record.wallet.cashWallet) }}</div>
            </div>
            <div class="wallet-card">
              <div class="label">补贴钱包</div>
              <div class="value">{{ formatAmount(record.wallet.subsidyWallet) }}</div>
            </div>
            <div class="wallet-card">
              <div class="label">礼品钱包</div>
              <div class="value">{{ formatAmount(record.wallet.giftWallet) }}</div>
            </div>
            <div class="wallet-card">
              <div class="label">冻结金额</div>
              <div class="value">{{ formatAmount(record.wallet.frozenAmount) }}</div>
            </div>
            <div class="wallet-card">
              <div class="label">信用额度</div>
              <div class="value">{{ formatAmount(record.wallet.creditLimit) }}</div>
            </div>
            <div class="wallet-card">
              <div class="label">欠费金额</div>
              <div class="value arrears">{{ formatAmount(record.wallet.arrearsAmount) }}</div>
            </div>
            <div class="wallet-card total">
              <div class="label">账户总余额</div>
              <div class="value">{{ formatAmount(record.wallet.totalBalance) }}</div>
            </div>
          </div>
          <a-divider orientation="left" plain>权限与限制</a-divider>
          <a-descriptions size="small" :column="3" bordered>
            <a-descriptions-item label="日消费限额">{{ formatAmount(record.limits.dailyConsumptionLimit) }}</a-descriptions-item>
            <a-descriptions-item label="单笔消费限额">{{ formatAmount(record.limits.singleConsumptionLimit) }}</a-descriptions-item>
            <a-descriptions-item label="日充值限额">{{ formatAmount(record.limits.dailyRechargeLimit) }}</a-descriptions-item>
            <a-descriptions-item label="单笔充值限额">{{ formatAmount(record.limits.singleRechargeLimit) }}</a-descriptions-item>
            <a-descriptions-item label="允许订餐">{{ record.allowMealOrder ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="允许外送">{{ record.allowDelivery ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="允许自取">{{ record.allowSelfPickup ? '是' : '否' }}</a-descriptions-item>
            <a-descriptions-item label="自动充值">{{ record.autoRechargeEnabled ? `是 (阈值${record.autoRechargeThreshold}元 / 金额${record.autoRechargeAmount}元)` : '否' }}</a-descriptions-item>
          </a-descriptions>
          <a-divider orientation="left" plain>绑定信息</a-divider>
          <div class="bindings">
            <div>
              <div class="label">绑定设备</div>
              <a-tag v-for="device in record.bindDevices" :key="device" color="blue">{{ device }}</a-tag>
              <span v-if="!record.bindDevices?.length">暂无</span>
            </div>
            <div>
              <div class="label">关联卡号</div>
              <a-tag v-for="card in record.associatedCards" :key="card" color="purple">{{ card }}</a-tag>
              <span v-if="!record.associatedCards?.length">暂无</span>
            </div>
            <div>
              <div class="label">标签</div>
              <a-tag v-for="tag in record.tags" :key="tag" color="processing">{{ tag }}</a-tag>
              <span v-if="!record.tags?.length">暂无</span>
            </div>
          </div>
          <a-divider orientation="left" plain>备注</a-divider>
          <p class="remark">
            {{ record.remark || '暂无备注信息' }}
          </p>
        </div>
      </template>
    </BasicTable>

    <BasicModal v-model:visible="detailVisible" title="账户详情" :footer="null" width="920">
      <template v-if="detailRecord">
        <a-descriptions bordered size="small" :column="3">
          <a-descriptions-item label="账户编号">{{ detailRecord.accountNo }}</a-descriptions-item>
          <a-descriptions-item label="账户类型">{{ formatType(detailRecord.type) }}</a-descriptions-item>
          <a-descriptions-item label="账户等级">{{ formatLevel(detailRecord.level) }}</a-descriptions-item>
          <a-descriptions-item label="账户状态">
            <a-tag :color="getStatusColor(detailRecord.status)">{{ formatStatus(detailRecord.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用户姓名">{{ detailRecord.realName }}</a-descriptions-item>
          <a-descriptions-item label="手机号">{{ detailRecord.phone }}</a-descriptions-item>
          <a-descriptions-item label="性别">{{ formatGender(detailRecord.gender) }}</a-descriptions-item>
          <a-descriptions-item label="部门">{{ detailRecord.department }}</a-descriptions-item>
          <a-descriptions-item label="岗位">{{ detailRecord.position }}</a-descriptions-item>
          <a-descriptions-item label="注册渠道">{{ detailRecord.registerChannel }}</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ detailRecord.registerTime }}</a-descriptions-item>
          <a-descriptions-item label="最近活跃">{{ detailRecord.lastActiveTime }}</a-descriptions-item>
          <a-descriptions-item label="账户总余额(元)">{{ formatAmount(detailRecord.wallet.totalBalance) }}</a-descriptions-item>
          <a-descriptions-item label="现金钱包">{{ formatAmount(detailRecord.wallet.cashWallet) }}</a-descriptions-item>
          <a-descriptions-item label="补贴钱包">{{ formatAmount(detailRecord.wallet.subsidyWallet) }}</a-descriptions-item>
          <a-descriptions-item label="礼品钱包">{{ formatAmount(detailRecord.wallet.giftWallet) }}</a-descriptions-item>
          <a-descriptions-item label="冻结金额">{{ formatAmount(detailRecord.wallet.frozenAmount) }}</a-descriptions-item>
          <a-descriptions-item label="信用额度">{{ formatAmount(detailRecord.wallet.creditLimit) }}</a-descriptions-item>
          <a-descriptions-item label="欠费金额">{{ formatAmount(detailRecord.wallet.arrearsAmount) }}</a-descriptions-item>
          <a-descriptions-item label="积分">{{ detailRecord.pointBalance }}</a-descriptions-item>
          <a-descriptions-item label="优惠券">{{ detailRecord.couponCount }}</a-descriptions-item>
          <a-descriptions-item label="自动充值">
            {{
              detailRecord.autoRechargeEnabled
                ? `开启 (阈值${detailRecord.autoRechargeThreshold}元 / 金额${detailRecord.autoRechargeAmount}元)`
                : '关闭'
            }}
          </a-descriptions-item>
          <a-descriptions-item label="日消费限额">{{ formatAmount(detailRecord.limits.dailyConsumptionLimit) }}</a-descriptions-item>
          <a-descriptions-item label="单笔消费限额">{{ formatAmount(detailRecord.limits.singleConsumptionLimit) }}</a-descriptions-item>
          <a-descriptions-item label="日充值限额">{{ formatAmount(detailRecord.limits.dailyRechargeLimit) }}</a-descriptions-item>
          <a-descriptions-item label="单笔充值限额">{{ formatAmount(detailRecord.limits.singleRechargeLimit) }}</a-descriptions-item>
          <a-descriptions-item label="权限设置">
            {{
              [
                detailRecord.allowMealOrder ? '订餐' : '',
                detailRecord.allowDelivery ? '外送' : '',
                detailRecord.allowSelfPickup ? '自取' : '',
              ]
                .filter(Boolean)
                .join(' / ') || '无'
            }}
          </a-descriptions-item>
          <a-descriptions-item label="绑定设备" :span="3">
            <a-space :size="4" wrap>
              <a-tag v-for="device in detailRecord.bindDevices" :key="device" color="blue">{{ device }}</a-tag>
              <span v-if="!detailRecord.bindDevices?.length">暂无设备</span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="关联卡号" :span="3">
            <a-space :size="4" wrap>
              <a-tag v-for="card in detailRecord.associatedCards" :key="card" color="purple">{{ card }}</a-tag>
              <span v-if="!detailRecord.associatedCards?.length">暂无卡号</span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="标签" :span="3">
            <a-space :size="4" wrap>
              <a-tag v-for="tag in detailRecord.tags" :key="tag" color="processing">{{ tag }}</a-tag>
              <span v-if="!detailRecord.tags?.length">暂无标签</span>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="备注信息" :span="3">{{ detailRecord.remark || '暂无备注' }}</a-descriptions-item>
        </a-descriptions>
      </template>
      <a-empty v-else description="请选择账户查看详情" />
    </BasicModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { PageWrapper } from '/@/components/Page';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import type { ActionItem } from '/@/components/Table';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    accountLevelOptions,
    accountStatusOptions,
    accountTypeOptions,
    mockPosAccountList,
    posAccountColumns,
    posAccountSearchFormSchema,
    type PosAccountRecord,
  } from './posAccount.data';

  dayjs.extend(isBetween);

  const accountStore = ref<PosAccountRecord[]>([...mockPosAccountList]);
  const detailVisible = ref(false);
  const detailRecord = ref<PosAccountRecord | null>(null);
  const { createMessage } = useMessage();

  const fetchPosAccountList = async (params: Record<string, any> = {}) => {
    const {
      pageNo = 1,
      pageSize = 10,
      realName,
      accountNo,
      phone,
      status,
      type,
      level,
      registerTimeRange,
    } = params;

    let items = [...accountStore.value];

    if (realName) {
      const keyword = toLower(realName);
      items = items.filter((item) => toLower(item.realName).includes(keyword));
    }

    if (accountNo) {
      const keyword = toLower(accountNo);
      items = items.filter((item) => toLower(item.accountNo).includes(keyword));
    }

    if (phone) {
      const keyword = toLower(phone);
      items = items.filter((item) => toLower(item.phone).includes(keyword));
    }

    if (status) {
      items = items.filter((item) => item.status === status);
    }

    if (type) {
      items = items.filter((item) => item.type === type);
    }

    if (level) {
      items = items.filter((item) => item.level === level);
    }

    if (Array.isArray(registerTimeRange) && registerTimeRange.length === 2) {
      const [startValue, endValue] = registerTimeRange;
      const start = dayjs(startValue);
      const end = dayjs(endValue);
      if (start.isValid() && end.isValid()) {
        items = items.filter((item) => {
          const registerTime = dayjs(item.registerTime);
          return registerTime.isBetween(start, end, null, '[]');
        });
      }
    }

    const total = items.length;
    const currentPage = Number(pageNo) || 1;
    const size = Number(pageSize) || 10;
    const startIndex = (currentPage - 1) * size;
    const records = items.slice(startIndex, startIndex + size);

    return {
      records,
      total,
    };
  };

  const [registerTable] = useTable({
    title: '用户账户列表',
    rowKey: 'id',
    api: fetchPosAccountList,
    columns: posAccountColumns,
    useSearchForm: true,
    formConfig: {
      labelWidth: 120,
      schemas: posAccountSearchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
    },
    actionColumn: {
      width: 180,
      title: '操作',
    },
    pagination: {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50'],
    },
  });

  function toLower(value: unknown) {
    return String(value ?? '').toLowerCase();
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

  function formatAmount(value: number) {
    return Number(value ?? 0).toFixed(2);
  }

  function handleView(record: PosAccountRecord) {
    detailRecord.value = { ...record };
    detailVisible.value = true;
  }

  function handleNotify(record: PosAccountRecord) {
    createMessage.info(`已向 ${record.realName} (${record.phone}) 发送余额通知（示例）。`);
  }

  function getTableActions(record: PosAccountRecord): ActionItem[] {
    return [
      {
        label: '查看详情',
        onClick: handleView.bind(null, record),
      },
      {
        label: '余额通知',
        onClick: handleNotify.bind(null, record),
      },
    ];
  }
</script>

<style scoped>
  .expand-content {
    padding: 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  .wallet-summary {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .wallet-card {
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .wallet-card.total {
    border-color: #1890ff;
    background: #f0f7ff;
  }

  .wallet-card .label {
    font-size: 12px;
    color: #666;
  }

  .wallet-card .value {
    font-size: 18px;
    font-weight: 600;
    color: #1890ff;
  }

  .wallet-card .value.arrears {
    color: #f5222d;
  }

  .bindings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bindings .label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .remark {
    margin: 0;
    color: #555;
    line-height: 1.6;
  }
</style>
