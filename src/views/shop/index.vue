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
        <el-button type="text" icon="el-icon-truck" style="font-size: 12px;" v-if="scope.row.status === 'adopt'" @click="onSendGoods(scope.row)">发货</el-button>
      </template>
    </avue-crud>

    <Confirm ref="confirm" />

    <sendGoods ref="sendGoods" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from "@minxin";
import sendGoods from './sendGoods';

export default {
  components: {
    Confirm,
    sendGoods
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
        labelWidth: "100",
        editBtnText: "重新提交",
        viewBtn: true,
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
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchGet("/api/shop/index", {
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
      return status === "reject";
    },
    // 新增
    async rowSave(row, done, loading) {
      const {
        shopName,
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
    onSendGoods (row) {
      this.$refs['sendGoods'].open(row);
    }
  },
};
</script>

<style>
</style>