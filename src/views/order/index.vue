<template>
  <div
    class="app-container"
    v-loading="fileNum"
    element-loading-text="资料上传中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <avue-crud
      :data="data"
      :option="option"
      :page.sync="page"
      :table-loading="tableLoading"
      @search-change="searchChange"
      @current-change="currentChange"
    >
      <template slot="menuLeft">
        <el-upload
          class="upload-demo"
          action="/common/orderFile"
          :show-file-list="false"
          :on-success="onBatchSuccess"
          :before-upload="onBatchBeforeUpload"
          multiple
          :accept="orderFileAccept"
        >
          <el-button size="small" type="primary">批量上传资料</el-button>
        </el-upload>
      </template>
      <template slot-scope="scope" slot="menu">
        <el-button
          type="text"
          @click.stop="distributionOrder(scope.row, scope.index)"
          v-if="isSistributionBtn(scope.row)"
          >分配</el-button
        >
        <el-button
          type="text"
          @click.stop="handleOrder(scope.row, scope.index)"
          v-if="isHandleBtn(scope.row)"
          >处理</el-button
        >
        <el-button
          type="text"
          @click.stop="datadirClick(scope.row, scope.index)"
          v-if="isDatadir(scope.row)"
          >资料</el-button
        >
      </template>
    </avue-crud>
    <Confirm ref="confirm" />
    <!-- 订单分配弹窗 -->
    <el-dialog
      title="订单分配"
      :visible="distributionShow"
      @close="distributionClose"
    >
      <avue-form
        :option="distributionOption"
        v-model="distributionForm"
        @submit="distributionSubmit"
        ref="distributionForm"
      ></avue-form>
    </el-dialog>

    <!-- 订单处理弹窗 -->
    <el-dialog title="订单处理" :visible="handleShow" @close="handleClose">
      <avue-form
        :option="handleOption"
        v-model="handleForm"
        @submit="handleSubmit"
        ref="handleForm"
      ></avue-form>
    </el-dialog>

    <!-- 资料弹窗 -->
    <el-dialog
      title="订单资料"
      :visible="datadirShow"
      @close="datadirClose"
      v-loading="fileNum"
      element-loading-text="资料上传中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-upload
        class="upload-demo"
        action="/common/orderFile"
        :show-file-list="false"
        :data="uploadData()"
        :on-success="onSuccess"
        multiple
        :accept="orderFileAccept"
        :before-upload="onBeforeUpload"
      >
        <el-button size="small" type="primary">上传资料</el-button>
      </el-upload>
      <avue-crud
        :data="datadirList"
        :option="datadirOption"
        @row-del="datadirRowDel"
        :table-loading="datadirLoading"
      ></avue-crud>
    </el-dialog>
  </div>
</template>

<script>
import { Dic } from "@utils";
import { Page } from "@minxin";
import Confirm from "@components/Confirm";

