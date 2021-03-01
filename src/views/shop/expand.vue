<template>
  <div class="expand-product-wrap">
    <avue-crud
      v-model="form"
      :option="option"
      :data="lists"
      @row-update="rowUpdate"
      :permission="getPermission"
    >
    <template slot="status" slot-scope="{row: { status }}">
      <el-tag v-if="status === '5'" type="success">通过</el-tag>
      <el-tag v-else-if="status === '4'" type="danger">驳回</el-tag>
      <el-tag v-else>待审核</el-tag>
    </template>
    <template slot="statusForm" slot-scope="{row: { status }}">
      <el-tag v-if="status === '5'" type="success">通过</el-tag>
      <el-tag v-else-if="status === '4'" type="danger">驳回</el-tag>
      <el-tag v-else>待审核</el-tag>
    </template>
    <template slot="oudai" slot-scope="{row}">
      <el-tag type="warning" style="cursor: pointer;" @click="downloadFile('oudai', row)" v-if="row.ouDaiCe">欧代证书下载</el-tag>
    </template>
    <template slot="doc" slot-scope="{row}">
      <el-tag style="cursor: pointer;" @click="downloadFile('doc', row)" v-if="row.doc">doc文件下载</el-tag>
    </template>
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
      form: {},
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
        viewBtn: true,
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
            label: "欧代证书",
            prop: "oudai",
            editDisplay: false,
            slot: true,
            viewDisplay: false
          },
          {
            label: "doc文件",
            prop: "doc",
            slot: true,
            viewDisplay: false,
            editDisplay: false
          },
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            dicData: Dic.find("DIC011"),
            editDisplay: false,
            slot: true,
            formSlot: true
          },
          {
            label: "驳回原因",
            type: "textarea",
            prop: "rejectReason",
            hide: true,
            viewdDisplay: false,
            editDisplay: false
          }
        ],
      },
    };
  },
  watch: {
    "form.status": {
      handler (val) {
        const rejectReason = this.findObject(
          this.option.column,
          "rejectReason"
        );
        rejectReason.viewdDisplay = val === '4';
      },
      immediate: true
    }
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
    downloadFile(type, row) {
      console.log(row);
      const { doc, ouDaiCe, product } = row;
      const { productName } = product;
      const filePath = type === "doc" ? doc : ouDaiCe;
      if (!filePath) return this.$message.warning('文件不存在，请联系管理员')
      console.log(filePath);
      const fileType = filePath.split(".")[filePath.split(".").length - 1];
      console.log(fileType);
      const fileName =
        type === "doc"
          ? `${productName}doc文件.${fileType}`
          : `${productName}欧代证书.${fileType}`;
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
    getPermission(key, row, index) {
      if (['menu', 'viewBtn'].includes(key)) return true;
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