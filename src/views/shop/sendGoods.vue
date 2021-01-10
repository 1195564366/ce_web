<template>
  <el-dialog title="发货" :visible="show" @close="close" width="1220px">
    <el-form :inline="true" :model="form" ref="form">
      <el-card v-for="(item, index) in form.body" :key="index">
        <el-form-item
          label="ASIN"
          :prop="`body.${index}.pid`"
          :rules="{
            required: true, message: '选择ASIN', trigger: 'change'
          }"
        >
          <el-select placeholder="选择ASIN" v-model="item.pid" :disabled="loading" @change="((e) => {
            asinChange(e, index)
          })">
            <el-option
              v-for="(productItem, productIndex) in product"
              :key="productIndex"
              :value="productItem.id"
              :label="productItem.asin"
            >{{productItem.asin}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品">
          <el-input v-model="item.productName" disabled placeholder="选择ASIN，自动填充" />
        </el-form-item>
        <el-form-item
          label="箱数"
          :prop="`body.${index}.boxNum`"
          :rules="{
          required: true, message: '录入箱数', trigger: 'blur'
        }"
        >
          <el-input-number v-model="item.boxNum" placeholder="输入箱数" :min="1" :disabled="loading" />
        </el-form-item>
        <el-form-item
          label="数量"
          :prop="`body.${index}.num`"
          :rules="{
          required: true, message: '录入数量', trigger: 'blur'
        }"
        >
          <el-input-number v-model="item.num" placeholder="输入数量" :min="1" :disabled="loading" />
        </el-form-item>
        <el-form-item>
          <el-tag style="cursor: pointer;">doc文件</el-tag>
        </el-form-item>
        <el-form-item>
          <el-tag type="warning" style="cursor: pointer;">欧代证书</el-tag>
        </el-form-item>
      </el-card>
      <el-form-item class="sendform-footer">
        <el-button type="primary" @click="submit" :disabled="loading" :loading="loading">提交</el-button>
        <el-button @click="onAdd" :disabled="loading">添加</el-button>
        <el-button @click="resetForm"  :disabled="loading">重置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      product: [],
      sid: null,
      loading: false,
      form: {
        body: [
          {
            pid: null,
            boxNum: null,
            num: null,
          },
        ],
      },
    };
  },
  methods: {
    async open(row) {
      const { id } = row;
      this.sid = id;
      const result = await this.$fetchGet("/api/shop/sendGoodsProductList", { sid: id });
      this.product = result.map(item => {
        const { product, asin } = item;
        const spid = item.id;
        const { productName, id } = product;
        return {
          spid,
          productName,
          id,
          asin
        }
      });
      this.show = true;
    },
    close() {
      this.resetForm();
      this.show = false;
    },
    // asin切换
    asinChange(id, index) {
      const product = this.product.find((item) => item.id === id);
      const { productName } = product;
      this.form.body[index].productName = productName;
    },
    // 表单重置
    resetForm() {
      this.form.body = [
        {
          pid: null,
          boxNum: null,
          num: null,
        },
      ];
    },
    // 添加一项
    onAdd() {
      this.form.body.push({
        pid: null,
        boxNum: null,
        num: null,
      });
    },
    // 提交
    submit() {
      this.$refs["form"].validate(async (valid) => {
        if (!valid) return;
        const { body } = this.form;
        body.map(item => {
          const { pid } = item;
          const index = this.product.findIndex(item => item.id === pid);
          item.spid = this.product[index].spid
        })
        this.loading = true;
        const result = await this.$fetchPost('/api/sendGoods/send', {
          sid: this.sid,
          body
        }, {
          allData: true
        });
        this.loading = false;
        if (!result.success) return;
        this.$message.success('发货成功');
        this.close();
      });
    },
  },
};
</script>

<style lang="less">
.sendform-footer {
  text-align: center;
  width: 100%;
  margin-top: 50px;
}
</style>