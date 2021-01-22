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
        editBtn: false,
        // editBtnText: "重新提交",
        labelWidth: "125",
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "申报周期",
            prop: "cycle",
            type: "select",
            dicData: Dic.find("DIC014"),
          },
          {
            label: "申报时间",
            prop: "time"
          },
          {
            label: "申报单位",
            prop: "unit",
            type: "select",
            dicData: Dic.find("DIC015")
          },
          {
            label: "申报数量",
            prop: "number"
          },
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            dicData: Dic.find("DIC011"),
            editDisplay: false,
          },
        ],
      },
    };
  },
  created() {
    console.log(this.list);
    this.lists = this.list.map((item) => {
      return item;
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