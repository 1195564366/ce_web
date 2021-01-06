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
    <template slot="productName" slot-scope="scope">
      {{ scope.row.product.productName }}
    </template>
    <template slot="shopName" slot-scope="scope">
      {{ scope.row.shop.shopName }}
    </template>
    <template slot="asin" slot-scope="scope">
      {{ scope.row.product.asin }}
    </template>
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
        addBtn: false,
        menu: false,
        column: [
          {
            label: "店铺名称",
            prop: "shopName",
            slot: true
          },
          {
            label: "产品名称",
            prop: "productName",
            slot: true
          },
          {
            label: "产品ASIN",
            prop: "asin",
            slot: true
          },
          {
            label: "箱数",
            prop: "boxNum"
          },
          {
            label: "数量",
            prop: "num"
          },
          {
            label: "发货时间",
            prop: "createdAt",
            type: "date",
            format: "yyyy-MM-dd HH:mm:ss",
            valueFormat: "yyyy-MM-dd HH:mm:ss",
          }
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
      const result = await this.$fetchGet("/api/sendGoods/index", {
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