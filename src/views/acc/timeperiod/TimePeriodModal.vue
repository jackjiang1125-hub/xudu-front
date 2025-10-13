<template>
  <BasicModal
    :bodyStyle="{ padding: '16px 24px', overflow: 'auto' }"
    :title="modalTitle"
    :width="960"
    :destroyOnClose="true"
    @register="registerModal"
    @ok="handleOk"
  >
    <BasicForm @register="registerForm" />

    <a-divider>时间配置</a-divider>

    <div class="time-table-wrapper">
      <a-table
        :columns="timeColumns"
        :data-source="timeTable"
        :pagination="false"
        bordered
        size="small"
        rowKey="key"
        class="time-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key?.startsWith('segment')">
            <TimePicker
              v-model:value="record.segments[segmentIndexMap[column.key].index][segmentIndexMap[column.key].field]"
              format="HH:mm"
              valueFormat="HH:mm"
              :allowClear="false"
              :minute-step="5"
              :placeholder="segmentIndexMap[column.key].placeholder"
            />
          </template>
          <template v-else-if="column.key === 'label'">
            <span class="date-label">{{ record.label }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <div class="table-footer">
      <a-checkbox v-model:checked="copyMonday" @change="handleCopyMonday">
        将星期一的设置同步至周二-周五
      </a-checkbox>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { TimePicker } from 'ant-design-vue';
  import type { TableColumnType } from 'ant-design-vue';
  import { cloneDeep, merge } from 'lodash-es';
  import type { TimePeriodRecord, TimePeriodDetail, TimeInterval } from './timeperiod.data';
  import { createBlankPlan } from './timeperiod.data';
  import { addTimePeriod, editTimePeriod, getTimePeriodDetail } from './timeperiod.api';

  interface ModalEmit {
    (e: 'register', ...args: any[]): void;
    (e: 'submit', record: TimePeriodRecord): void;
  }

  interface ModalProps {
    record?: TimePeriodRecord | null;
    isUpdate?: boolean;
  }

  const emit = defineEmits<ModalEmit>();

  const formSchemas = [
    {
      field: 'name',
      label: '时间段名称',
      component: 'Input',
      required: true,
      componentProps: {
        maxlength: 32,
        showCount: true,
        placeholder: '请输入时间段名称',
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入备注信息（可选）',
        rows: 2,
        maxlength: 120,
        showCount: true,
      },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 100,
    schemas: formSchemas,
    showActionButtonGroup: false,
  });

  const timeTable = reactive<TimePeriodDetail[]>(createBlankPlan());
  const modalState = reactive({
    id: '',
    isUpdate: false,
  });
  const copyMonday = ref(false);

  const segmentIndexMap: Record<string, { index: number; field: keyof TimeInterval; placeholder: string }> = {
    segment1Start: { index: 0, field: 'start', placeholder: '开始时间' },
    segment1End: { index: 0, field: 'end', placeholder: '结束时间' },
    segment2Start: { index: 1, field: 'start', placeholder: '开始时间' },
    segment2End: { index: 1, field: 'end', placeholder: '结束时间' },
    segment3Start: { index: 2, field: 'start', placeholder: '开始时间' },
    segment3End: { index: 2, field: 'end', placeholder: '结束时间' },
  };

  const timeColumns = computed<TableColumnType[]>(() => {
    return [
      {
        title: '日期',
        dataIndex: 'label',
        key: 'label',
        width: 140,
        fixed: 'left',
      },
      buildTimeColumn('时间区间1', 1),
      buildTimeColumn('时间区间2', 2),
      buildTimeColumn('时间区间3', 3),
    ];
  });

  function buildTimeColumn(title: string, index: number): TableColumnType {
    return {
      title,
      key: `segment-${index}`,
      children: [
        {
          title: '开始时间',
          key: `segment${index}Start`,
          width: 120,
          align: 'center',
        },
        {
          title: '结束时间',
          key: `segment${index}End`,
          width: 120,
          align: 'center',
        },
      ],
    } as TableColumnType;
  }

  const [registerModal, { closeModal, setModalProps }] = useModalInner(async (props?: ModalProps) => {
    await resetFields();
    copyMonday.value = false;
    modalState.isUpdate = !!props?.isUpdate;
    modalState.id = props?.record?.id || '';
    let targetDetail = props?.record?.detail ? cloneDeep(props.record.detail) : createBlankPlan();
    // 若仅传入id或缺少detail，则调用后端加载完整详情
    if (modalState.isUpdate && modalState.id && (!props?.record?.detail || props?.record?.detail.length === 0)) {
      try {
        const full = await getTimePeriodDetail(modalState.id);
        targetDetail = full?.detail ? cloneDeep(full.detail) : createBlankPlan();
        await setFieldsValue({ name: full?.name ?? '', remark: full?.remark ?? '' });
      } catch (e) {
        // 如果加载失败，仍然允许编辑基本信息
        await setFieldsValue({ name: props?.record?.name ?? '', remark: props?.record?.remark ?? '' });
      }
    }
    replaceTimeTable(targetDetail);
    await setFieldsValue({
      name: props?.record?.name ?? '',
      remark: props?.record?.remark ?? '',
    });
    setModalProps({ confirmLoading: false });
  });

  const modalTitle = computed(() => (modalState.isUpdate ? '编辑时间段' : '新增时间段'));

  function replaceTimeTable(detail: TimePeriodDetail[]) {
    timeTable.splice(0, timeTable.length, ...mergeBlankPlan(detail));
  }

  function mergeBlankPlan(detail: TimePeriodDetail[]): TimePeriodDetail[] {
    const blank = createBlankPlan();
    detail.forEach((item) => {
      const target = blank.find((b) => b.key === item.key);
      if (target) {
        target.segments = merge(target.segments, item.segments).slice(0, 3);
      }
    });
    return blank;
  }

  async function handleOk() {
    const values = await validate();
    const detail = cloneDeep(timeTable);
    const payload = {
      id: modalState.isUpdate ? modalState.id : undefined,
      name: values.name,
      remark: values.remark,
      detail,
    } as TimePeriodRecord;
    try {
      setModalProps({ confirmLoading: true });
      if (modalState.isUpdate) {
        await editTimePeriod(payload);
      } else {
        await addTimePeriod(payload);
      }
      emit('submit');
    } catch (e) {
      // 错误消息由 http 拦截器统一处理，这里只重置loading
    } finally {
      setModalProps({ confirmLoading: false });
      closeModal();
    }
  }

  function handleCopyMonday(checked: boolean) {
    if (!checked) return;
    const monday = timeTable.find((item) => item.key === 'mon');
    if (!monday) return;
    ['tue', 'wed', 'thu', 'fri'].forEach((key) => {
      const target = timeTable.find((item) => item.key === key);
      if (target) {
        target.segments = monday.segments.map((seg) => ({ ...seg }));
      }
    });
  }

  watch(copyMonday, (val) => {
    if (!val) return;
    handleCopyMonday(true);
  });
</script>

<style scoped>
  .time-table-wrapper {
    margin-top: 12px;
    height: 100%;
    overflow: hidden;
  }



  .date-label {
    font-weight: 600;
  }

  .table-footer {
    margin-bottom: 20px;
  }
</style>