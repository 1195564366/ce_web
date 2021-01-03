<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      :table-loading="tableLoading"
      :page.sync="page"
      @row-save="rowSave"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @search-change="searchChange"
    >
    <template slot-scope="scope" slot="menu">
      <el-button
        type="text"
        v-if="scope.row.status === 'reject'"
        @click.stop="alignSubmit(scope.row);"
        >重新提交</el-button
      >
      <el-button
        type="text"
        v-if="scope.row.status === 'reject'"
        style="color: #f00;"
        @click.stop="del(scope.row);"
        >删除</el-button
      >
    </template>
    </avue-crud>

    <Confirm ref="confirm" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from "@minxin";

export default {
  components: {
    Confirm,
  },
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      search: {},
      data: [],
      option: {
        align: "center",
        menuAlign: "center",
        labelWidth: "100",
        editBtn: false,
        delBtn: false,
        column: [
          {
            label: "id",
            prop: "id",
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "店铺名称",
            prop: "shopName",
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
            rules: [
              {
                required: true,
                message: "输入联系人电话",
              },
            ],
          },
          {
            label: "状态",
            prop: "status",
            addDisplay: false,
            editDisplay: false,
            dicData: Dic.find('DIC001')
          },
          {
            label: "驳回原因",
            prop: "rejectReason",
            addDisplay: false,
            editDisplay: false,
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
      const result = await this.$fetchGet(
        "/api/shop/index",
        {
          ...this.search,
          pageNo: this.page.currentPage,
          pageSize: this.page.pageSize,
        }
      );
      this.tableLoading = false;
      this.data = result ? result.rows : [];
      this.page.total = result ? result.count : 0;
      cb();
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
    // 删除
    async del(row) {
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
    // 修改
    async rowUpdate(row, index, done, loading) {
      const {
        id,
        name,
        tids,
        image,
        sort,
        discou_price,
        price,
        text,
        status,
        hot,
        cycle,
        goods_type,
      } = row;
      const result = await this.$fetchPost(
        "/admin/goods/ups",
        {
          id,
          name,
          image,
          sort,
          discou_price,
          price,
          text,
          status,
          hot,
          cycle,
          num: 0,
          goods_type,
          tid: tids[1], // 二级Id
          tpid: tids[0], // 一级Id
        },
        { allData: true }
      );
      if (result.code !== 200) return;
      done();
      this.$message.success("业务修改成功");
      this.getList();
    },
    // 分页
    currentChange() {
      this.getList();
    },
    // 搜索
    async searchChange(params, done) {
      const { name, tids, status } = params;
      this.search = {
        name,
        status,
      };
      tids && (this.search["tid"] = tids[1]);
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 重置
    refreshChange() {
      this.page.currentPage = 1;
      this.getList();
    },
  },
};
</script>

<style>
</style>