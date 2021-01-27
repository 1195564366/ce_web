<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      :table-loading="tableLoading"
      :page.sync="page"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @search-change="searchChange"
    >
    </avue-crud>
  </div>
</template>

<script>
import { Dic } from "@utils";
import { Page } from "@minxin";

export default {
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      data: [],
      option: {
        align: "center",
        menuAlign: "center",
        labelWidth: "100",
        menu: false,
        addBtn: false,
        dialogClickModal: false,
        span: 24,
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "账单号",
            prop: 'orderId',
            search: true
          },
          {
            label: "账单类型",
            prop: "type",
            search: true,
            type: 'select',
            dicData: Dic.find('DIC005')
          },
          {
            label: "账单明细",
            prop: "message"
          },
          {
            label: "应付金额",
            prop: "amountCost"
          },
          {
            label: "实付金额",
            prop: "paidCost"
          },
          {
            label: "计费时间",
            prop: "createdAt",
            type: "date",
            addDisplay: false,
            editDisplay: false,
            format: "yyyy-MM-dd HH:mm:ss",
            valueFormat: "yyyy-MM-dd HH:mm:ss",
          },
        ],
      },
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 列表
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchGet("/api/bill", {
        ...this.search,
        pageNo: this.page.currentPage,
        pageSize: this.page.pageSize,
      });
      this.tableLoading = false;
      this.data = result ? result.rows : [];
      this.page.total = result ? result.count : 0;
      cb();
    },
    // 分页
    currentChange() {
      this.getList();
    },
    // 搜索
    async searchChange(params, done) {
      this.search = params;
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 重置
    refreshChange() {
      this.page.currentPage = 1;
      this.getList();
    }
  },
};
</script>

<style>
</style>