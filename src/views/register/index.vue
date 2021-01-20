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
          注册账号
        </div>
        <!-- <div
          class="register-header-item"
          :class="form.type === 'HS' && 'active'"
          @click="typeChange('HS')"
        >
          注册回收
        </div> -->
      </div>
      <div class="register-main">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item prop="phone">
            <el-input placeholder="请输入手机号" v-model="form.phone" maxlength="11">
              <template slot="prepend">+86</template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              type="password"
              v-model="form.password"
              maxlength="12"
            >
            </el-input>
          </el-form-item>
          <el-form-item prop="password1">
            <el-input
              placeholder="再次输入确认"
              prefix-icon="el-icon-lock"
              v-model="form.password1"
              type="password"
              maxlength="12"
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
const phone = phone => {
  const reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
  if (!reg.test(phone)) {
    return false;
  } else {
    return true;
  }
}

export default {
  data() {
    const validatorPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号"));
      }
      if (!phone(value)) {
        callback(new Error("手机号格式不正确"));
      }
      callback();
    };
    const validatorPwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value.length < 6 || value.length > 12) {
        callback(new Error("密码长度应为6-12位"));
      } else {
        if (this.form.password1 !== "") {
          this.$refs["form"].validateField("pwd1");
        }
        callback();
      }
    };
    const validatorPwd1 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      form: {
        type: "OUDAI",
        phone: '',
        password: '',
        password1: ''
      },
      rules: {
        phone: [
          {
            validator: validatorPhone,
            trigger: "change",
          },
        ],
        password: [
          {
            validator: validatorPwd,
            trigger: "change",
          },
        ],
        password1: [
          {
            validator: validatorPwd1,
            trigger: "change",
          },
        ],
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
      this.$refs['form'].validate(async valid => {
        if (!valid) return;
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
      })
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
      // &:first-child {
      //   margin-right: 80px;
      // }
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