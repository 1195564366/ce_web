<template>
  <div class="expand-product-wrap">
    <avue-crud
      :option="option"
      :data="lists"
      @row-update="rowUpdate"
      :permission="getPermission"
    >
    </avue-crud>
  </div>
</template>

<script>
import { Dic } from "@utils";

export default {
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      lists: [],
      option: {
        addBtn: false,
        columnBtn: false,
        refreshBtn: false,
        span: 24,
        editBtnText: "重新提交",
        labelWidth: "125",
        dialogClickModal: false,
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "产品名称",
            prop: "productName",
            editDisabled: true,
          },
          {
            label: "国家",
            prop: "country",
            type: "select",
            dicData: Dic.find("DIC006"),
            editDisabled: true,
          },
          {
            label: "品牌",
            prop: "brand",
            rules: [
              {
                required: true,
                message: "输入品牌",
              },
            ],
          },
          {
            label: "ASIN",
            prop: "asin",
            rules: [
              {
                required: true,
                message: "输入ASIN",
              },
            ],
          },
          {
            label: "亚马逊发货链接",
            prop: "asgl",
            type: "url",
            alone: true,
            rules: [
              {
                required: true,
                message: "输入亚马逊发货链接",
              },
            ],
          },
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            dicData: Dic.find("DIC011"),
            editDisplay: false,
          },
          {
            label: "驳回原因",
            prop: "rejectReason"
          }
        ],
      },
    };
  },
  created() {
    this.lists = this.list.map((item) => {
      const { product: {productName, country} } = item;
      return {
        productName,
        country,
        ...item
      };
    });
  },
  methods: {
    getPermission(key, row, index) {
      if (key === "menu") return true;
      const { status } = row;
      if (key === "editBtn" && status === "4") return true;
      return false;
    },
    // 重新提交
    async rowUpdate(row, index, done, loading) {
      const { id, asgl, asin, brand } = row;
      const result = await this.$fetchPost(
        "/api/shop/product/repeatSubmit",
        {
          id,
          asgl,
          asin,
          brand,
        },
        { allData: true }
      );
      loading();
      if (!result.success) return;
      done();
      this.$message.success("重新审核提交成功，请等待管理员审核通过");
      this.$emit("ok");
    },
  },
};
</script>

<style lang="less">
.expand-product-wrap {
  .avue-crud__menu {
    display: none;
  }
}
</style>