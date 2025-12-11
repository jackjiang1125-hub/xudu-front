<template>
  <a-card :bordered="false" style="height: 100%">
    <a-spin :spinning="loading">
      <a-input-search placeholder="按部门名称搜索…" style="margin-bottom: 10px" @search="onSearch" />
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :load-data="loadChildrenTreeData"
          v-model:expandedKeys="expandedKeys"
          @select="onSelect"
        />
      </template>
      <a-empty v-else description="暂无数据" />
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { nextTick, ref } from 'vue';
  import { queryDepartTreeSync } from '../depart.api';
  import { searchByKeywords } from '/@/views/system/departUser/depart.user.api';

  const props = withDefaults(defineProps<{ autoSelectFirst?: boolean; allowUnselect?: boolean }>(), {
    autoSelectFirst: false,
    allowUnselect: true,
  });

  const emit = defineEmits(['select']);

  const loading = ref<boolean>(false);
  const treeData = ref<any[]>([]);
  const expandedKeys = ref<any[]>([]);
  const selectedKeys = ref<any[]>([]);
  const treeReloading = ref<boolean>(false);

  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      const result = await queryDepartTreeSync();
      if (Array.isArray(result)) {
        treeData.value = result;
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode(props.autoSelectFirst);
      }
    } finally {
      loading.value = false;
    }
  }

  loadRootTreeData();

  async function loadChildrenTreeData(treeNode) {
    const result = await queryDepartTreeSync({ pid: treeNode?.dataRef?.id });
    if (!Array.isArray(result) || result.length === 0) {
      treeNode.dataRef.isLeaf = true;
    } else {
      treeNode.dataRef.children = result;
      if (expandedKeys.value.length > 0) {
        let subKeys: any[] = [];
        for (let key of expandedKeys.value) {
          if (result.findIndex((item) => item.id === key) !== -1) {
            subKeys.push(key);
          }
        }
        if (subKeys.length > 0) {
          expandedKeys.value = [...expandedKeys.value];
        }
      }
    }
    treeData.value = [...treeData.value];
    return Promise.resolve();
  }

  function autoExpandParentNode(selectFirst = false) {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      if (selectFirst) {
        setSelectedKey(item.id, item);
      } else {
        selectedKeys.value = [];
        emit('select', null);
      }
      reloadTree();
    } else {
      emit('select', null);
    }
  }

  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }

  function setSelectedKey(key: string, data?: object) {
    selectedKeys.value = [key];
    if (data) {
      emit('select', data);
    }
  }

  async function onSearch(value: string) {
    if (value) {
      try {
        loading.value = true;
        treeData.value = [];
        let result = await searchByKeywords({ keyWord: value });
        if (Array.isArray(result)) {
          treeData.value = result;
        }
        autoExpandParentNode(props.autoSelectFirst);
      } finally {
        loading.value = false;
      }
    } else {
      loadRootTreeData();
    }
  }

  function onSelect(selKeys, event) {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0]);
    } else {
      if (props.allowUnselect && selKeys.length === 0) {
        selectedKeys.value = [];
        emit('select', null);
      } else {
        setSelectedKey(selectedKeys.value[0]);
      }
    }
  }

  defineExpose({ loadRootTreeData });
</script>

<style scoped></style>
