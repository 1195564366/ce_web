<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      :table-loading="tableLoading"
      :page.sync="page"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @search-change="searchChange"
      :permission="getPermission"
    >
      <template slot="countryLabel">
        <span>国家（多选）：</span>
      </template>
      <!-- <template slot-scope="scope" slot="menu"> -->
      <!-- <el-button type="text" v-if="scope.row.status === '5'" size="mini" icon="el-icon-check" @click="onRepeatReviewed(scope.row)">复审提交</el-button> -->
      <!-- </template> -->
    </avue-crud>

    <Confirm ref="confirm" />
    <repeatReviewedForm ref="repeatReviewedForm" @ok="getList" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from "@minxin";
import repeatReviewedForm from "./repeatReviewedForm";

export default {
  components: {
    Confirm,
    repeatReviewedForm,
  },
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      data: [],
      option: {
        align: "center",
        menuAlign: "center",
        labelWidth: "125",
        viewBtn: true,
        editBtnText: "重新提交",
        span: 24,
        dialogClickModal: false,
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "产品名称",
            prop: "productName",
            search: true,
            editDisabled: true,
            rules: [
              {
                required: true,
                message: "输入产品名称",
              },
            ],
          },
          {
            label: "国家",
            prop: "country",
            type: "select",
            search: true,
            multiple: true,
            editDisabled: true,
            labelslot: true,
            dicData: Dic.find("DIC006"),
            rules: [
              {
                required: true,
                message: "选择国家",
              },
            ],
          },
          {
            label: "产品分类",
            prop: "productClass",
            type: "select",
            search: true,
            dicData: Dic.find("DIC007"),
            rules: [
              {
                required: true,
                message: "选择产品分类",
              },
            ],
          },
          {
            label: "产品型号",
            prop: "productModel",
            rules: [
              {
                required: true,
                message: "输入产品型号",
              },
            ],
          },
          {
            label: "证书/检测报告",
            prop: "productReport",
            hide: true,
            type: "upload",
            accept: this.$accept,
            listType: "picture-card",
            multiple: false,
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            tip: this.$tip,
            action: "/common/uploadFile",
            rules: [
              {
                required: true,
                message: "上传证书/检测报告",
              },
            ],
            uploadPreview: this.$onUploadPreview,
          },
          {
            label: "产品包装六面图",
            prop: "productPackingImg",
            hide: true,
            type: "upload",
            accept: this.$accept,
            listType: "picture-card",
            multiple: false,
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            tip: this.$tip,
            action: "/common/uploadFile",
            rules: [
              {
                required: true,
                message: "上传产品包装六面图",
              },
            ],
            uploadPreview: this.$onUploadPreview,
          },
          {
            label: "产品说明书",
            prop: "productInstructions",
            hide: true,
            type: "upload",
            accept: this.$accept,
            listType: "picture-card",
            multiple: false,
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            tip: this.$tip,
            action: "/common/uploadFile",
            rules: [
              {
                required: true,
                message: "上传产品产品说明书",
              },
            ],
            uploadPreview: this.$onUploadPreview,
          },
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            dicData: Dic.find("DIC008"),
            editDisplay: false,
            addDisplay: false,
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
      const result = await this.$fetchGet("/api/product/index", {
        ...this.search,
        pageNo: this.page.currentPage,
        pageSize: this.page.pageSize,
      });
      this.tableLoading = false;
      this.data = result ? result.rows : [];
      this.page.total = result ? result.count : 0;
      cb();
    },
    // 按钮权限
    getPermission(key, row, index) {
      if (key === "viewBtn") return true;
      if (!row) return true;
      const { status } = row;
      if (status === "4" && ["delBtn", "editBtn"].includes(key)) return true;
      return false;
    },
    // 新增
    async rowSave(row, done, loading) {
      const {
        productName,
        country,
        productClass,
        productModel,
        productReport,
        productPackingImg,
        productInstructions,
      } = row;
      const result = await this.$fetchPost(
        "/api/product/add",
        {
          productName,
          country,
          productClass,
          productModel,
          productReport: productReport.map((item) => item.value).join(","),
          productPackingImg: productPackingImg
            .map((item) => item.value)
            .join(","),
          productInstructions: productInstructions
            .map((item) => item.value)
            .join(","),
        },
        { allData: true }
      );
      loading();
      if (!result.success) return;
      done();
      this.$message.success("店铺审核提交成功，请等待管理员审核通过");
      this.getList();
    },
    // 重新提交
    async rowUpdate(row, index, done, loading) {
      const {
        id,
        productClass,
        productModel,
        productInstructions,
        productPackingImg,
        productReport,
      } = row;
      const result = await this.$fetchPost(
        "/api/product/repeatSubmit",
        {
          id,
          productClass,
          productModel,
          productInstructions,
          productPackingImg,
          productReport,
        },
        { allData: true }
      );
      loading();
      if (!result.success) return;
      done();
      this.$message.success("产品重新审核提交成功，请等待管理员审核通过");
      this.getList();
    },
    // 删除
    async rowDel(row, index) {
      const { id, productName } = row;
      this.$refs["confirm"].open({
        message: `是否删除产品《${productName}》？`,
        ok: async (cb) => {
          const result = await this.$fetchGet(
            `/api/product/del`,
            { id },
            { allData: true }
          );
          cb();
          if (!result.code) return;
          this.$message.success("产品删除成功");
          this.getList();
        },
      });
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
    },
    // 复审提交
    onRepeatReviewed(row) {
      this.$refs["repeatReviewedForm"].open(row);
      // console.log(row);
    },
  },
};
</script>

<style>
</style>