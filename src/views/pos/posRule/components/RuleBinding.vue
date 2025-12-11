<template>
  <div class="rule-binding-wrapper">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" @click="openModal">
            <PlusOutlined />
            新建绑定
          </a-button>
        </a-space>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-badge
            :status="record.status === 1 ? 'success' : 'default'"
            :text="record.status === 1 ? '启用' : '停用'"
          />
        </template>

        <template v-else-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                label: '编辑',
                onClick: () => openModal(record),
              },
              {
                label: record.status === 1 ? '停用' : '启用',
                onClick: () => toggleStatus(record),
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>

    <!-- 规则绑定弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :width="900"
      destroyOnClose
      @ok="onSaveBinding"
      @cancel="onCancel"
      class="binding-modal"
    >
      <a-tabs v-model:activeKey="activeTab" class="binding-tabs">
        <!-- 基本信息 -->
        <a-tab-pane key="basic" tab="基本信息">
          <a-card size="small" class="binding-card">
            <a-form
              ref="bindingBasicFormRef"
              :model="bindingModel"
              :rules="bindingRules"
              layout="vertical"
              class="binding-basic-form"
            >
              <a-row :gutter="16">
                <a-col :span="24">
                  <a-form-item label="规则" name="ruleId">
                    <a-select
                      v-model:value="bindingModel.ruleId"
                      placeholder="请选择消费规则"
                      allowClear
                    >
                      <a-select-option value="1">学生标准消费规则</a-select-option>
                      <a-select-option value="2">低保学生补贴规则</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="绑定类型" name="bindType">
                    <a-select
                      v-model:value="bindingModel.bindType"
                      placeholder="请选择绑定类型"
                      allowClear
                    >
                      <a-select-option value="person">按人</a-select-option>
                      <a-select-option value="dept">按部门</a-select-option>
                      <a-select-option value="group">消费人群</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="钱包类型" name="walletType">
                    <a-select
                      v-model:value="bindingModel.walletType"
                      placeholder="请选择钱包类型"
                      allowClear
                    >
                      <a-select-option value="all">全部钱包</a-select-option>
                      <a-select-option value="cash">仅现金钱包</a-select-option>
                      <a-select-option value="subsidy">仅补贴钱包</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="生效日期" name="effectRange">
                    <a-range-picker
                      v-model:value="bindingModel.effectRange"
                      style="width: 100%"
                      :allowClear="true"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="状态" name="status" class="status-form-item">
                    <a-switch
                      v-model:checked="bindingModel.status"
                      :checkedValue="1"
                      :unCheckedValue="0"
                      checked-children="启用"
                      un-checked-children="停用"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="备注说明" name="remark">
                <a-textarea
                  v-model:value="bindingModel.remark"
                  :rows="3"
                  placeholder="可备注本次绑定的规则使用范围说明"
                />
              </a-form-item>
            </a-form>
          </a-card>
        </a-tab-pane>

        <!-- 绑定对象 -->
        <a-tab-pane key="scope" tab="绑定对象">
          <!-- 顶部：模式 + 概览 + 按钮 -->
          <a-card size="small" class="binding-card">
            <div class="scope-header">
              <div class="scope-header-left">
                <div class="scope-title">绑定对象范围</div>
                <div class="scope-subtitle">
                  根据绑定类型选择按成员、按部门/班级或消费人群进行规则绑定
                </div>
              </div>
              <div class="scope-header-right">
                <a-tag v-if="bindingModel.bindType === 'person'" color="blue">
                  按人
                </a-tag>
                <a-tag v-else-if="bindingModel.bindType === 'dept'" color="purple">
                  按部门/班级
                </a-tag>
                <a-tag v-else color="gold">
                  消费人群
                </a-tag>
                <span class="text-secondary scope-summary">
                  {{ scopeSummaryText }}
                </span>
              </div>
            </div>

            <a-divider style="margin: 12px 0" />

            <div class="scope-selector-row">
              <div class="scope-selector-left text-secondary">
                <span v-if="bindingModel.bindType === 'person'">
                  当前模式：按人。适用于精确到个人维度的规则配置。
                </span>
                <span v-else-if="bindingModel.bindType === 'dept'">
                  当前模式：按部门/班级。适用于按组织结构批量配置规则。
                </span>
                <span v-else>
                  当前模式：消费人群。可复用预先定义好的人群规则。
                </span>
              </div>
              <div class="scope-selector-right">
                <a-button
                  v-if="bindingModel.bindType !== 'group'"
                  type="primary"
                  size="small"
                  @click="openScopeSelector"
                >
                  {{ bindingModel.bindType === 'dept' ? '选择部门/班级' : '选择成员' }}
                </a-button>
                <a-button
                  v-else
                  type="primary"
                  size="small"
                >
                  选择消费人群（TODO）
                </a-button>
                <a-button
                  size="small"
                  style="margin-left: 8px"
                  v-if="hasScopeSelection"
                  @click="clearScopeSelection"
                >
                  清空
                </a-button>
              </div>
            </div>
          </a-card>

          <!-- 预览表 -->
          <a-card size="small" class="binding-card">
            <div class="preview-header">
              <div class="preview-title">
                已选对象预览
              </div>
              <div class="preview-extra text-secondary">
                {{
                  bindingModel.bindType === 'person'
                    ? '用于核对已绑定的成员及其所属部门/班级'
                    : bindingModel.bindType === 'dept'
                      ? '用于核对已绑定部门/班级范围'
                      : '用于核对已绑定消费人群（待实现）'
                }}
              </div>
            </div>

            <a-alert
              v-if="bindingModel.bindType === 'person'"
              type="info"
              banner
              :show-icon="false"
              class="scope-alert"
            >
              已选择 <b>{{ selectorIds.length }}</b> 人
            </a-alert>
            <a-alert
              v-else-if="bindingModel.bindType === 'dept'"
              type="info"
              banner
              :show-icon="false"
              class="scope-alert"
            >
              已选择 <b>{{ selectorIds.length }}</b> 个部门/班级
            </a-alert>
            <a-alert
              v-else
              type="info"
              banner
              :show-icon="false"
              class="scope-alert"
            >
              已选择 <b>{{ (bindingModel.scope || []).length }}</b> 个消费人群
            </a-alert>

            <div class="scope-table-wrapper">
              <a-table
                v-if="bindingModel.bindType === 'person'"
                size="small"
                :columns="userPreviewColumns"
                :data-source="scopePreviewUserList"
                row-key="id"
                :pagination="{ pageSize: 5 }"
                bordered
              />
              <a-table
                v-else-if="bindingModel.bindType === 'dept'"
                size="small"
                :columns="deptPreviewColumns"
                :data-source="scopePreviewDeptList"
                row-key="key"
                :pagination="{ pageSize: 8 }"
                bordered
              />
              <a-empty
                v-else
                description="消费人群选择能力待接入"
              />
            </div>
          </a-card>
        </a-tab-pane>
      </a-tabs>

      <!-- 选人/选部门抽屉 -->
      <SelectMemberDrawer @register="registerSelector" @ok="handleSelectorOk" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watch, h } from 'vue';
  import {
    BasicTable,
    useTable,
    type BasicColumn,
    TableAction,
  } from '/@/components/Table';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import SelectMemberDrawer from '/@/components/Form/src/jeecg/components/SelectMemberDrawer.vue';
  import {
    userPreviewColumns,
  } from '/@/components/Form/src/jeecg/components/userSelector.data';
  import {
    getUsersByIds,
    type SysUserModel,
  } from '/@/api/sys/userSelector.api';

  interface BindingRecord {
    id?: string;
    ruleName: string;
    bindType: string;
    bindTypeText: string;
    scopeText: string;
    walletTypeText: string;
    effectBegin?: string;
    effectEnd?: string;
    status: number;
    remark?: string;
  }

  const columns: BasicColumn[] = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 220,
    },
    {
      title: '绑定类型',
      dataIndex: 'bindTypeText',
      key: 'bindTypeText',
      width: 120,
    },
    {
      title: '对象范围',
      dataIndex: 'scopeText',
      key: 'scopeText',
      width: 220,
      ellipsis: true,
    },
    {
      title: '钱包类型',
      dataIndex: 'walletTypeText',
      key: 'walletTypeText',
      width: 120,
    },
    {
      title: '生效开始',
      dataIndex: 'effectBegin',
      key: 'effectBegin',
      width: 140,
    },
    {
      title: '生效结束',
      dataIndex: 'effectEnd',
      key: 'effectEnd',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      fixed: 'right',
    },
  ];

  async function fakeBindingListApi(params: Recordable) {
    console.log('加载规则绑定列表参数', params);
    const list: BindingRecord[] = [
      {
        id: '1',
        ruleName: '学生标准消费规则',
        bindType: 'person',
        bindTypeText: '按人',
        scopeText: '高一(1)班全体学生',
        walletTypeText: '全部钱包',
        effectBegin: '2025-09-01',
        effectEnd: '',
        status: 1,
        remark: '',
      },
      {
        id: '2',
        ruleName: '低保学生补贴规则',
        bindType: 'group',
        bindTypeText: '消费人群',
        scopeText: '低保学生人群',
        walletTypeText: '仅补贴钱包',
        effectBegin: '2025-09-01',
        effectEnd: '2026-06-30',
        status: 1,
        remark: '',
      },
    ];
    return {
      list,
      total: list.length,
    };
  }

  const { createMessage } = useMessage();

  const [registerTable, { reload: reloadTable }] = useTable({
    title: '消费规则绑定列表',
    api: fakeBindingListApi,
    columns,
    useSearchForm: false,
    bordered: false,
    striped: false,
    showIndexColumn: false,
    showTableSetting: true,
  });

  const modalVisible = ref(false);
  const modalTitle = ref('新建绑定');
  const activeTab = ref<'basic' | 'scope'>('basic');
  const bindingBasicFormRef = ref();

  const bindingModel = reactive<any>({
    ruleId: null,
    bindType: 'person',
    walletType: 'all',
    scope: [],
    targetIds: [] as string[],
    effectRange: [],
    status: 1,
    remark: '',
  });

  const bindingRules = {
    ruleId: [{ required: true, message: '请选择规则', trigger: 'change' }],
    bindType: [{ required: true, message: '请选择绑定类型', trigger: 'change' }],
    walletType: [{ required: true, message: '请选择钱包类型', trigger: 'change' }],
  };

  // 仅用于前端预览已选数量
  const selectorIds = ref<string[]>([]);

  // 预览数据
  const scopePreviewUserList = ref<SysUserModel[]>([]);
  const scopePreviewDeptList = ref<any[]>([]);
  const scopeChangeFromSelector = ref(false);

  const scopeSummaryText = computed(() => {
    if (bindingModel.bindType === 'person') {
      return selectorIds.value.length ? `已选择 ${selectorIds.value.length} 人` : '未选择成员';
    }
    if (bindingModel.bindType === 'dept') {
      return selectorIds.value.length
        ? `已选择 ${selectorIds.value.length} 个部门/班级`
        : '未选择部门/班级';
    }
    if (bindingModel.bindType === 'group') {
      const count = (bindingModel.scope || []).length;
      return count ? `已选择 ${count} 个消费人群` : '未选择消费人群';
    }
    return '';
  });

  const hasScopeSelection = computed(() => {
    if (bindingModel.bindType === 'group') {
      return Array.isArray(bindingModel.scope) && bindingModel.scope.length > 0;
    }
    return selectorIds.value.length > 0;
  });

  // orgCode => 层级：A01->1级，A01A02->2级...
  function calcDeptDepth(orgCode?: string): number {
    if (!orgCode) return 1;
    const segs = orgCode.match(/[A-Z]\d{2}/g);
    if (segs && segs.length) return segs.length;
    return Math.max(1, Math.ceil(orgCode.length / 3));
  }

  // 部门预览列：树形缩进 + 组织编码 + 层级
  const deptPreviewColumns = [
    {
      title: '部门/班级',
      dataIndex: 'title',
      customRender: ({ record }: any) => {
        const depth = record._depth || 1;
        const paddingLeft = (depth - 1) * 18;
        const isLeaf = !record.children || record.children.length === 0;

        return h(
          'div',
          {
            class: 'dept-name-cell',
            style: {
              paddingLeft: `${paddingLeft}px`,
              display: 'flex',
              alignItems: 'center',
            },
          },
          [
            h('span', { class: isLeaf ? 'dept-node-dot' : 'dept-node-root' }),
            h(
              'span',
              {
                class: 'dept-name-text',
                title: record.title,
              },
              record.title,
            ),
          ],
        );
      },
    },
    {
      title: '组织编码',
      dataIndex: 'orgCode',
    },
    {
      title: '部门层级',
      dataIndex: 'levelText',
    },
  ];

  watch(
    () => bindingModel.bindType,
    (val) => {
      if (val === 'group') {
        selectorIds.value = [];
        bindingModel.targetIds = [];
        scopePreviewUserList.value = [];
        scopePreviewDeptList.value = [];
      }
    },
  );

  // ========= 系统级选人弹窗：useModal =========
  const [registerSelector, { openModal: openSelectorModal }] = useModal();

  function openScopeSelector() {
    if (bindingModel.bindType === 'group') {
      // TODO: 打开消费人群选择弹窗
      return;
    }

    const mode = bindingModel.bindType === 'dept' ? 'dept' : 'person';
    const ids = Array.isArray(bindingModel.targetIds) ? [...bindingModel.targetIds] : [];

    openSelectorModal(true, {
      mode,
      selectorMode: mode,
      type: mode,
      bindMode: bindingModel.bindType,
      selectedIds: ids,
      ids,
      personIds: mode === 'person' ? ids : [],
      deptIds: mode === 'dept' ? ids : [],
    });
  }

  function clearScopeSelection() {
    if (bindingModel.bindType === 'group') {
      bindingModel.scope = [];
    } else {
      selectorIds.value = [];
      bindingModel.targetIds = [];
      scopePreviewUserList.value = [];
      scopePreviewDeptList.value = [];
    }
  }

  /**
   * 选人 / 选部门回调
   * SelectMemberDrawer emit: { type: 'person' | 'dept'; ids: string[]; rows?: any[] }
   */
  function handleSelectorOk(payload: { type: 'person' | 'dept'; ids: string[]; rows?: any[] }) {
    const { type, ids, rows = [] } = payload;
    const mode = type === 'dept' ? 'dept' : 'person';

    scopeChangeFromSelector.value = true;

    bindingModel.bindType = mode;
    bindingModel.targetIds = [...(ids || [])];
    selectorIds.value = [...(ids || [])];

    if (mode === 'person') {
      scopePreviewUserList.value = rows as SysUserModel[];
      scopePreviewDeptList.value = [];
    } else {
      scopePreviewDeptList.value = rows.map((row: any) => {
        const orgCode = row.orgCode;
        const depth = calcDeptDepth(orgCode);
        return {
          key: row.id ?? row.key,
          title: row.title ?? row.departName,
          orgCode,
          level: depth,
          levelText: `${depth}级`,
          _depth: depth,
          raw: row,
        };
      });
      scopePreviewUserList.value = [];
    }

    // 切到“绑定对象”tab，方便直接看到效果
    activeTab.value = 'scope';
  }

  /**
   * 监听 targetIds 变化：
   * - 编辑场景只有 id 没有 rows 时，用 getUsersByIds 或占位数据兜底
   */
  watch(
    () => (bindingModel.targetIds || []).slice(),
    async (newIds) => {
      if (scopeChangeFromSelector.value) {
        scopeChangeFromSelector.value = false;
        return;
      }

      selectorIds.value = [...newIds];

      if (!newIds.length) {
        scopePreviewUserList.value = [];
        scopePreviewDeptList.value = [];
        return;
      }

      if (bindingModel.bindType === 'person') {
        try {
          const list = await getUsersByIds(newIds);
          scopePreviewUserList.value = list || [];
        } catch {
          scopePreviewUserList.value = [];
        }
      } else if (bindingModel.bindType === 'dept') {
        // 只有 id 时先简单占位，真正从选择器选的会走 handleSelectorOk
        scopePreviewDeptList.value = newIds.map((id) => ({
          key: id,
          title: `部门/班级 ${id}`,
          orgCode: '',
          level: 1,
          levelText: '1级',
          _depth: 1,
        }));
      }
    },
  );

  function openModal(record?: BindingRecord) {
    if (record) {
      modalTitle.value = '编辑绑定';
      Object.assign(bindingModel, {
        ruleId: '1',
        bindType: record.bindType || 'person',
        walletType: 'all',
        scope: [],
        targetIds: [], // TODO: 从后端回填
        effectRange: [],
        status: record.status,
        remark: record.remark || '',
      });
    } else {
      modalTitle.value = '新建绑定';
      Object.assign(bindingModel, {
        ruleId: null,
        bindType: 'person',
        walletType: 'all',
        scope: [],
        targetIds: [],
        effectRange: [],
        status: 1,
        remark: '',
      });
    }
    selectorIds.value = Array.isArray(bindingModel.targetIds)
      ? [...bindingModel.targetIds]
      : [];
    scopePreviewUserList.value = [];
    scopePreviewDeptList.value = [];
    activeTab.value = 'basic';
    modalVisible.value = true;
  }

  function onSaveBinding() {
    (bindingBasicFormRef.value as any)
      .validate()
      .then(() => {
        console.log('保存绑定数据：', bindingModel);
        createMessage.success('绑定规则已保存（示例环境，仅前端展示）');
        modalVisible.value = false;
        reloadTable();
      })
      .catch(() => {});
  }

  function onCancel() {
    modalVisible.value = false;
  }

  function toggleStatus(record: BindingRecord) {
    const targetStatus = record.status === 1 ? 0 : 1;
    record.status = targetStatus;
    createMessage.success(
      `已将【${record.ruleName}】绑定${targetStatus === 1 ? '启用' : '停用'}`,
    );
  }
