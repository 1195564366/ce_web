<template>
  <div class="login-wrap">
    <img src="~@/assets/loginBg.png" alt="" class="login-bg" />
    <div class="login-form">
      <div class="login-header">
        <div
          class="login-header-item active"
        >
          密码登陆
        </div>
      </div>
      <div class="login-main">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item prop="phone">
            <el-input
              placeholder="请输入手机号"
              prefix-icon="el-icon-user-solid"
              v-model="form.phone"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              v-model="form.password"
              type="password"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="login-footer">
        <div class="login-footer-item" @click="login">立即登陆</div>
        <div class="login-footer-item" @click="toRegister">注册账号</div>
      </div>
    </div>
  </div>
</template>

<script>
import { setToken } from "@/utils/auth";

export default {
  data() {
    return {
      form: {
        phone: '',
        password: ''
      },
      rules: {
        phone: [{
          required: true,
          message: '输入手机号'
        }],
        password: [{
          required: true,
          message: '输入密码'
        }]
      }
    };
  },
  created () {
    let { source } = this.$route.query;
    if (!source) {
      source = 'CE'
    }
    console.log(this.$route)
    this.$store.commit('user/SET_SOURCE', source);
  },
  methods: {
    async login() {
      this.$refs['form'].validate(async valid => {
        if (!valid) return;
        const { phone, password } = this.form;
        const result = await this.$fetchPost("/api/login", {
          phone,
          password,
        });
        this.$store.commit('user/SET_USERINFO', result);
        this.$store.commit('user/SET_TOKEN', result.token);
        setToken(result.token);
        console.log(result);
        this.$router.push('/');
        this.$message.success('登陆成功')
      })
    },
    toRegister () {
      this.$router.push('/register')
    }
  },
};
</script>

<style lang="less" scoped>
.login {
  &-wrap {
    width: 100vw;
    height: 100vh;
    background: #f6f6f8;
  }
  &-bg {
    width: 100vw;
    height: 100vh;
  }
  &-form {
    width: 600px;
    height: 500px;
    background: #ffffff;
    position: fixed;
    top: calc(50% - 250px);
    left: calc(50% - 300px);
    padding: 50px 100px 0;
  }
  &-header {
    display: flex;
    justify-content: center;
    margin-bottom: 50px;
    &-item {
      color: #48484b;
      font-size: 18px;
      padding-bottom: 10px;
      cursor: pointer;
      &.active {
        color: #318bfa;
        font-weight: bold;
        font-size: 18px;
        border-bottom: 4px solid #1890ff;
      }
    }
  }
  &-footer {
    display: flex;
    &-item {
      width: 180px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background: #318bfa;
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
      margin-top: 40px;
      &:first-child {
        margin-right: 40px;
      }
    }
  }
}
</style>