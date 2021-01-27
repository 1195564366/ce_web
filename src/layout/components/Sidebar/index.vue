<template>
  <div :class="{'has-logo':showLogo}">
    <!-- <logo v-if="showLogo" :collapse="isCollapse" /> -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div class="logo-wrap">
      <img src="~@/assets/logo.png" alt="" class="logo-big" v-if="!isCollapse">
      <img src="~@/assets/logo.png" alt="" class="logo-small" v-else>
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
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
      <div class="user-info" v-if="!isCollapse">
        <div class="user-name">
          VIP：<span>{{ userInfo.name || '-' }}</span>
        </div>
        <el-button type="primary" @click.native="editUserInfo">设置</el-button>
        <el-button type="danger" @click.native="logout">退出</el-button>
      </div>
    </el-scrollbar>

    <el-dialog
      title="个人资料"
      :visible="userInfoShow"
      @close="userInfoShow = false;"
      append-to-body
      width="500px"
    >
      <el-form :model="userInfoForm" :rules="rules" ref="userInfoForm">
        <el-form-item label="手机号" prop="phone">
          <el-input placeholder="输入手机号" disabled v-model="userInfoForm.phone"/>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input placeholder="输入手机号" v-model="userInfoForm.name"/>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="userInfoSubmit">修改</el-button>
        <el-button @click="userInfoShow = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { removeToken } from "@/utils/auth";

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    routes() {
      const { role } = this.$store.state.user;
      let routes = this.$router.options.routes;
      if (role !== 'SA') {
        routes = routes.filter(item => item.path !== '/person')
      }
      return routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return true
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  data () {
    return {
      userInfoShow: false,
      userInfoForm: {},
      rules: {
        phone: [{
          required: true,
          message: "输入手机号"
        }],
        name: [{
          required: true,
          message: "输入姓名"
        }]
      }
    }
  },
  methods: {
    // 修改个人资料
    editUserInfo () {
      const { phone, name } = this.$store.state.user.userInfo;
      this.userInfoForm = { phone, name }
      this.userInfoShow = true;
    },
    userInfoSubmit () {
      this.$refs['userInfoForm'].validate(async valid => {
        if (!valid) return
        const result = await this.$fetchPost('/api/user/update', this.userInfoForm, { allData: true });
        if (!result.success) return;
        this.$message.success('资料修改成功');
        this.userInfoShow = false;
        const userInfo = await this.$fetchGet('/api/user/get');
        this.$store.commit('user/SET_USERINFO', userInfo);
      })
    },
    async logout() {
      this.$confirm("确定退出系统?", "退出", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          this.$store.commit('user/SET_USERINFO', {});
          this.$store.commit('user/SET_TOKEN', null);
          removeToken();
          this.$router.push(`/login?redirect=${this.$route.fullPath}`);
          this.$message({
            type: "success",
            message: "退出成功!",
          });
        })
        .catch(() => {});
    },
  }
}
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
