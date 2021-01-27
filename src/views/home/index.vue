<template>
  <div class="app-container" v-loading="loading">
    <avue-data-box :option="option"></avue-data-box>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      option: {
        span: 12,
        data: [],
      },
    };
  },
  async created() {
    this.loading = true;
    const result = await this.$fetchGet("/api/home");
    this.loading = false;
    console.log(result);
    const { shop, product, sendGood, business, declare } = result;
    this.option.data = [
      {
        title: "店铺数量",
        count: shop,
        icon: "el-icon-s-help",
        color: "rgb(56, 161, 242)",
      },
      {
        title: "商品数量",
        count: product,
        icon: "el-icon-s-goods",
        color: "rgb(117, 56, 199)",
      },

      {
        title: "发货数量",
        count: sendGood,
        icon: "el-icon-truck",
        color: "rgb(49, 180, 141)",
      },
      {
        title: "回收数量",
        count: business,
        icon: "el-icon-box",
        color: "rgb(56, 161, 242)",
      },
      {
        title: "申报数量",
        count: declare,
        icon: "el-icon-printer",
        color: "rgb(117, 56, 199)",
      },
    ];
    console.log();
  },
};
</script>

<style>
</style>