</script>

<style scoped>
  .rule-binding-wrapper {
    width: 100%;
  }

  .binding-modal :deep(.ant-modal-body) {
    padding-top: 12px;
    padding-bottom: 16px;
  }

  .binding-tabs {
    min-height: 360px;
  }

  .binding-card {
    margin-bottom: 12px;
  }

  .binding-basic-form {
    padding-top: 4px;
  }

  .status-form-item :deep(.ant-form-item-control-input) {
    display: flex;
    align-items: center;
    height: 32px;
  }

  .scope-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .scope-header-left {
    flex: 1;
    min-width: 0;
  }

  .scope-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .scope-subtitle {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  .scope-header-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .scope-summary {
    white-space: nowrap;
  }

  .scope-selector-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
  }

  .scope-selector-left {
    flex: 1;
    min-width: 0;
  }

  .scope-selector-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .preview-title {
    font-size: 15px;
    font-weight: 500;
  }

  .preview-extra {
    font-size: 12px;
  }

  .scope-alert {
    margin-bottom: 8px;
  }

  .scope-table-wrapper {
    margin-top: 4px;
  }

  .text-secondary {
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }

  /* 部门树形预览样式 */
  .dept-name-cell {
    font-size: 13px;
  }

  .dept-node-root {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background-color: #1890ff;
    margin-right: 6px;
  }

  .dept-node-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1px solid #999;
    margin-right: 6px;
  }

  .dept-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
