import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';

import AvueUeditor from 'avue-plugin-ueditor';

import axios from 'axios';

import { post, get } from '@/utils/axios'

import otherFileImg from '@/assets/otherFile.jpg';

window.axios = axios;
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */

Vue.prototype.$fetchPost = post;
Vue.prototype.$fetchGet = get;
Vue.prototype.$fileUrl = window.$fileUrl;
Vue.prototype.$accept = ".jpg,.jpeg,.png,.pdf,.JPG,.JPEG,.PDF";
Vue.prototype.$dialogWidth = '500';
Vue.prototype.$tip = '只能上传jpg/png图片、pdf文件，且不超过5M'
Vue.prototype.$onUploadPreview = (file, column, done) => {
  const { url } = file;
  const type = url.split(".")[url.split(".").length - 1];
  if (!["jpg", "jpeg", "png"].includes(type.toLowerCase())) {
    window.open(url);
  } else {
    done();
  }
};
// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// Vue.use(ElementUI)
// 注入Avue
Vue.use(Avue);
// 注入富文本插件
Vue.use(AvueUeditor);
// 如果想要中文版 element-ui，按如下方式声明

Vue.config.productionTip = false

document.addEventListener("error", function (e) {
  const elem = e.target;
  if (elem.tagName.toLowerCase() === "img") {
    elem.src = otherFileImg;
  }
}, true);

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
