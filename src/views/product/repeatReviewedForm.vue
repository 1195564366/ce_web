<template>
  <el-dialog title="复审提交" :visible="show" width="500px" @close="close" :close-on-click-modal="false">
    <avue-form :option="option" v-model="form" @submit="onSubmit" @reset-change="resetChange" ref="form"></avue-form>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      id: null,
      form: {},
      storageData: {},
      option: {
        labelWidth: "120",
        column: [
          {
            label: "产品名称",
            prop: "productName",
            span: 24,
            detail: true,
          },
          {
            label: "亚马逊发货链接",
            prop: "amazonSendGoodLink",
            span: 24,
            detail: true,
          },
          {
            label: "品牌",
            prop: "brand",
            span: 24,
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
            span: 24,
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
    open(row) {
      this.show = true;
      const { id, productName, amazonSendGoodLink } = row;
      this.id = id;
      this.form = this.storageData = {
        productName,
        amazonSendGoodLink,
      };
    },
    close () {
      this.$refs['form'].resetForm();
      this.show = false;
    },
    // 提交
    async onSubmit(form, done) {
      const { asin, brand } = form;
      const result = await this.$fetchPost("/api/product/repeatReviewed", {
        id: this.id,
        asin,
        brand,
      }, { allData: true });
      done();
      if (!result.success) return;
      this.$message.success('产品复审提交成功');
      this.$emit('ok');
      this.close();
    },
    // 重置
    resetChange() {
      const { productName, amazonSendGoodLink } = this.storageData;
      this.form.productName = productName;
      this.form.amazonSendGoodLink = amazonSendGoodLink;
    },
  },
};
</script>

<style>
</style>