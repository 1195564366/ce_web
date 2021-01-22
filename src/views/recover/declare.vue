<template>
  <el-dialog title="申报" width="500px" :visible="show" @close="onClose">
    <el-tag type="danger">
      请于本月10日前完成上月的销售数据统计并上传本系统，否则会产生相应罚款，如多次违反我司将立即终止委托关系。
    </el-tag>
    <avue-form
      ref="form"
      v-model="form"
      :option="option"
      @submit="submit"
      @reset-change="resetChange"
    ></avue-form>
  </el-dialog>
</template>

<script>
import { Dic } from "@utils";

export default {
  data() {
    return {
      id: null,
      show: false,
      declareClass: null,
      form: {},
      option: {
        span: 24,
        column: [
          {
            label: "申报分类",
            prop: "declareClass",
            type: "select",
            multiple: true,
            disabled: true,
            dicData: [],
          },
          {
            label: "申报周期",
            prop: "cycle",
            type: "select",
            dicData: Dic.find("DIC014"),
            rules: [
              {
                required: true,
                message: "选择申报周期",
              },
            ],
          },
          {
            label: "申报时间",
            prop: "time",
            display: false,
            rules: [],
          },
          {
            label: "申报单位",
            prop: "unit",
            type: "select",
            dicData: Dic.find("DIC015"),
            rules: [
              {
                required: true,
                message: "选择申报单位",
              },
            ],
          },
          {
            label: "申报数量",
            prop: "number",
            type: "number",
            rules: [
              {
                required: true,
                message: "输入申报数量",
              },
            ],
          },
        ],
      },
    };
  },
  watch: {
    "form.cycle": {
      handler(val) {
        console.log(val);
        const time = this.findObject(this.option.column, "time");
        if (!val) {
          time.display = false;
          time.rules = [];
        } else {
          time.rules = [
            {
              required: true,
              message: "选择申报时间",
            },
          ];
          time.display = true;
          time.type = val;
          time.valueFormat = val === "year" ? "yyyy" : "yyyy-MM";
        }
      },
      immediate: true,
    },
  },
  methods: {
    open({ id, business, declareClass }) {
      this.id = id;
      const declareClassColumn = this.findObject(
        this.option.column,
        "declareClass"
      );
      declareClassColumn.dicData =
        business === "weee" ? Dic.find("DIC016") : Dic.find("DIC017");
      this.form.declareClass = declareClass;
      this.declareClass = declareClass;
      this.show = true;
    },
    onClose() {
      this.$refs['form'].resetForm();
      this.show = false;
      this.id = null;
    },
    async submit(form, done) {
      const { cycle, time, unit, number } = form;
      console.log(cycle, time, unit, number);
      const result = await this.$fetchPost('/api/declare/add', {
        cycle, time, unit, number, bid: this.id
      }, { allData: true });
      done();
      if (!result.success) return
      this.$message.success('提交申报成功');
      this.onClose();
      this.$emit('ok');
      done();
    },
    resetChange() {
      this.form.declareClass = this.declareClass;
    },
  },
};
</script>

<style lang="less">
.el-tag {
  white-space: normal;
  height: auto;
  margin-bottom: 20px;
}
</style>