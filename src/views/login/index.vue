<template>
  <div class="login-wrap">
    <img src="~@/assets/loginBg.png" alt="" class="login-bg" />
    <img src="~@/assets/logo.png" alt="" class="logo" />
    <div class="login-form">
      <div class="login-header">
        <div class="login-header-item active">登录</div>
      </div>
      <div class="login-main">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item prop="phone">
            <el-input
              placeholder="请输入手机号"
              prefix-icon="el-icon-user-solid"
              v-model="form.phone"
              type="text"
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
          <el-form-item prop="code">
            <el-input placeholder="输入验证码" v-model="form.code" maxlength="4">
              <span slot="suffix" @click="changeCode">
                <Identify :identifyCode="identifyCode" />
              </span>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="login-btn" @click="login">立即登录</div>
      <div class="login-footer">
        <div class="login-footer-item" @click="toForgot">找回密码</div>
        <div class="login-footer-item" @click="toRegister">注册账号</div>
      </div>
    </div>
  </div>
</template>

<script>
import { setToken } from "@/utils/auth";
import Identify from "../identify";

export default {
  components: {
    Identify,
  },
  data() {
    return {
      identifyCodes: "1234567890",
      identifyCode: "",
      form: {
        phone: "",
        code: null,
        password: "",
      },
      rules: {
        phone: [
          {
            required: true,
            message: "输入手机号",
          },
        ],
        code: [
          {
            required: true,
            message: "输入验证码",
          },
        ],
        password: [
          {
            required: true,
            message: "输入密码",
          },
        ],
      },
    };
  },
  created() {
    let { source } = this.$route.query;
    if (!source) {
      source = "CE";
    }
    console.log(this.$route);
    this.$store.commit("user/SET_SOURCE", source);

    this.changeCode();
  },
  methods: {
    changeCode() {
      this.identifyCode = "";
      this.makeCode(this.identifyCodes, 4);
    },
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    refreshCode() {
      this.identifyCode = "";
      this.makeCode(this.identifyCodes, 4);
    },
    makeCode(o, l) {
      for (let i = 0; i < l; i++) {
        this.identifyCode += this.identifyCodes[
          this.randomNum(0, this.identifyCodes.length)
        ];
      }
      console.log(this.identifyCode);
    },
    async login() {
      this.$refs["form"].validate(async (valid) => {
        if (!valid) return;
        const { phone, password, code } = this.form;
        if (code !== this.identifyCode) {
          this.$message.warning('验证码不正确');
          return
        }
        const result = await this.$fetchPost("/api/login", {
          phone,
          password,
        });
        this.$store.commit("user/SET_USERINFO", result);
        this.$store.commit("user/SET_TOKEN", result.token);
        setToken(result.token);
        console.log(result);
        this.$router.push("/");
        this.$message.success("登录成功");
      });
    },
    toForgot () {
      console.log(123)
      this.$router.push("/forgot");
    },
    toRegister() {
      this.$router.push("/register");
    },
  },
};
</script>

<style lang="less" scoped>
.login {
  &-wrap {
    width: 100vw;
    height: 100vh;
    background: #f6f6f8;
    .logo {
      widows: 100px;
      height: 100px;
      position: fixed;
      top: calc(50% - 360px);
      left: calc(50% - 50px);
    }
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
  &-btn {
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: #318bfa;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
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
      margin-top: 30px;
      &:first-child {
        margin-right: 40px;
      }
    }
  }
}
</style>