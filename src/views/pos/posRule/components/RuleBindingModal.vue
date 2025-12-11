
<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    :width="880"
    destroyOnClose
  >
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="scope" tab="适用范围">
        <a-form layout="vertical" :model="formModel">
          <a-form-item label="绑定模式">
            <a-radio-group v-model:value="formModel.bindMode">
              <a-radio value="group">按消费人群</a-radio>
              <a-radio value="person">按成员</a-radio>
              <a-radio value="dept">按部门/班级</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item v-if="formModel.bindMode === 'group'" label="消费人群">
            <a-select
              v-model:value="formModel.groupIds"
              mode="multiple"
              placeholder="请选择消费人群"
            >
              <!-- TODO: 替换为实际人群接口 -->
              <a-select-option value="1">普通学生人群</a-select-option>
              <a-select-option value="2">教职工人群</a-select-option>
            </a-select>
          </a-form-item>

          <template v-else>
            <a-space style="margin-bottom: 8px">
              <span>
                <template v-if="formModel.bindMode === 'person'">成员选择：</template>
                <template v-else>部门/班级选择：</template>
              </span>
              <a-button size="small" type="primary" @click="openSelector">
                选择
              </a-button>
              <a-button size="small" @click="clearSelection" v-if="hasSelection">
                清空
              </a-button>
            </a-space>

            <a-table
              v-if="formModel.bindMode === 'person'"
              size="small"
              rowKey="id"
              :dataSource="personRows"
              :columns="personColumns"
              :pagination="false"
              :scroll="{ y: 260 }"
            />

            <a-table
              v-else
              size="small"
              rowKey="id"
              :dataSource="deptRows"
              :columns="deptColumns"
              :pagination="false"
              :scroll="{ y: 260 }"
            />
          </template>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <template #footer>
      <div style="text-align: right">
        <a-space>
          <a-button @click="closeModal()">取消</a-button>
          <a-button type="primary" @click="handleOk">保存</a-button>
        </a-space>
      </div>
    </template>

    <!-- 系统级选人弹窗 -->
    <SelectMemberDrawer @register="registerSelector" @ok="onSelectorOk" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import SelectMemberDrawer from '/@/components/Form/src/jeecg/components/SelectMemberDrawer.vue'; // 按你实际放置路径调整

  interface BindFormModel {
    bindMode: 'group' | 'person' | 'dept';
    groupIds: string[];
    personIds: string[];
    deptIds: string[];
  }

  interface TableColumn {
    title: string;
    dataIndex: string;
    width?: number;
  }

  const title = ref('绑定对象');
  const activeTab = ref('scope');

  const formModel = reactive<BindFormModel>({
    bindMode: 'group',
    groupIds: [],
    personIds: [],
    deptIds: [],
  });

  const personRows = ref<any[]>([]);
  const deptRows = ref<any[]>([]);

  const personColumns: TableColumn[] = [
    { title: '姓名', dataIndex: 'realname', width: 140 },
    { title: '账号', dataIndex: 'username', width: 140 },
    { title: '部门/班级', dataIndex: 'orgNames', width: 220 },
    { title: '手机号', dataIndex: 'phone', width: 160 },
  ];

  const deptColumns: TableColumn[] = [
    { title: '名称', dataIndex: 'title', width: 260 },
    { title: 'ID', dataIndex: 'id', width: 220 },
  ];

  const hasSelection = computed(
    () =>
      (formModel.bindMode === 'person' && formModel.personIds.length > 0) ||
      (formModel.bindMode === 'dept' && formModel.deptIds.length > 0),
  );

  const [registerModal, { closeModal }] = useModalInner((data?: any) => {
    title.value = data?.ruleName ? `绑定对象 - ${data.ruleName}` : '绑定对象';
    // TODO 初始化绑定数据（从后端加载已绑定信息）
  });

  const [registerSelector, { openModal: openSelectorModal }] = useModal();

  function openSelector() {
  const mode = formModel.bindMode === 'dept' ? 'dept' : 'person';

  const commonPayload: any = {
    mode,                // 新版用的
    selectorMode: mode,  // 兼容老写法
    type: mode,          // 再兜一层
    bindMode: formModel.bindMode, // 再兜底一层
  };

  if (mode === 'person') {
    const ids = [...formModel.personIds];
    openSelectorModal(true, {
      ...commonPayload,
      selectedIds: ids,   // 通用 key
      ids,                // 兼容某些写法
      personIds: ids,     // 明确告诉：这是人
    });
  } else {
    const ids = [...formModel.deptIds];
    openSelectorModal(true, {
      ...commonPayload,
      selectedIds: ids,
      ids,
      deptIds: ids,       // 明确告诉：这是部门
    });
  }
}


  function onSelectorOk(payload: { type: 'person' | 'dept'; ids: string[]; rows?: any[] }) {
    if (payload.type === 'person') {
      formModel.personIds = [...payload.ids];
      personRows.value = payload.rows || [];
    } else {
      formModel.deptIds = [...payload.ids];
      deptRows.value = payload.rows || [];
    }
  }

  function clearSelection() {
    if (formModel.bindMode === 'person') {
      formModel.personIds = [];
      personRows.value = [];
    } else if (formModel.bindMode === 'dept') {
      formModel.deptIds = [];
      deptRows.value = [];
    }
  }

  function handleOk() {
    // TODO: 调用后端保存绑定关系接口
    console.log('保存绑定关系：', JSON.stringify(formModel));
    closeModal();
  }
</script>
