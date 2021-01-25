<template>
  <div class="app-form"  v-if="recoverShow">
    <h1 style="width: 100%; text-align: center;">回收业务申请</h1>
    <avue-form :option="option" :value="form" @submit="onSubmit" ref="form"></avue-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recoverShow: false,
      form: {
        companyName: "",
        companyAdress: "",
        companyRegisterNum: "",
        businessLicense: "",
      },
      option: {
        span: 24,
        labelWidth: "100",
        menuBtn: true,
        column: [
          {
            label: "审核状态",
            prop: "status",
            type: "select",
            display: false,
            disabled: true,
            dicData: [
              {
                value: "1",
                label: "待审核",
              },
              {
                value: "2",
                label: "驳回",
              },
            ],
          },
          {
            label: "驳回原因",
            prop: "rejectReason",
            display: false,
            disabled: true,
          },
          {
            label: "公司名称",
            prop: "companyName",
            rules: [
              {
                required: true,
                message: "输入公司名称",
              },
            ],
          },
          {
            label: "公司地址",
            prop: "companyAdress",
            rules: [
              {
                required: true,
                message: "输入公司地址",
              },
            ],
          },
          {
            label: "公司注册号",
            prop: "companyRegisterNum",
            rules: [
              {
                required: true,
                message: "输入公司注册号",
              },
            ],
          },
          {
            label: "营业执照",
            prop: "businessLicense",
            type: "upload",
            accept: this.$accept,
            listType: "picture-img",
            multiple: false,
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            tip: "只能上传jpg/png图片、pdf文件，且不超过5M",
            action: "/common/uploadFile",
            rules: [
              {
                required: true,
                message: "上传营业执照",
              },
            ],
            uploadPreview: this.$onUploadPreview,
          },
        ],
      },
    };
  },
  methods: {
    async getIsUse(result) {
      // console.log(result);
      this.recoverShow = true;
      const {
        companyName,
        companyAdress,
        companyRegisterNum,
        businessLicense,
        status,
        rejectReason,
      } = result;
      if (status === "1") {
        const statusColumn = this.findObject(this.option.column, "status");
        const rejectReasonColumn = this.findObject(
          this.option.column,
          "rejectReason"
        );
        statusColumn.display = true;
        rejectReasonColumn.display = false;

        this.recoverShow = true;
        this.form = {
          companyName,
          companyAdress,
          companyRegisterNum,
          businessLicense,
          status,
        };
        this.option.column.map((item) => {
          item.disabled = true;
        });
        this.option.menuBtn = false;
      }
      if (status === "2") {
        const statusColumn = this.findObject(this.option.column, "status");
        const rejectReasonColumn = this.findObject(
          this.option.column,
          "rejectReason"
        );
        statusColumn.display = true;
        rejectReasonColumn.display = true;

        this.recoverShow = true;
        this.form = {
          companyName,
          companyAdress,
          companyRegisterNum,
          businessLicense,
          status,
          rejectReason,
        };
      }
    },
    async onSubmit(form, done) {
      const {
        companyName,
        companyAdress,
        companyRegisterNum,
        businessLicense,
      } = form;
      const result = await this.$fetchPost(
        "/api/recover/add",
        { companyName, companyAdress, companyRegisterNum, businessLicense },
        { allData: true }
      );
      if (!result.success) return;
      this.$message.success("申请提交成功");
      this.getIsUse();
      done();
    },
  },
};
</script>

<style lang="less" scoped>
.app-form {
  width: 500px;
  margin: 0 auto;
}
</style>