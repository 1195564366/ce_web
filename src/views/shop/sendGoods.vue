<template>
  <el-dialog title="发货" :visible="show" @close="close" width="1220px">
    <el-tag type="danger" style="margin-bottom: 20px;">提交之前，请确保已下载doc文件和欧代证书</el-tag>
    <el-form :inline="true" :model="form" ref="form">
      <el-card v-for="(item, index) in form.body" :key="index">
        <el-form-item
          label="ASIN"
          :prop="`body.${index}.pid`"
          :rules="{
            required: true, message: '选择ASIN', trigger: 'change'
          }"
        >
          <el-select
            placeholder="选择ASIN"
            v-model="item.pid"
            :disabled="loading"
            @change="((e) => {
            asinChange(e, index)
          })"
          >
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
          <el-tag style="cursor: pointer;" @click="downloadFile('doc', index)">doc文件</el-tag>
        </el-form-item>
        <el-form-item>
          <el-tag type="warning" style="cursor: pointer;" @click="downloadFile('oudai', index)">欧代证书</el-tag>
        </el-form-item>
      </el-card>
      <el-form-item class="sendform-footer">
        <el-button type="primary" @click="submit" :disabled="loading" :loading="loading">提交</el-button>
        <el-button @click="onAdd" :disabled="loading">添加</el-button>
        <el-button @click="resetForm" :disabled="loading">重置</el-button>
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
    downloadFile(type, index) {
      const { body } = this.form;
      if (!body[index].pid) {
        this.$message.warning("选择完ASIN，才能下载对应文件");
        return;
      }
      const productIndex = this.product.findIndex(
        (item) => item.id === body[index].pid
      );
      const product = this.product[productIndex];
      const { doc, ouDaiCe, productName } = product;
      const filePath = type === "doc" ? doc : ouDaiCe;
      console.log(filePath);
      const fileType = filePath.split(".")[filePath.split(".").length - 1];
      console.log(fileType);
      const fileName =
        type === "doc"
          ? `${productName}doc文件.${fileType}`
          : `${productName}欧代证书.${fileType}`;
      console.log(fileName);
      const loading = this.$loading({
        lock: true,
        text: "文件下载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      axios({
        url: `common/downloadFile?filePath=${filePath}`,
        method: "get",
        responseType: "blob",
      }).then((res) => {
        if ("download" in document.createElement("a")) {
          let url = window.URL.createObjectURL(res.data);
          let link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", `${fileName}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          loading.close();
        } else {
          navigator.msSaveBlob(res.data, `${fileName}`);
        }
      });
    },
    async open(row) {
      const { id } = row;
      this.sid = id;
      const result = await this.$fetchGet("/api/shop/sendGoodsProductList", {
        sid: id,
      });
      this.product = result.map((item) => {
        const { product, asin, doc, ouDaiCe } = item;
        const spid = item.id;
        const { productName, id } = product;
        return {
          spid,
          productName,
          id,
          asin,
          doc,
          ouDaiCe,
        };
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
        this.$confirm(
          "提交之前，请确保已下载doc文件和欧代证书, 是否继续?",
          "温馨提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(async () => {
            const { body } = this.form;
            body.map((item) => {
              const { pid } = item;
              const index = this.product.findIndex((item) => item.id === pid);
              item.spid = this.product[index].spid;
            });
            this.loading = true;
            const result = await this.$fetchPost(
              "/api/sendGoods/send",
              {
                sid: this.sid,
                body,
              },
              {
                allData: true,
              }
            );
            this.loading = false;
            if (!result.success) return;
            this.$message.success("发货成功");
            this.close();
          })
          .catch(() => {});
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