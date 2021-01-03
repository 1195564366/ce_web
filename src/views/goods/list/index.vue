<template>
  <div class="app-container">
    <avue-crud
      :data="data"
      :option="option"
      :table-loading="tableLoading"
      :page.sync="page"
      @row-save="rowSave"
      @row-del="rowDel"
      @row-update="rowUpdate"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @search-change="searchChange"
    >
      <template slot="textForm" slot-scope="scope">
        <avue-ueditor
          v-model="scope.row.text"
          :options="options"
        ></avue-ueditor>
      </template>
    </avue-crud>

    <Confirm ref="confirm" />
  </div>
</template>

<script>
import Confirm from "@components/Confirm";
import { Dic } from "@utils";
import { Page } from "@minxin";

export default {
  components: {
    Confirm,
  },
  mixins: [Page],
  data() {
    return {
      search: {},
      tableLoading: false,
      search: {},
      data: [],
      option: {
        align: "center",
        menuAlign: "center",
        column: [
          {
            label: "id",
            prop: "id",
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "业务名称",
            prop: "name",
            search: true,
            rules: [
              {
                required: true,
                message: "请输入业务名称",
                trigger: "blur",
              },
            ],
          },
          {
            label: "业务分类",
            prop: "tids",
            type: "cascader",
            search: true,
            dicData: [],
            rules: [
              {
                required: true,
                message: "请选择业务分类",
                trigger: "change",
              },
            ],
          },
          {
            label: "业务封面",
            prop: "image",
            type: "upload",
            rules: [
              {
                required: true,
                message: "请上传业务封面",
                trigger: "change",
              },
            ],
            accept: "image/png, image/jpeg",
            listType: "picture-img",
            span: 24,
            propsHttp: {
              home: this.$goodCoverUrl,
              res: "data",
            },
            canvasOption: {
              text: "中德众创",
              ratio: 1,
            },
            tip: "只能上传jpg/png图片，且不超过5M",
            action: "/common/goodsImage",
          },
          {
            label: "排序",
            prop: "sort",
            type: "number",
            rules: [
              {
                required: true,
                message: "请输入业务排序",
                trigger: "blur",
              },
            ],
          },
          {
            label: "虚拟销量",
            prop: "false",
            type: "number",
            rules: [
              {
                required: true,
                message: "请输入虚拟销量",
                trigger: "blur",
              },
            ],
          },
          {
            label: "真实销量",
            prop: "num",
            type: "number",
            rules: [
              {
                required: true,
                message: "请输入真实销量",
                trigger: "blur",
              },
            ],
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "优惠价",
            prop: "discou_price",
            rules: [
              {
                required: true,
                message: "请输入优惠价",
                trigger: "blur",
              },
            ],
            type: "number",
          },
          {
            label: "原价",
            prop: "price",
            rules: [
              {
                required: true,
                message: "请输入原价",
                trigger: "blur",
              },
            ],
            type: "number",
          },
          {
            label: "业务状态",
            prop: "status",
            type: "select",
            rules: [
              {
                required: true,
                message: "请选择业务状态",
                trigger: "change",
              },
            ],
            search: true,
            dicData: Dic.find("DIC003"),
          },
          {
            label: "业务类型",
            prop: "goods_type",
            type: "select",
            rules: [
              {
                required: true,
                message: "请选择业务类型",
                trigger: "change",
              },
            ],
            search: true,
            dicData: Dic.find("DIC016"),
          },
          {
            label: "今日推荐",
            prop: "hot",
            type: "select",
            rules: [
              {
                required: true,
                message: "请选择是否今日推荐",
                trigger: "change",
              },
            ],
            dicData: Dic.find("DIC005"),
          },
          {
            label: "服务周期",
            prop: "cycle",
            type: "select",
            rules: [
              {
                required: true,
                message: "请选择服务周期",
                trigger: "change",
              },
            ],
            dicData: Dic.find("DIC006"),
          },
          {
            label: "创建时间",
            prop: "created_at",
            type: "date",
            format: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: "业务简介",
            prop: "text",
            span: 24,
            hide: true,
            formslot: true,
            rules: [
              {
                required: true,
                message: "请输入业务简介",
                trigger: "change",
              },
            ],
          },
        ],
      },
      options: {
        //普通图片上传
        action: "/common/goodsImage",
        customConfig: {}, //wangEditor编辑的配置
        props: {
          res: "data",
          url: "url",
        },
      },
    };
  },
  mounted() {
    this.getClass();
    this.getList();
  },
  methods: {
    // 获取业务分类
    async getClass() {
      const result = await this.$fetchPost("/admin/type/lists");
      // 取出第一层
      const parent = result
        .filter((item) => !item.pid)
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));
      parent.map((item) => {
        item.children = result
          .filter((resultItem) => resultItem.pid === item.value)
          .map((resultItem) => ({
            value: resultItem.id,
            label: resultItem.name,
          }));
        return item;
      });
      this.option.column[2].dicData = parent;
    },
    // 列表
    async getList(cb = () => {}) {
      this.tableLoading = true;
      const result = await this.$fetchPost(
        "/admin/goods/lists",
        {
          ...this.search,
          page: this.page.currentPage,
          limit: this.page.pageSize,
        },
        { allData: true }
      );
      this.tableLoading = false;
      this.data = (result.data || []).map((item) => {
        item.tids = [item.tpid, item.tid];
        return item;
      });
      this.page.total = result.count;
      cb();
    },
    // 新增
    async rowSave(row, done, loading) {
      const {
        name,
        tids,
        image,
        sort,
        discou_price,
        price,
        text,
        status,
        hot,
        cycle,
        goods_type
      } = row;
      const result = await this.$fetchPost(
        "/admin/goods/add",
        {
          name,
          image,
          sort,
          discou_price,
          price,
          text,
          status,
          hot,
          cycle,
          goods_type,
          false: row.false,
          num: 0,
          tid: tids[1], // 二级Id
          tpid: tids[0], // 一级Id
        },
        { allData: true }
      );
      if (result.code !== 200) return;
      done();
      this.$message.success("业务添加成功");
      this.getList();
    },
    // 删除
    async rowDel(row, index) {
      const { id } = row;
      this.$refs["confirm"].open({
        message: `是否删除业务《${row.name}》？`,
        ok: async (cb) => {
          const result = await this.$fetchPost(
            `/admin/goods/del`,
            { id },
            { allData: true }
          );
          cb();
          if (result.code !== 200) return;
          this.$message.success("业务删除成功");
          this.getList();
        },
      });
    },
    // 修改
    async rowUpdate(row, index, done, loading) {
      const {
        id,
        name,
        tids,
        image,
        sort,
        discou_price,
        price,
        text,
        status,
        hot,
        cycle,
        goods_type
      } = row;
      const result = await this.$fetchPost(
        "/admin/goods/ups",
        {
          id,
          name,
          image,
          sort,
          discou_price,
          price,
          text,
          status,
          hot,
          cycle,
          num: 0,
          goods_type,
          tid: tids[1], // 二级Id
          tpid: tids[0], // 一级Id
        },
        { allData: true }
      );
      if (result.code !== 200) return;
      done();
      this.$message.success("业务修改成功");
      this.getList();
    },
    // 分页
    currentChange() {
      this.getList();
    },
    // 搜索
    async searchChange(params, done) {
      const { name, tids, status } = params;
      this.search = {
        name,
        status,
      };
      tids && (this.search["tid"] = tids[1]);
      this.page.currentPage = 1;
      this.getList(done);
    },
    // 重置
    refreshChange() {
      this.page.currentPage = 1;
      this.getList();
    },
  },
};
</script>

<style>
</style>