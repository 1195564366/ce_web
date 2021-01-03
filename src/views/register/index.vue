<template>
  <div class="register-wrap">
    <img src="~@/assets/loginBg.png" alt="" class="register-bg" />
    <div class="register-form">
      <div class="register-header">
        <div
          class="register-header-item"
          :class="form.type === 'OUDAI' && 'active'"
          @click="typeChange('OUDAI')"
        >
          注册欧代
        </div>
        <div
          class="register-header-item"
          :class="form.type === 'HS' && 'active'"
          @click="typeChange('HS')"
        >
          注册回收
        </div>
      </div>
      <div class="register-main">
        <el-form>
          <el-form-item>
            <el-input placeholder="请输入手机号" v-model="form.phone">
              <template slot="prepend">+86</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              v-model="form.password"
            >
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              placeholder="再次输入确认"
              prefix-icon="el-icon-lock"
              v-model="form.password1"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="register-footer">
        <div class="register-footer-item" @click="register">立即注册</div>
        <div class="register-footer-item" @click="toLogin">使用已有帐号登录</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        type: "OUDAI",
        phone: 13991104074,
        password: 123456,
        password1: 123456
      },
    };
  },
  computed: {
    source () {
      return this.$store.state.user.source
    }
  },
  methods: {
    typeChange(type) {
      this.form.type = type;
    },
    async register() {
      const { type, phone, password } = this.form;
      const result = await this.$fetchPost("/api/register", {
        type,
        phone,
        password,
        source: this.source || 'CE'
      }, { allData: true });
      if (!result.success) return
      this.$message.success('注册成功，请登录');
      this.toLogin();
      console.log(result);
    },
    toLogin () {
      this.$router.push('/login')
    }
  },
};
</script>

<style lang="less" scoped>
.register {
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
      &:first-child {
        margin-right: 80px;
      }
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