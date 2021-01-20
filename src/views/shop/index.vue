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
      <template slot="menu" slot-scope="scope">
        <el-button
          type="text"
          icon="el-icon-truck"
          style="font-size: 12px"
          v-if="scope.row.status === 'adopt' && scope.row.useStatus === 'enable'"
          @click="onSendGoods(scope.row)"
        >发货</el-button>
        <el-button
          type="text"
          icon="el-icon-plus"
          style="font-size: 12px"
          v-if="
            scope.row.status === 'adopt' && scope.row.useStatus === 'enable'
          "
          @click="onAddProduct(scope.row)"
        >添加产品</el-button>
        <!-- <el-button
          type="text"
          icon="el-icon-remove-outline"
          style="font-size: 12px; color: #F56C6C;"
          v-if="scope.row.status === 'adopt' && scope.row.useStatus === 'enable'"
          @click="onClose(scope.row)"
        >关闭店铺</el-button> -->
      </template>

      <template slot="expand" slot-scope="{ row }">
        <expand :list="row.shopToProducts" @ok="getList" />
      </template>
    </avue-crud>

    <Confirm ref="confirm" />

    <sendGoods ref="sendGoods" />
    <addProduct ref="addProduct" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from "@minxin";
import sendGoods from "./sendGoods";
import addProduct from "./addProduct";
import expand from "./expand";

export default {
  components: {
    Confirm,
    sendGoods,
    addProduct,
    expand,
  },
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      data: [],
      option: {
        expand: true,
        align: "center",
        menuAlign: "center",
        labelWidth: "100",
        editBtnText: "重新提交",
        viewBtn: true,
        span: 24,
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "店铺名称",
            prop: "shopName",
            search: true,
            rules: [
              {
                required: true,
                message: "输入店铺名称",
              },
            ],
          },
          {
            label: "店铺链接",
            prop: "shopLink",
            type: "url",
            alone: true,
            rules: [
              {
                required: true,
                message: "输入店铺链接",
              },
            ],
          },
          {
            label: "法人姓名",
            prop: "legalPrsonName",
            rules: [
              {
                required: true,
                message: "输入法人姓名",
              },
            ],
          },
          {
            label: "法人身份证",
            prop: "legalPrsonCard",
            hide: true,
            rules: [
              {
                required: true,
                message: "输入法人身份证",
              },
            ],
          },
          {
            label: "邮箱",
            prop: "email",
            hide: true,
            rules: [
              {
                required: true,
                message: "输入邮箱",
              },
            ],
          },
          {
            label: "营业执照",
            prop: "businessLicense",
            hide: true,
            type: "upload",
            accept: "image/png, image/jpeg",
            listType: "picture-img",
            multiple: false,
            span: 24,
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            canvasOption: {
              text: " ",
              ratio: 1,
            },
            tip: "只能上传jpg/png图片，且不超过5M",
            action: "/common/uploadFile",
            rules: [
              {
                required: true,
                message: "上传营业执照",
              },
            ],
          },
          {
            label: "联系人姓名",
            prop: "contactName",
            hide: true,
            rules: [
              {
                required: true,
                message: "输入联系人姓名",
              },
            ],
          },
          {
            label: "联系人电话",
            prop: "contactPhone",
            hide: true,
            rules: [
              {
                required: true,
                message: "输入联系人电话",
              },
            ],
          },
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            search: true,
            addDisplay: false,
            editDisplay: false,
            dicData: Dic.find("DIC001"),
          },
          {
            label: "店铺状态",
            prop: "useStatus",
            type: "select",
            search: true,
            addDisplay: false,
            editDisplay: false,
            dicData: Dic.find("DIC010"),
          },
          {
            label: "驳回原因",
            prop: "rejectReason",
            hide: true,
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "申请时间",
            prop: "createdAt",
            type: "date",
            addDisplay: false,
            editDisplay: false,
            format: "yyyy-MM-dd HH:mm:ss",
            valueFormat: "yyyy-MM-dd HH:mm:ss",
          },
          {
            label: "审批时间",
            prop: "updatedAt",
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
    getList(cb = () => {}) {
      this.tableLoading = true;
      this.data = [];
      this.$nextTick(async () => {
        const result = await this.$fetchGet("/api/shop/index", {
          ...this.search,
          pageNo: this.page.currentPage,
          pageSize: this.page.pageSize,
        });
        this.tableLoading = false;
        this.data = result ? result.rows : [];
        this.page.total = result ? result.count : 0;
        cb();
      });
    },
    // 按钮权限
    getPermission(key, row, index) {
      if (key === "viewBtn") return true;
      if (!row) return true;
      const { status } = row;
      return status === "reject";
    },
    // 新增
    async rowSave(row, done, loading) {
      const {
        shopName,
        shopLink,
        legalPrsonName,
        legalPrsonCard,
        email,
        businessLicense,
        contactName,
        contactPhone,
      } = row;
      const result = await this.$fetchPost(
        "/api/shop/add",
        {
          shopName,
          shopLink: shopLink[0],
          legalPrsonName,
          legalPrsonCard,
          email,
          businessLicense,
          contactName,
          contactPhone,
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
        shopName,
        legalPrsonName,
        legalPrsonCard,
        email,
        businessLicense,
        contactName,
        contactPhone,
      } = row;
      const result = await this.$fetchPost(
        "/api/shop/repeatSubmit",
        {
          id,
          shopName,
          legalPrsonName,
          legalPrsonCard,
          email,
          businessLicense,
          contactName,
          contactPhone,
        },
        { allData: true }
      );
      loading();
      if (!result.success) return;
      done();
      this.$message.success("店铺重新审核提交成功，请等待管理员审核通过");
      this.getList();
    },
    // 删除
    async rowDel(row, index) {
      const { id, shopName } = row;
      this.$refs["confirm"].open({
        message: `是否删除店铺《${shopName}》？`,
        ok: async (cb) => {
          const result = await this.$fetchGet(
            `/api/shop/del`,
            { id },
            { allData: true }
          );
          cb();
          if (!result.code) return;
          this.$message.success("店铺删除成功");
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
    // 发货
    onSendGoods(row) {
      // this.$notify({
      //   title: '友情提示',
      //   message: '发货之前，请确保已下载doc文件和欧代证书',
      //   type: 'warning'
      // });
      this.$refs["sendGoods"].open(row);
    },
    // 添加产品
    onAddProduct(row) {
      this.$refs["addProduct"].open(row);
    },
  },
};
</script>

<style>
</style>