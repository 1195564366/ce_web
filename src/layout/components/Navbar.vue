<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />

    <!-- <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <span>{{ userInfo.name || '-' }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="editUserInfo">
            <span style="display: block">个人资料</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div> -->

    <div class="message-wrap" @click="messageShow = true;">
      <el-badge :value="messageNum" style="margin-right: 20px;">
        <i class="el-icon-message-solid" style="font-size: 22px;"></i>
      </el-badge>
    </div>

    <el-dialog
      title="消息中心"
      :visible="messageShow"
      custom-class="message-dialog"
      @close="messageShow = false;"
    >
      <avue-crud :data="messageList" :option="option">
        <template slot="status" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status">通过</el-tag>
          <el-tag type="danger" v-else>驳回</el-tag>
        </template>
        <template slot="isRead" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.isRead">已读</el-tag>
          <el-tag type="danger" v-else>未读</el-tag>
        </template>
        <template slot="menu" slot-scope="scope">
          <el-button size="mini" type="text" @click="onRead(scope.row)" v-if="!scope.row.isRead">已读</el-button>
        </template>
      </avue-crud>
    </el-dialog>
    <el-dialog
      title="个人资料"
      :visible="userInfoShow"
      @close="userInfoShow = false;"
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
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import { removeToken } from "@/utils/auth";
import { Dic } from "@utils";
export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  data() {
    return {
      messageShow: false,
      userInfoShow: false,
      userInfoForm: {},
      messageList: [],
      option: {
        align: "center",
        menuAlign: "center",
        addBtn: false,
        columnBtn: false,
        refreshBtn: false,
        delBtn: false,
        editBtn: false,
        height: 500,
        column: [
          {
            label: "标题",
            prop: "title",
          },
          {
            label: "内容",
            prop: "msg",
          },
          {
            label: "发送时间",
            prop: "createdAt",
            type: "date",
            format: "yyyy-MM-dd HH:mm:ss",
            valueFormat: "yyyy-MM-dd HH:mm:ss",
          },
          {
            label: "状态",
            prop: "status",
            slot: true,
          },
          {
            label: "是否已读",
            prop: "isRead",
            slot: true,
          },
        ],
      },
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
    };
  },
  created() {
    this.getMessageList();
    setInterval(() => {
      this.getMessageList();
    }, 30000);
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "name"]),
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    messageNum() {
      return this.messageList.filter((item) => !item.isRead).length;
    },
  },
  methods: {
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
    // 修改个人资料
    editUserInfo () {
      const { phone, name } = this.$store.state.user.userInfo;
      this.userInfoForm = { phone, name }
      this.userInfoShow = true;
    },
    // 消息已读
    async onRead ({ id }) {
      const result = await this.$fetchGet('/api/message/read', {
        id
      })
      this.getMessageList();
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
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
    async getMessageList() {
      const result = await this.$fetchGet("/api/message");
      this.messageList = result || [];
    },
  },
};
</script>

<style lang="scss">
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }
  .message-wrap {
    cursor: pointer;
    height: 50px;
    line-height: 50px;
    display: inline-block;
    float: right;
    margin-right: 10px;
    margin-top: 5px;
    .el-badge__content.is-fixed {
      top: 10px;
    }
  }
  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.message-dialog {
  .el-dialog__body {
    padding: 0 20px;
  }
}
</style>