export default {
  components: {
    Confirm,
  },
  mixins: [Page],
  data() {
    return {
      distributionShow: false,
      search: {},
      tableLoading: false,
      data: [],
      option: {
        title: "订单管理",
        // page: false,
        addBtn: false,
        // menu: false,
        editBtn: false,
        delBtn: false,
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "订单编号",
            prop: "order",
            search: true,
          },
          {
            label: "姓名",
            prop: "name",
            search: true,
          },
          {
            label: "手机号",
            prop: "phone",
            search: true,
          },
          {
            label: "业务",
            prop: "goods",
          },
          {
            label: "数量",
            prop: "num",
          },
          {
            label: "订单状态",
            prop: "status",
            type: "select",
            dicData: Dic.find("DIC015"),
          },
          {
            label: "受理员工",
            prop: "adminName",
          },
          {
            label: "国家",
            prop: "country",
            type: "select",
            dicData: Dic.find("DIC012"),
          },
          {
            label: "下单时间",
            prop: "created_at",
            type: "date",
            format: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false,
          },
        ],
      },
      distributionObj: {
        ACD: ["GM", "DGM", "SUP", "BEA"],
        GM: ["DGM", "SUP", "BEA"],
        DGM: ["SUP", "BEA"],
        SUP: ["BEA"],
      },
      personList: [],
      distributionForm: {
        index: "",
      },
      distributionOption: {
        column: [
          {
            label: "分配员工",
            prop: "index",
            type: "select",
            dicData: [],
            rules: [
              {
                required: true,
                message: "请选择分配员工",
                trigger: "change",
              },
            ],
          },
        ],
      },
      orderId: "", // 订单id

      // 订单处理
      handleShow: false,
      handleOption: {
        column: [],
      },
      handleForm: {
        end_status: "",
        apply: "",
      },

      // 订单资料
      orderNo: null,
      datadirShow: false,
      datadirList: [],
      datadirOption: {
        title: "订单资料",
        columnBtn: false,
        addBtn: false,
        refreshBtn: false,
        editBtn: false,
        delBtn: true,
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "资料名称",
            prop: "fileName",
          },
          {
            label: "资料类型",
            prop: "type",
          },
        ],
      },
      datadirLoading: false,

      fileNum: 0,
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    orderFileAccept() {
      return this.$orderFileAccept;
    },
  },
  created() {
    this.getList();
  },
  // CEO CEO
  // ACD 总监
  // GM 经理
  // DGM 副经理
  // SUP 主管
  // BEA 专员
  methods: {
    // 批量上传订单资料文件
    onBatchSuccess(res) {
      this.fileNum--;
    },
    // 批量上传之前
    onBatchBeforeUpload(file) {
      this.fileNum++;
    },
    // 文件资料上传之前
    onBeforeUpload() {
      this.fileNum++;
    },
    // 文件资料删除
    datadirRowDel(row, index) {
      const { fileName, id } = row;
      this.$refs["confirm"].open({
        message: `是否删除资料《${fileName}》？`,
        ok: async (cb) => {
          const result = await this.$fetchPost(
            `/admin/user/fileDel`,
            { id },
            { allData: true }
          );
          cb();
          if (result.code !== 200) return;
          this.$message.success("订单资料删除成功");
          this.datadirLoading = true;
          const result1 = await this.$fetchPost("/common/orderFilePublic", {
            uuid: this.orderNo,
          });
          this.datadirLoading = false;
          this.datadirList = result1 || [];
        },
      });
    },
    // 文件上传成功
    async onSuccess(res) {
      this.fileNum--;
      if (this.fileNum === 0) {
        this.datadirLoading = true;
        const result1 = await this.$fetchPost("/common/orderFilePublic", {
          uuid: this.orderNo,
        });
        this.datadirLoading = false;
        this.datadirList = result1 || [];
      }
    },
    // 资料上传附加参数
    uploadData() {
      return {
        uuid: this.orderNo,
      };
    },
    // 资料按钮点击
    async datadirClick(row) {
      const { order } = row;
      this.orderNo = order;
      this.datadirShow = true;
      this.datadirLoading = true;
      const result = await this.$fetchPost("/common/orderFilePublic", {
        uuid: order,
      });
      this.datadirLoading = false;
      this.datadirList = result || [];
    },
    datadirClose() {
      this.datadirShow = false;
      this.datadirList.length = 0;
    },
    // 资料按钮权限处理
    isDatadir(row) {
      const { adminId, status } = row;
      const { id } = this.user;
      if (Number(adminId) === Number(id) && status === "done") {
        return true;
      } else {
        return false;
      }
    },
    // 订单处理弹窗关闭
    handleClose() {
      this.handleShow = false;
      this.$refs["handleForm"].resetForm();
    },
    // 订单完成
    async handleSubmit(form, done) {
      const {
        reg_subject,
        reg_time,
        issuing_time,
        effective_time,
        registered_company,
        apply,
        declaration_time,
        renewal_amount,
        material,
        battery_type,
        applicants,
        cases,
        remarks,
      } = form;
      const result = await this.$fetchPost(
        "/admin/order/ups",
        {
          reg_subject,
          reg_time,
          issuing_time,
          effective_time,
          registered_company,
          apply,
          declaration_time,
          renewal_amount,
          material,
          battery_type,
          applicants,
          cases,
          remarks,
          id: this.orderId,
          status: "done",
        },
        { allData: true }
      );
      done();
      if (result.code !== 200) return;
      this.$message.success("订单处理成功");
      this.handleClose();
      this.getList();
    },
    // 获取分页数据
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchPost(
        "/admin/order/lists",
        {
          page: this.page.currentPage,
          limit: this.page.pageSize,
          ...this.search,
        },
        { allData: true }
      );
      this.tableLoading = false;
      this.page.total = result.count || 0;
      this.data = result.data || [];
      cb();
    },
    // 搜索
    async searchChange(params, done) {
      this.search = params;
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 分页
    currentChange() {
      this.getList();
    },
    // 订单分配
    async distributionSubmit(form, done) {
      const { index } = form;
      console.log(this.distributionOption.column[0].dicData[index]);
      const { id, role } = this.personList[index];
      const result = await this.$fetchPost(
        "/admin/order/branch",
        {
          oid: this.orderId,
          adminId: id,
          action: role,
        },
        { allData: true }
      );
      done();
      if (result.code !== 200) return;
      this.$message.success("订单分配成功");
      this.distributionClose();
      this.getList();
    },
    // 分配订单按钮权限
    isSistributionBtn(row) {
      const { role, id } = this.user;
      const { adminId, adminRole, status } = row;
      // 订单已完成
      if (status === "done") return false;
      // 如果是CEO 则只有  查看权限
      if (role === "CEO") return false;
      // 如果是专员 则只有  处理权限
      if (role === "BEA") return false;
      // 其他角色如果订单在自己手里，则有分配权限
      if (Number(id) === Number(adminId)) return true;
      return false;
    },
    // 处理订单按钮权限
    isHandleBtn(row) {
      const { role, id } = this.user;
      const { adminId, adminRole, status } = row;
      // 订单已完成
      if (status === "done") return false;
      // 如果是CEO 则只有  查看权限
      if (role === "CEO") return false;
      // 其他角色如果订单在自己手里，则有处理权限
      if (Number(id) === Number(adminId)) return true;
      return false;
    },
    // 分配订单
    async distributionOrder(row) {
      this.personList.length = 0;
      this.distributionOption.column[0].dicData.length = 0;
      this.orderId = row.id;
      console.log(this.orderId);
      const { role } = this.user;
      console.log(role);
      const result = await this.$fetchPost("/admin/admin/serchLists", {
        role: this.distributionObj[role],
      });
      const Roles = ["GM", "DGM", "SUP", "BEA"];
      const arr = [];
      Roles.forEach((key) => {
        result[key].forEach((item) => {
          arr.push(item);
        });
      });
      this.personList = arr;
      this.distributionOption.column[0].dicData = arr.map((item, index) => {
        return {
          label: `${item.name} - ${Dic.findFilter("DIC001", item.role)}`,
          value: index,
        };
      });
      this.distributionShow = true;
    },
    // 分配订单弹窗关闭
    distributionClose() {
      this.distributionShow = false;
      this.$refs["distributionForm"].resetForm();
    },
    // 处理订单
    handleOrder(row) {
      const { id, goods_type } = row;
      this.orderId = id;
      // 注册主体
      const reg_subject = {
        label: "注册主体",
        prop: "reg_subject",
        rules: [
          {
            required: true,
            message: "输入注册主体",
            trigger: "blur",
          },
        ],
      };
      // 注册时间
      const reg_time = {
        label: "注册时间",
        prop: "reg_time",
        type: "date",
        valueFormat: "yyyyMMdd",
        rules: [
          {
            required: true,
            message: "选择注册时间",
            trigger: "change",
          },
        ],
      };
      // 下证时间
      const issuing_time = {
        label: "下证时间",
        prop: "issuing_time",
        type: "date",
        valueFormat: "yyyyMMdd",
        rules: [
          {
            required: true,
            message: "选择下证时间",
            trigger: "change",
          },
        ],
      };
      // 有效时间
      const effective_time = {
        label: "有效时间",
        prop: "effective_time",
        type: "date",
        valueFormat: "yyyyMMdd",
        rules: [
          {
            required: true,
            message: "选择有效时间",
            trigger: "change",
          },
        ],
      };
      // 注册公司
      const registered_company = {
        label: "注册公司",
        prop: "registered_company",
        rules: [
          {
            required: true,
            message: "输入注册公司",
            trigger: "blur",
          },
        ],
      };
      // 申请主体
      const apply = {
        label: "申请主体",
        prop: "apply",
        rules: [
          {
            required: true,
            message: "输入申请主体",
            trigger: "blur",
          },
        ],
      };
      // 申报次数
      const declaration_time = {
        label: "申报次数",
        prop: "declaration_time",
        type: "number",
        rules: [
          {
            required: true,
            message: "输入申报次数",
            trigger: "blur",
          },
        ],
      };
      // 续费金额
      const renewal_amount = {
        label: "续费金额",
        prop: "renewal_amount",
        type: "number",
        rules: [
          {
            required: true,
            message: "输入续费金额",
            trigger: "blur",
          },
        ],
      };
      // 包装材质
      const material = {
        label: "包装材质",
        prop: "material",
        rules: [
          {
            required: true,
            message: "输入包装材质",
            trigger: "blur",
          },
        ],
      };
      // 电池种类
      const battery_type = {
        label: "电池种类",
        prop: "battery_type",
        rules: [
          {
            required: true,
            message: "输入电池种类",
            trigger: "blur",
          },
        ],
      };
      // 申请人
      const applicants = {
        label: "申请人",
        prop: "applicants",
        rules: [
          {
            required: true,
            message: "输入申请人",
            trigger: "blur",
          },
        ],
      };
      // 案件号
      const cases = {
        label: "案件号",
        prop: "cases",
        rules: [
          {
            required: true,
            message: "输入案件号",
            trigger: "blur",
          },
        ],
      };
      // 备注
      const remarks = {
        label: "备注",
        prop: "remarks",
        type: "textarea",
        span: 24,
        rules: [
          {
            required: true,
            message: "输入备注",
            trigger: "blur",
          },
        ],
      };
      // 商标 brand
      if (goods_type === "brand") {
        this.handleOption.column = [
          reg_subject,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "patent") {
        // 专利 patent
        this.handleOption.column = [
          apply,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "vat") {
        // vat
        this.handleOption.column = [
          registered_company,
          reg_time,
          issuing_time,
          declaration_time,
          renewal_amount,
        ];
      } else if (goods_type === "weee") {
        // weee
        this.handleOption.column = [
          registered_company,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "pppa") {
        // 包装法
        this.handleOption.column = [
          material,
          registered_company,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "battery") {
        // 电池法
        this.handleOption.column = [
          battery_type,
          registered_company,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "audai") {
        // 欧代
        this.handleOption.column = [
          registered_company,
          reg_time,
          issuing_time,
          effective_time,
        ];
      } else if (goods_type === "appeal") {
        // 申诉
        this.handleOption.column = [applicants, cases, remarks];
      } else if (goods_type === "protecting") {
        // 维权
        this.handleOption.column = [applicants, cases, remarks];
      }
      this.handleShow = true;
    },
  },
};
</script>

<style>
</style>