<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      @row-del="rowDel"
      @row-update="rowUpdate"
      :page.sync="page"
      :table-loading="tableLoading"
      @search-change="searchChange"
      @row-save="rowSave"
      :permission="getPermission"
    ></avue-crud>
    <Confirm ref="confirm" />
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
      search: {},
      tableLoading: false,
      data: [],
      option: {
        title: "员工管理",
        page: false,
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "姓名",
            prop: "name",
            search: true,
            rules: [
              {
                required: true,
                message: "请输入姓名",
                trigger: "blur",
              },
            ],
          },
          {
            label: "手机号",
            prop: "phone",
            search: true,
            editDisabled: true,
            rules: [
              {
                required: true,
                message: "请输入手机号",
                trigger: "blur",
              },
            ],
          },
          {
            label: "职位",
            prop: "roleLabel",
            type: "select",
            dicData: [
              ...[
                {
                  label: "超级管理员",
                  value: "SA",
                },
              ],
              ...Dic.find("DIC001"),
            ],
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "职位",
            prop: "role",
            type: "select",
            search: true,
            hide: true,
            dicData: Dic.find("DIC001"),
            rules: [
              {
                required: true,
                message: "请选择职位",
                trigger: "change",
              },
            ],
          },
          {
            label: "上级领导",
            prop: "pid",
            type: "select",
            dicData: [],
            rules: [
              {
                required: true,
                message: "请选择上级领导",
                trigger: "change",
              },
            ],
          },
          {
            label: "密码",
            prop: "pwd",
            hide: true,
            rules: [
              {
                required: true,
                message: "请输入密码",
                trigger: "blur",
              },
            ],
          },
          {
            label: "状态",
            prop: "status",
            type: "select",
            search: true,
            dicData: Dic.find("DIC002"),
            rules: [
              {
                required: true,
                message: "请选择状态",
                trigger: "change",
              },
            ],
          },
          {
            label: "QQ",
            prop: "qq",
            rules: [
              {
                required: true,
                message: "请输入QQ",
                trigger: "blur",
              },
            ],
          },
          {
            label: "邮箱",
            prop: "email",
            rules: [
              {
                required: true,
                message: "请输入邮箱",
                trigger: "blur",
              },
            ],
          },
          {
            label: "固定电话",
            prop: "fixed_phone",
            rules: [
              {
                required: true,
                message: "请输入固定电话",
                trigger: "blur",
              },
            ],
          },
          {
            label: "创建时间",
            prop: "created_at",
            type: "date",
            format: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false,
          },
        ],
      },
    };
  },
  created() {
    this.getListNoPage();
    this.getList();
  },
  methods: {
    // 获取全部员工数据
    async getListNoPage() {
      const result = await this.$fetchPost("/admin/admin/lists");
      this.option.column[4].dicData = [
        ...[
          {
            value: 0,
            label: "无",
          },
        ],
        ...result
          .filter((item) => item.role !== "SA")
          .map((item) => ({
            value: item.id,
            label: `${item.name}-(${Dic.findFilter("DIC001", item.role)})`,
          })),
      ];
    },
    // 获取分页数据
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchPost(
        "/admin/admin/serch",
        {
          page: this.page.currentPage,
          limit: this.page.pageSize,
          ...this.search,
        },
        { allData: true }
      );
      this.tableLoading = false;
      this.page.total = result.count || 0;
      this.data = (result.data || []).map((item) => {
        item.roleLabel = item.role;
        return item;
      });
      cb();
    },
    // 权限
    getPermission(key, row, index) {
      if (!row) return true;
      return row.role !== "SA";
    },
    // 删除
    rowDel(row, index) {
      const { id } = row;
      this.$refs["confirm"].open({
        message: `是否删除员工《${row.name}》？`,
        ok: async (cb) => {
          const result = await this.$fetchPost(
            `/admin/admin/del`,
            { id },
            { allData: true }
          );
          cb();
          if (result.code !== 200) return;
          this.$message.success("员工删除成功");
          this.getListNoPage();
          this.getList();
        },
      });
    },
    // 搜索
    async searchChange(params, done) {
      this.search = params;
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 添加
    async rowSave(row, done, loading) {
      const {
        name,
        phone,
        role,
        pid,
        pwd,
        status,
        qq,
        email,
        fixed_phone,
      } = row;
      const result = await this.$fetchPost(
        "/admin/admin/add",
        {
          name,
          phone,
          role,
          pid,
          pwd,
          status,
          qq,
          email,
          fixed_phone,
        },
        { allData: true }
      );
      if (result.code !== 200) {
        return;
      }
      this.$message.success("员工添加成功");
      done();
      this.page.currentPage = 1;
      this.getListNoPage();
      this.getList();
    },
    // 编辑
    async rowUpdate (row, index, done, loading) {
      const {
        id,
        name,
        role,
        pid,
        pwd,
        status,
        qq,
        email,
        fixed_phone,
      } = row;
      const result = await this.$fetchPost(
        "/admin/admin/ups",
        {
          id,
          name,
          role,
          pid,
          pwd,
          status,
          qq,
          email,
          fixed_phone,
        },
        { allData: true }
      );
      if (result.code !== 200) {
        return;
      }
      this.$message.success("员工编辑成功");
      done();
      // this.page.currentPage = 1;
      this.getListNoPage();
      this.getList();
    }
  },
};
</script>

<style>
</style>