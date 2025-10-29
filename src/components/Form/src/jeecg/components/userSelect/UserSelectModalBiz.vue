<template>
  <BasicModal
    @register="register"
    :getContainer="getContainer"
    :canFullscreen="false"
    title="选择业务用户"
    :width="600"
    wrapClassName="j-user-select-modal2"
  >
    <!-- 部门下拉框 -->
    <a-select v-model:value="selectedDepart" style="width: 100%" class="depart-select" @change="onDepartChange">
      <a-select-option v-for="item in departOptions" :value="item.value">{{ item.label }}</a-select-option>
    </a-select>

    <div style="position: relative; min-height: 350px">
      <!-- 用户搜索框 -->
      <div :class="searchInputStatus ? 'my-search all-width' : 'my-search'">
        <span :class="searchInputStatus ? 'hidden' : ''" style="margin-left: 10px"
          ><SearchOutlined style="color: #c0c0c0" @click="showSearchInput"
        /></span>
        <div style="width: 100%" :class="searchInputStatus ? '' : 'hidden'">
          <a-input v-model:value="searchText" @pressEnter="onSearchUser" style="width: 100%" placeholder="请输入用户名按回车搜索">
            <template #prefix>
              <SearchOutlined style="color: #c0c0c0" />
            </template>
            <template #suffix>
              <CloseOutlined title="退出搜索" @click="clearSearch" />
            </template>
          </a-input>
        </div>
      </div>

      <!-- tabs -->
      <div class="my-tabs">
        <a-tabs v-model:activeKey="myActiveKey" :centered="true" @change="onChangeTab">
          <!-- 所有业务用户 -->
          <a-tab-pane key="1" tab="全部业务用户" forceRender>
            <user-list :multi="multi" :excludeUserIdList="excludeUserIdList" :dataList="userDataList" :selectedIdList="selectedIdList" depart @selected="onSelectUser" @unSelect="unSelectUser" />
          </a-tab-pane>

          <!-- 按部门筛选业务用户 -->
          <a-tab-pane key="2" tab="按部门" forceRender>
            <depart-user-list-biz
              :searchText="searchText"
              :selectedIdList="selectedIdList"
              :excludeUserIdList="excludeUserIdList"
              @loaded="initDepartOptions"
              @selected="onSelectUser"
              @unSelect="unSelectUser"
            />
          </a-tab-pane>

          <!-- 按角色筛选业务用户 -->
          <a-tab-pane key="3" tab="按角色" forceRender>
            <role-user-list-biz :excludeUserIdList="excludeUserIdList" :searchText="searchText" :selectedIdList="selectedIdList" @selected="onSelectUser" @unSelect="unSelectUser" />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 选中用户 -->
      <div class="selected-users" style="width: 100%; overflow-x: hidden">
        <SelectedUserItem v-for="item in selectedUserList" :info="item" @unSelect="unSelectUser" />
      </div>
    </div>

    <template #footer>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <div class="select-user-page-info">
          <a-pagination v-if="myActiveKey == '1'" v-model:current="pageNo" size="small" :total="totalRecord" show-quick-jumper @change="onPageChange" />
        </div>
        <a-button type="primary" @click="handleOk">确 定</a-button>
      </div>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { SearchOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import UserList from './UserList.vue';
  import SelectedUserItem from './SelectedUserItem.vue';
  import DepartUserListBiz from './UserListAndDepartBiz.vue';
  import RoleUserListBiz from './UserListAndRoleBiz.vue';
  import { Pagination } from 'ant-design-vue';
  const APagination = Pagination;
  import { defHttp } from '/@/utils/http/axios';

  import { computed, ref, toRaw, unref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { mySelfData } from './useUserSelect';

  export default {
    name: 'UserSelectModalBiz',
    components: {
      BasicModal,
      SearchOutlined,
      CloseOutlined,
      SelectedUserItem,
      UserList,
      DepartUserListBiz,
      RoleUserListBiz,
      APagination,
    },
    props: {
      multi: {
        type: Boolean,
        default: false,
      },
      getContainer: {
        type: Function,
        default: null,
      },
      //是否排除我自己
      izExcludeMy: {
        type: Boolean,
        default: false,
      },
      //是否在高级查询中作为条件 可以选择当前用户表达式
      inSuperQuery: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['selected', 'register'],
    setup(props, { emit }) {
      const myActiveKey = ref('1');
      const selectedUserList = ref<any[]>([]);
      const userStore = useUserStore();
      const selectedIdList = computed(() => {
        let arr = selectedUserList.value;
        if (!arr || arr.length == 0) {
          return [];
        } else {
          return arr.map((k) => k.id);
        }
      });
      const excludeUserIdList = ref<any[]>([]);

      const [register] = useModalInner((data) => {
        let list = data.list;
        if (list && list.length > 0) {
          selectedUserList.value = [...list];
        } else {
          selectedUserList.value = [];
        }
        if (data.excludeUserIdList) {
          excludeUserIdList.value = data.excludeUserIdList;
        } else {
          excludeUserIdList.value = [];
        }
        if (props.izExcludeMy) {
          excludeUserIdList.value.push(userStore.getUserInfo.id);
        }
        loadUserList();
      });

      function handleOk() {
        let arr = toRaw(selectedUserList.value);
        emit('selected', arr);
      }

      const selectedDepart = ref('');
      const departOptions = ref<any[]>([]);
      function initDepartOptions(options) {
        departOptions.value = [{ value: '', label: '全部业务用户' }, ...options];
        selectedDepart.value = '';
      }
      function onDepartChange() {
        loadUserList();
      }

      const searchInputStatus = ref(false);
      const searchText = ref('');
      function showSearchInput(e) {
        e && prevent(e);
        searchInputStatus.value = true;
      }

      function onSearchUser() {
        pageNo.value = 1;
        loadUserList();
      }

      function clearSearch(e) {
        e && prevent(e);
        pageNo.value = 1;
        searchText.value = '';
        searchInputStatus.value = false;
        loadUserList();
      }

      const pageNo = ref(1);
      const totalRecord = ref(0);
      const userDataList = ref<any[]>([]);
      async function onPageChange() {
        await loadUserList();
      }
      async function loadUserList() {
        const url = '/sys/user/selectUserList';
        let params: any = {
          pageNo: pageNo.value,
          pageSize: 10,
          userType: 2,
        };
        if (searchText.value) {
          params['keyword'] = searchText.value;
        }
        if (selectedDepart.value) {
          params['departId'] = selectedDepart.value;
        }
        if (unref(excludeUserIdList) && unref(excludeUserIdList).length > 0) {
          params['excludeUserIdList'] = excludeUserIdList.value.join(',');
        }
        const data = await defHttp.get({ url, params }, { isTransformResponse: false });
        if (data.success) {
          let { records, total } = data.result;
          totalRecord.value = total;
          initCurrentUserData(records);
          userDataList.value = Array.isArray(records)
            ? records.filter((u: any) => String(u.userType || u.user_type) === '2')
            : [];
        } else {
          console.error(data.message);
        }
      }

      function initCurrentUserData(records) {
        if (pageNo.value == 1 && props.inSuperQuery === true) {
          records.unshift({ ...mySelfData });
        }
      }

      function onSelectUser(info) {
        if (props.multi === true) {
          let arr = selectedUserList.value;
          let idList = selectedIdList.value;
          if (idList.indexOf(info.id) < 0) {
            arr.push({ ...info });
            selectedUserList.value = arr;
          }
        } else {
          selectedUserList.value = [{ ...info }];
        }
      }
      function unSelectUser(id) {
        let arr = selectedUserList.value;
        let index = -1;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === id) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          arr.splice(index, 1);
          selectedUserList.value = arr;
        }
      }

      function onChangeTab(tab) {
        myActiveKey.value = tab;
      }

      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      loadUserList();

      return {
        selectedDepart,
        departOptions,
        initDepartOptions,
        onDepartChange,

        register,
        handleOk,

        searchText,
        searchInputStatus,
        showSearchInput,
        onSearchUser,
        clearSearch,

        myActiveKey,
        onChangeTab,

        pageNo,
        totalRecord,
        onPageChange,
        userDataList,
        selectedUserList,
        selectedIdList,
        onSelectUser,
        unSelectUser,
        excludeUserIdList,
      };
    },
  };
</script>

<style lang="less">
  .j-user-select-modal2 {
    .depart-select {
      .ant-select-selector {
        color: #fff !important;
        background-color: #409eff !important;
        border-radius: 5px !important;
      }
      .ant-select-selection-item,
      .ant-select-arrow {
        color: #fff !important;
      }
    }
    .my-search {
      position: absolute;
      top: 14px;
      z-index: 1;
      &.all-width {
        width: 100%;
      }

      .anticon {
        cursor: pointer;
        &:hover {
          color: #0a8fe9 !important;
        }
      }
      .hidden {
        display: none;
      }
    }

    .my-tabs {
    }

    .selected-users {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      padding-top: 15px;
    }

    .scroll-container {
      padding-bottom: 0 !important;
    }
  }
</style>