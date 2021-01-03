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

window.axios = axios;
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// data: 'public/goodsImages/7305d36a05b69c2888db4e12ea0983a5.png'
// data: {
//   url: 'public/goodsImages/7305d36a05b69c2888db4e12ea0983a5.png'
// }

Vue.prototype.$fetchPost = post;
Vue.prototype.$fetchGet = get;
Vue.prototype.$fileUrl = 'http://localhost:7001/public/';
Vue.prototype.$orderFileAccept = ".jpg,.jpeg,.png,.pdf,.JPG,.JPEG,.PDF"
// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// Vue.use(ElementUI)
// 注入Avue
Vue.use(Avue);
// 注入富文本插件
Vue.use(AvueUeditor);
// 如果想要中文版 element-ui，按如下方式声明

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
