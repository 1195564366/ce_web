<template>
  <div :class="{ 'has-logo': showLogo }">
    <!-- <logo v-if="showLogo" :collapse="isCollapse" /> -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div class="logo-wrap">
        <img
          src="~@/assets/logo.png"
          alt=""
          class="logo-big"
          v-if="!isCollapse"
        />
        <img src="~@/assets/logo.png" alt="" class="logo-small" v-else />
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
      <div class="user-info" v-if="!isCollapse">
        <div class="user-name">
          VIP：<span>{{ userInfo.name || "-" }}</span>
        </div>
        <div>
          <el-button
            type="primary"
            @click.native="editUserInfo"
            style="width: 100%"
            >设置</el-button
          >
        </div>
        <div style="margin: 10px 0">
          <el-button type="primary" style="width: 100%" @click="pwdShow = true;">重置密码</el-button>
        </div>
        <div>
          <el-button type="danger" @click.native="logout" style="width: 100%"
            >退出</el-button
          >
        </div>
      </div>
    </el-scrollbar>

    <el-dialog
      title="个人资料"
      :visible="userInfoShow"
      @close="userInfoShow = false"
      append-to-body
      width="500px"
    >
      <el-form :model="userInfoForm" :rules="rules" ref="userInfoForm">
        <el-form-item label="手机号" prop="phone">
          <el-input
            placeholder="输入手机号"
            disabled
            v-model="userInfoForm.phone"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input placeholder="输入手机号" v-model="userInfoForm.name" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="userInfoSubmit">修改</el-button>
        <el-button @click="userInfoShow = false">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog title="重置密码" :visible="pwdShow" append-to-body width="500px" @close="pwdFormClose">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdForm">
        <el-form-item label="旧密码" prop="oldPwd">
          <el-input placeholder="输入旧密码" v-model="pwdForm.oldPwd"/>
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input placeholder="输入新密码" v-model="pwdForm.newPwd"/>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="onResetPwd">确定</el-button>
        <el-button @click="pwdFormClose">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.scss";
import { removeToken } from "@/utils/auth";

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(["sidebar"]),
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    routes() {
      const { role } = this.$store.state.user;
      let routes = this.$router.options.routes;
      if (role !== "SA") {
        routes = routes.filter((item) => item.path !== "/person");
      }
      return routes;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return true;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
  },
  data() {
    return {
      pwdForm: {
        oldPwd: null,
        newPwd: null
      },
      pwdRules: {
        oldPwd: [{
          required: true,
          message: "输入旧密码"
        }],
        newPwd: [{
          required: true,
          message: "输入新密码"
        }, {
          max: 12,
          min: 6,
          message: "密码长度为6-12位"
        }]
      },
      pwdShow: false,
      userInfoShow: false,
      userInfoForm: {},
      rules: {
        phone: [
          {
            required: true,
            message: "输入手机号",
          },
        ],
        name: [
          {
            required: true,
            message: "输入姓名",
          },
        ],
      },
    };
  },
  methods: {
    pwdFormClose () {
      this.$refs['pwdForm'].resetFields();
      this.pwdShow = false;
    },
    onResetPwd () {
      this.$refs['pwdForm'].validate(async (valid) => {
        if (!valid) return;
        const { newPwd, oldPwd } = this.pwdForm;
        const result = await this.$fetchPost('/api/user/forgot', {
          newPwd,
          oldPwd
        }, { allData: true });
        if (!result.success) return;
        this.$message.success('密码修改成功');
        this.pwdFormClose();
      })
    },
    // 修改个人资料
    editUserInfo() {
      const { phone, name } = this.$store.state.user.userInfo;
      this.userInfoForm = { phone, name };
      this.userInfoShow = true;
    },
    userInfoSubmit() {
      this.$refs["userInfoForm"].validate(async (valid) => {
        if (!valid) return;
        const result = await this.$fetchPost(
          "/api/user/update",
          this.userInfoForm,
          { allData: true }
        );
        if (!result.success) return;
        this.$message.success("资料修改成功");
        this.userInfoShow = false;
        const userInfo = await this.$fetchGet("/api/user/get");
        this.$store.commit("user/SET_USERINFO", userInfo);
      });
    },
    async logout() {
      this.$confirm("确定退出系统?", "退出", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          this.$store.commit("user/SET_USERINFO", {});
          this.$store.commit("user/SET_TOKEN", null);
          removeToken();
          this.$router.push(`/login?redirect=${this.$route.fullPath}`);
          this.$message({
            type: "success",
            message: "退出成功!",
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="less">
#app .sidebar-container .scrollbar-wrapper {
  position: relative;
}
.logo-wrap {
  text-align: center;
  margin: 10px 0;
}
.logo-big {
  width: 80px;
}
.logo-small {
  width: 50px;
}
.user-info {
  position: absolute;
  font-size: 15px;
  color: #fff;
  bottom: 0px;
  left: 20px;
  .user-name {
    margin-bottom: 20px;
  }
}
</style>
