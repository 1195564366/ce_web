<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :page.sync="page"
      :table-loading="tableLoading"
      :option="option"
      @row-save="rowSave"
      @row-del="rowDel"
      @row-update="rowUpdate"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @search-change="searchChange"
    ></avue-crud>
    <Confirm ref="confirm" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from '@minxin';

export default {
  components: {
    Confirm,
  },
  mixins: [Page],
  data() {
    return {
      tableLoading: false,
      search: {},
      data: [],
      option: {
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "分类名称",
            prop: "name",
            search: true,
            rules: [
              {
                required: true,
                message: "请输入分类名称",
                trigger: "blur",
              },
            ],
          },
          {
            label: "上级分类",
            prop: "pName",
            addDisplay: false,
            editDisplay: false,
            dicData: []
          },
          {
            label: "上级分类",
            prop: "pid",
            type: "select",
            hide: true,
            dicData: [],
            rules: [
              {
                required: true,
                message: "请选择上级分类",
                trigger: "change",
              },
            ],
            dicData: []
          },
          {
            label: "状态",
            prop: "status",
            search: true,
            type: "select",
            dicData: Dic.find("DIC004"),
            rules: [
              {
                required: true,
                message: "请选择状态",
                trigger: "change",
              },
            ],
          },
          {
            label: "排序",
            prop: "sort",
            type: "number",
            rules: [
              {
                required: true,
                message: "请输入排序",
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
    this.getList();
    this.getListNoPage();
  },
  methods: {
    // 查询所有
    async getListNoPage() {
      const result = await this.$fetchPost("/admin/type/lists");
      const data = (result || []).filter(item => !item.pid).map(item => ({
        label: item.name,
        value: item.id
      }));
      this.option.column[2].dicData = this.option.column[1].dicData = [...[{
        label: '无',
        value: 0
      }], ...data]
    },
    // 查询
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchPost("/admin/type/listsPage", {
        page: this.page.currentPage,
        limit: this.page.pageSize,
        ...this.search
      }, { allData: true });
      this.tableLoading = false;
      this.page.total = result.count || 0;
      this.data = (result.data || []).map(item => {
        item.pName = item.pid
        return item
      });
      cb();
    },
    // 添加
    async rowSave(row, done, loading) {
      const { name, pid, status, sort } = row;
      const result = await this.$fetchPost(
        "/admin/type/add",
        {
          name,
          pid,
          status,
          sort,
        },
        { allData: true }
      );
      if (result.code !== 200) {
        return;
      }
      this.$message.success("分类添加成功");
      done();
      this.page.currentPage = 1;
      this.getList();
      this.getListNoPage();
    },
    // 删除
    rowDel(row, index) {
      const { id } = row;
      this.$refs["confirm"].open({
        message: `是否删除分类《${row.name}》？`,
        ok: async (cb) => {
          const result = await this.$fetchPost(
            `/admin/type/del`,
            { id },
            { allData: true }
          );
          cb();
          if (result.code !== 200) return;
          this.$message.success("分类删除成功");
          this.getList();
          this.getListNoPage();
        },
      });
    },
    // 修改
    async rowUpdate(row, index, done, loading) {
      const { id, name, status, sort, pid } = row;
      const result = await this.$fetchPost("/admin/type/ups", {
        id, name, status, sort, pid
      }, {
        allData: true
      });
      if (result.code !== 200) return
      done();
      this.$message.success('分类修改成功')
      this.getList();
      this.getListNoPage();
    },
    // 分页
    currentChange () {
      this.getList();
    },
    // 搜索
    async searchChange (params,done) {
      this.search = params;
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 重置
    refreshChange () {
      this.page.currentPage = 1;
      this.getList();
    }
  },
};
</script>

<style>
</style>