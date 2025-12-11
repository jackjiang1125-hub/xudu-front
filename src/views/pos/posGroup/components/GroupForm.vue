<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    @ok="handleOk"
    width="900px"
    destroyOnClose
    class="group-modal"
  >
    <a-tabs v-model:activeKey="activeTab" class="group-tabs">
      <!-- 基本信息 -->
      <a-tab-pane key="basic" tab="基本信息">
        <a-card size="small" class="group-card">
          <a-form
            class="group-basic-form"
            layout="vertical"
            :model="formModel"
            :rules="formRules"
            ref="basicFormRef"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="人群名称" name="groupName">
                  <a-input
                    v-model:value="formModel.groupName"
                    placeholder="请输入人群名称"
                    allowClear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="编码" name="code">
                  <a-input
                    v-model:value="formModel.code"
                    placeholder="请输入唯一编码，如 STU_NORMAL"
                    allowClear
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="人群类型" name="groupType">
                  <a-select
                    v-model:value="formModel.groupType"
                    placeholder="请选择人群类型"
                    allowClear
                  >
                    <a-select-option value="student">学生</a-select-option>
                    <a-select-option value="staff">教职工</a-select-option>
                    <a-select-option value="other">其他</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="状态" name="status" class="status-form-item">
                  <a-switch
                    v-model:checked="formModel.status"
                    checked-children="启用"
                    un-checked-children="停用"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="备注说明">
              <a-textarea
                v-model:value="formModel.remark"
                :rows="3"
                placeholder="可填入该消费人群的使用说明，如适用范围、注意事项等"
              />
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>

      <!-- 成员规则 -->
      <a-tab-pane key="member" tab="成员规则">
        <!-- 顶部模式 & 概览 -->
        <a-card size="small" class="group-card">
          <div class="member-header">
            <div class="member-header-left">
              <div class="member-title">成员模式</div>
              <div class="member-subtitle">
                根据业务需要选择按成员或按部门/班级配置消费人群
              </div>
            </div>
            <div class="member-header-right">
              <a-radio-group v-model:value="formModel.memberMode">
                <a-radio-button value="person">按人</a-radio-button>
                <a-radio-button value="dept">按部门</a-radio-button>
              </a-radio-group>
            </div>
          </div>

          <a-divider style="margin: 12px 0" />

          <div class="member-selector-row">
            <div class="member-selector-left">
              <a-tag v-if="formModel.memberMode === 'person'" color="blue">
                按人
              </a-tag>
              <a-tag v-else color="purple">
                按部门/班级
              </a-tag>
              <span class="text-secondary member-summary">
                {{ memberSummaryText }}
              </span>
            </div>
            <div class="member-selector-right">
              <a-button type="primary" size="small" @click="openMemberSelector">
                {{ formModel.memberMode === 'person' ? '选择成员' : '选择部门/班级' }}
              </a-button>
              <a-button
                size="small"
                @click="clearMembers"
                v-if="hasMemberSelection"
                style="margin-left: 8px"
              >
                清空
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- 预览区域 -->
        <a-card size="small" class="group-card">
          <div class="preview-header">
            <div class="preview-title">已选成员预览</div>
            <div class="preview-extra text-secondary">
              {{
                formModel.memberMode === 'person'
                  ? '用于快速核对成员名单和归属部门/班级'
                  : '用于核对已选部门/班级范围'
              }}
            </div>
          </div>

          <a-alert
            v-if="formModel.memberMode === 'person'"
            type="info"
            banner
            :show-icon="false"
            class="member-alert"
          >
            已选择 <b>{{ memberIds.length }}</b> 人
          </a-alert>
          <a-alert
            v-else
            type="info"
            banner
            :show-icon="false"
            class="member-alert"
          >
            已选择 <b>{{ memberIds.length }}</b> 个部门/班级
          </a-alert>

          <div class="member-table-wrapper">
            <!-- 按人 -->
            <a-table
              v-if="formModel.memberMode === 'person'"
              size="small"
              :columns="userPreviewColumns"
              :data-source="memberPreviewList"
              row-key="id"
              :pagination="{ pageSize: 5 }"
              bordered
            />
            <!-- 按部门 -->
            <a-table
              v-else
              size="small"
              :columns="deptPreviewColumns"
              :data-source="deptPreviewList"
              row-key="key"
              :pagination="{ pageSize: 8 }"
              bordered
            />
          </div>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <!-- 成员/部门选择抽屉 -->
    <SelectMemberDrawer @register="registerSelector" @ok="handleSelectorOk" />
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, h } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import SelectMemberDrawer from '/@/components/Form/src/jeecg/components/SelectMemberDrawer.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { userPreviewColumns } from '/@/components/Form/src/jeecg/components/userSelector.data';
  import { getUsersByIds, type SysUserModel } from '/@/api/sys/userSelector.api';

  const emit = defineEmits(['register', 'success']);

  const [registerSelector, { openModal: openSelectorModal }] = useModal();
  const { createMessage } = useMessage();

  const activeTab = ref('basic');
  const title = ref('新建人群');
  const basicFormRef = ref();

  const formModel = reactive<any>({
    id: null,
    groupName: '',
    code: '',
    groupType: 'student',
    status: 1,
    remark: '',
    memberMode: 'person',
  });

  const formRules = {
    groupName: [{ required: true, message: '请输入人群名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  };

  const memberIds = ref<string[]>([]);
  const memberPreviewList = ref<SysUserModel[]>([]);
  const deptPreviewList = ref<any[]>([]);
  // 标记这次 memberIds 变化是否来自选择器，避免 watch 覆盖 rows
  const memberChangeFromSelector = ref(false);

  const memberSummaryText = computed(() => {
    if (formModel.memberMode === 'person') {
      return memberIds.value.length ? `已选择 ${memberIds.value.length} 人` : '未选择成员';
    }
    return memberIds.value.length ? `已选择 ${memberIds.value.length} 个部门/班级` : '未选择部门/班级';
  });

  const hasMemberSelection = computed(() => memberIds.value.length > 0);

  const [registerModal, { closeModal }] = useModalInner((data) => {
    if (data && data.record) {
      title.value = '编辑人群';
      // TODO: 回填编辑数据（包含成员模式和成员ID集合、预览数据）
    } else {
      title.value = '新建人群';
      resetForm();
    }
  });

  function resetForm() {
    Object.assign(formModel, {
      id: null,
      groupName: '',
      code: '',
      groupType: 'student',
      status: 1,
      remark: '',
      memberMode: 'person',
    });
    memberIds.value = [];
    memberPreviewList.value = [];
    deptPreviewList.value = [];
  }

  function openMemberSelector() {
    openSelectorModal(true, {
      mode: formModel.memberMode === 'dept' ? 'dept' : 'person',
      selectedIds: memberIds.value,
    });
  }

  function clearMembers() {
    memberIds.value = [];
    memberPreviewList.value = [];
    deptPreviewList.value = [];
  }

  // ====== 部门预览相关 ======

  /**
   * 基于 orgCode 计算层级：
   *  A01       -> 1 级
   *  A01A02    -> 2 级
   *  A01A02A03 -> 3 级
   * 如果格式不标准，就按长度 / 3 粗略估算。
   */
  function calcDeptDepth(orgCode?: string): number {
    if (!orgCode) return 1;
    const segs = orgCode.match(/[A-Z]\d{2}/g);
    if (segs && segs.length) return segs.length;
    return Math.max(1, Math.ceil(orgCode.length / 3));
  }

  // 部门预览列（树形缩进 + 部门层级）
  const deptPreviewColumns = [
    {
      title: '部门/班级',
      dataIndex: 'title',
      customRender: ({ record }: any) => {
        const depth = record._depth || 1;
        const paddingLeft = (depth - 1) * 18; // 每一层缩进

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
            h('span', {
              class: isLeaf ? 'dept-node-dot' : 'dept-node-root',
            }),
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

  /**
   * 选人/选部门回调
   * SelectMemberDrawer emit:
   *  { type: 'person' | 'dept'; ids: string[]; rows?: any[] }
   */
  function handleSelectorOk(payload: { type: 'person' | 'dept'; ids: string[]; rows?: any[] }) {
    const { type, ids, rows = [] } = payload;

    memberChangeFromSelector.value = true;

    formModel.memberMode = type === 'dept' ? 'dept' : 'person';
    memberIds.value = [...(ids || [])];

    if (type === 'person') {
      // rows 里已经带 orgCodeTxt，直接用于预览
      memberPreviewList.value = rows as SysUserModel[];
      deptPreviewList.value = [];
    } else {
      // 部门模式：构造带层级信息的预览数据
      deptPreviewList.value = rows.map((row: any) => {
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
      memberPreviewList.value = [];
    }
  }

  /**
   * 监听 memberIds 变化：
   * - 编辑场景下只有 id 没有 rows 时，用 getUsersByIds 兜底
   * - 从选择器返回的这一次变化，用 memberChangeFromSelector 跳过，避免覆盖 rows 中带的 orgCodeTxt / 层级信息
   */
  watch(
    () => memberIds.value.slice(),
    async (newIds) => {
      if (memberChangeFromSelector.value) {
        memberChangeFromSelector.value = false;
        return;
      }

      if (!newIds.length) {
        memberPreviewList.value = [];
        deptPreviewList.value = [];
        return;
      }

      if (formModel.memberMode === 'person') {
        try {
          const list = await getUsersByIds(newIds);
          memberPreviewList.value = list || [];
        } catch {
          memberPreviewList.value = [];
        }
      } else {
        // 兜底：只有 id 的时候，简单占位；真正从选择器选进来的会走 handleSelectorOk
        deptPreviewList.value = newIds.map((id) => ({
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

  async function handleOk() {
    try {
      await (basicFormRef.value as any).validate();
      const payload = {
        ...formModel,
        memberMode: formModel.memberMode,
        memberIds: memberIds.value,
      };
      console.log('保存消费人群：', payload);
      createMessage.success('保存成功（示例环境，仅前端展示）');
      emit('success');
      closeModal();
    } catch (e) {
      // ignore
    }
  }
</script>

<style scoped>
  .group-modal :deep(.ant-modal-body) {
    padding-top: 12px;
    padding-bottom: 16px;
  }

  .group-tabs {
    min-height: 360px;
  }

  .group-card {
    margin-bottom: 12px;
  }

  .group-basic-form {
    padding-top: 4px;
  }

  .status-form-item :deep(.ant-form-item-control-input) {
    display: flex;
    align-items: center;
    height: 32px;
  }

  .member-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .member-header-left {
    flex: 1;
    min-width: 0;
  }

  .member-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .member-subtitle {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  .member-header-right {
    flex-shrink: 0;
  }

  .member-selector-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
  }

  .member-selector-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .member-summary {
    white-space: nowrap;
  }

  .member-selector-right {
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

  .member-alert {
    margin-bottom: 8px;
  }

  .member-table-wrapper {
    margin-top: 4px;
  }

  .text-secondary {
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }

  /* ===== 部门树形预览样式 ===== */

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
