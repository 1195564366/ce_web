<template>
  <div class="app-container">
    <Form v-if="recoverShow" ref="form" />
    <avue-crud
      v-else
      :data="data"
      v-model="form"
      :option="option"
      :table-loading="tableLoading"
      @row-save="rowSave"
      @refresh-change="getList"
      @selection-change="selectionChange"
    >
      <template slot="menuRight">
        <el-button type="primary" size="small" @click="onRecoverView">回收资料</el-button>
      </template>
      <template slot="menu" slot-scope="{ row }">
        <el-button
          type="text"
          icon="el-icon-position"
          style="font-size: 12px"
          v-if="row.registerNumber && row.certificate"
          @click="onDeclare(row)"
          >申报</el-button
        >
      </template>
      <template slot="expand" slot-scope="{ row }">
        <Expand :list="row.declares" @ok="getList" />
      </template>
    </avue-crud>

    <Declare ref="declare" @ok="getList" />
    <el-dialog
      title="回收资料"
      :visible="recoverShow1"
      width="500px"
      @close="recoverShow1 = false"
      :close-on-click-modal="false"
    >
      <avue-form ref="form" v-model="recoverData" :option="option1">

      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
import Form from "./form";
import Declare from "./declare";
import Expand from "./expand";

import { Dic } from "@utils";

export default {
  components: {
    Form,
    Declare,
    Expand,
  },
  data() {
    const uploadProp = (
      label,
      prop,
      accept,
      required = true,
      listType = "picture-card",
      tip = "只能上传jpg/png图片、pdf文件，且不超过5M"
    ) => {
      return {
        label,
        prop,
        hide: true,
        type: "upload",
        accept,
        multiple: true,
        span: 24,
        listType,
        propsHttp: {
          home: this.$fileUrl,
          res: "data",
        },
        action: "/common/uploadFile",
        tip,
        rules: [
          {
            required,
            message: `上传${label}`,
          },
        ],
        uploadPreview: this.$onUploadPreview,
      };
    };
    return {
      option1: {
        span: 24,
        menuBtn: false,
        column: [{
            label: "公司名称",
            prop: "companyName",
            detail: true,
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
            detail: true,
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
            detail: true,
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
            detail: true,
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
          },]
      },
      recoverShow1: false,
      recoverData: {},
      recoverShow: true,
      data: [],
      form: {},
      option: {
        expand: true,
        span: 24,
        editBtn: false,
        delBtn: false,
        viewBtn: true,
        labelWidth: "120",

        dialogClickModal: false,
        dialogWidth: this.$dialogWidth,
        column: [
          {
            label: "国家",
            prop: "country",
            type: "select",
            dicData: Dic.find("DIC006"),
            rules: [
              {
                required: true,
                message: "选择国家",
              },
            ],
          },
          {
            label: "业务",
            prop: "business",
            type: "select",
            dicData: Dic.find("DIC013"),
            rules: [
              {
                required: true,
                message: "选择业务",
              },
            ],
          },
          uploadProp(
            "申请表",
            "application",
            ".doc,.docx,.pdf",
            true,
            "picture-img",
            "只能上传word文档、pdf文件，且不超过5M"
          ),
          uploadProp(
            "中文营业执照",
            "licenseCn",
            this.$accept,
            true,
            "picture-img"
          ),
          uploadProp(
            "英文营业执照",
            "licenseEn",
            this.$accept,
            true,
            "picture-img"
          ),
          uploadProp(
            "授权书",
            "certificateAuth",
            this.$accept,
            true,
            "picture-img"
          ),
          uploadProp("商品图片", "productPicture", this.$accept, true),
          uploadProp(
            "邮箱授权书",
            "mailCertificateAuth",
            this.$accept,
            false,
            "picture-img"
          ),
          uploadProp("其他资料", "data", this.$accept, false),
          {
            label: "注册号",
            prop: "registerNumber",
            addDisplay: false,
          },
          {
            label: "申报分类",
            prop: "declareClass",
            type: "select",
            multiple: true,
            hide: true,
            dicData: [],
            addDisplay: false,
            rules: [
              {
                required: true,
                message: "选择申报分类",
              },
            ],
          },
          {
            label: "产品证书",
            prop: "certificate",
            hide: true,
            type: "upload",
            accept: this.$accept,
            multiple: true,
            addDisplay: false,
            span: 24,
            listType: "picture-card",
            propsHttp: {
              home: this.$fileUrl,
              res: "data",
            },
            action: "/common/uploadFile",
            tip: "只能上传jpg/png图片,以及pdf文件，且不超过5M",
            rules: [
              {
                required: true,
                message: "上传产品证书",
              },
            ],
            uploadPreview: this.$onUploadPreview,
          },
        ],
      },
      tableLoading: false,
    };
  },
  mounted() {
    // this.getList();
  },
  watch: {
    "form.business": {
      handler(val) {
        const application = this.findObject(this.option.column, "application");
        const declareClass = this.findObject(
          this.option.column,
          "declareClass"
        );

        if (val === "battery") {
          application.display = true;
          application.rules = [
            {
              required: true,
              message: "上传申请表",
            },
          ];
          declareClass.dicData = Dic.find("DIC017");
        } else {
          application.display = false;
          application.rules = [];
          declareClass.dicData = Dic.find("DIC016");
        }
      },
      immediate: true,
    },
  },
  async created() {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    const result = await this.$fetchGet("/api/recover/index");
    loading.close();
    console.log(result);
    if (!result) {
      this.recoverShow = true;
      this.$refs["form"].getIsUse({});
      return;
    }
    if (result.status !== "3") {
      this.recoverShow = true;
      this.$refs["form"].getIsUse(result);
    } else {
      this.recoverData = result;
      this.recoverShow = false;
      this.getList();
    }
  },
  methods: {
    onRecoverView () {
      this.recoverShow1 = true;
      console.log(1111, this.recoverData);
    },
    //
    selectionChange(selection) {
      console.log(selection);
    },
    // 列表
    getList(cb = () => {}) {
      this.tableLoading = true;
      this.data = [];
      this.$nextTick(async () => {
        const result = await this.$fetchGet("/api/business/index", {
          ...this.search,
        });
        this.tableLoading = false;
        this.data = result || [];
        cb();
      });
    },
    // 新增
    async rowSave(row, done, loading) {
      const {
        country,
        business,
        application, // 单
        licenseCn, // 单
        licenseEn, // 单
        certificateAuth, // 单
        productPicture, // 多
        mailCertificateAuth, // 单
        data, // 多
      } = row;
      console.log(
        country,
        business,
        application,
        licenseCn,
        licenseEn,
        certificateAuth,
        productPicture,
        mailCertificateAuth,
        data
      );
      const result = await this.$fetchPost(
        "/api/business/add",
        {
          country,
          business,
          application: business === "weee" ? null : application, // 单
          licenseCn, // 单
          licenseEn, // 单
          certificateAuth, // 单
          productPicture: productPicture.map((item) => item.value).join(","), // 多
          mailCertificateAuth, // 单
          data: data.map((item) => item.value).join(","),
        },
        { allData: true }
      );
      loading();
      if (!result.success) return;
      done();
      this.$message.success("业务注册成功");
      this.getList();
    },
    // 申报
    onDeclare(row) {
      this.$refs["declare"].open(row);
    },
  },
};
</script>