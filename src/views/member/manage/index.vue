<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      :page.sync="page"
      :table-loading="tableLoading"
      @search-change="searchChange"
      @current-change="currentChange"
    ></avue-crud>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import { Dic } from "@utils";
import { Page } from "@minxin";
import Confirm from "@components/Confirm";

export default {
  components: {
    Confirm,
  },
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      data: [],
      option: {
        title: "会员管理",
        // page: false,
        addBtn: false,
        menu: false,
        editBtn: false,
        delBtn: false,
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "姓名",
            prop: "name",
            search: true
          },
          {
            label: "手机号",
            prop: "phone",
            search: true
          },
          {
            label: "状态",
            prop: "status",
            type: "select",
            search: true,
            dicData: Dic.find("DIC002"),
          },
          {
            label: "微信号",
            prop: "weixin"
          },
          {
            label: "邮箱",
            prop: "email"
          },
          {
            label: "用户类型",
            prop: "userType",
            type: "select",
            dicData: Dic.find('DIC010')
          },
          {
            label: "所属行业",
            prop: "userIndustry",
            type: "select",
            dicData: Dic.find('DIC008')
          },
          {
            label: "国籍",
            prop: "nationality",
            type: "select",
            dicData: Dic.find('DIC011')
          },
          {
            label: "公司名称",
            prop: "company"
          },
          {
            label: "公司性质",
            prop: "nature",
            type: "select",
            dicData: Dic.find('DIC009')
          },
          {
            label: "营业执照号",
            prop: "license"
          },
          {
            label: "注册地址",
            prop: "register"
          },
          {
            label: "通信地址",
            prop: "adress"
          },
          {
            label: "详细地址",
            prop: "detailed"
          },
          {
            label: "注册时间",
            prop: "created_at",
            type: "date",
            format: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false,
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取分页数据
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchPost(
        "/admin/user/lists",
        {
          page: this.page.currentPage,
          limit: this.page.pageSize,
          ...this.search,
        },
        { allData: true }
      );
      console.log(result.data);
      this.tableLoading = false;
      this.page.total = result.count || 0;
      this.data = (result.data || []).map(item => {
        const { province, city, area } = item;
        item.adress = province ? `${province}/${city}/${area}` : null;
        return item
      });
      cb();
    },
    // 搜索
    async searchChange(params, done) {
      this.search = params;
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 分页
    currentChange () {
      this.getList();
    },
  },
};
</script>

<style>
</style>