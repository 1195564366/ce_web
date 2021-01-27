<template>
  <el-dialog title="添加产品" :visible="show" @close="close" width="500px" :close-on-click-modal="false">
    <avue-form :option="option" v-model="form" @submit="onSubmit" ref="form"/>
  </el-dialog>
</template>

<script>
import { Dic } from "@utils";

export default {
  data() {
    return {
      show: false,
      sid: null,
      form: {
        pid: null,
      },
      option: {
        span: 24,
        labelWidth: "125",
        column: [
          {
            label: "产品",
            prop: "pid",
            type: "select",
            rules: [
              {
                required: true,
                message: "选择产品",
              },
            ],
            dicData: [],
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
            label: "ASIN",
            prop: "asin",
            rules: [
              {
                required: true,
                message: "输入ASIN",
              },
            ],
          },
        ],
      },
    };
  },
  methods: {
    async open(row) {
      const { id } = row;
      this.sid = id;
      this.show = true;
      this.getProductList();
    },
    async getProductList() {
      const result = await this.$fetchGet("/api/shop/product/list", {
        id: this.sid,
      });
      this.option.column[0].dicData = (result || []).map((item) => ({
        label: `${item.productName}（${Dic.findFilter(
          "DIC006",
          item.country
        )}）`,
        value: item.id,
      }));
    },
    close() {
      this.show = false;
      this.$refs['form'].resetForm();
    },
    async onSubmit(form, done) {
      const { pid, asgl, asin, brand } = form;
      const result = await this.$fetchPost("/api/shop/product/add", {
        sid: this.sid,
        pid,
        asgl: asgl[0],
        asin,
        brand,
      }, { allData: true });
      done();
      console.log(result);
      if (!result.success) return;
      this.$emit('ok')
      this.close();
    },
  },
};
</script>

<style lang="less">
</style>