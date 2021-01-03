import axios from 'axios';
import { Message } from 'element-ui';
import { getToken, removeToken } from '@/utils/auth';
import store from '@/store';
import router from '@/router';

const Service = axios.create({
  // baseURL: '/api', // eslint-disable-line
  headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// 添加请求拦截器
Service.interceptors.request.use((config) => {
  // 在发送请求之前做些什么
  if (store.getters.token) {
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    config.headers['token'] = getToken()
  }
  return config
}, (error) => {
  Message.error('服务异常，请联系管理员');
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
Service.interceptors.response.use((response) => {
  const config = response.config.config
  const data = response.data;
  if (!data.success) {
    if (data.code === 401) {
      removeToken();
      router.push({ path: `/login` })
      Message.error('登录失效，请重新登录');
    } else if (!config.selfTip) {
      Message.error(data.message);
    }
  }
  // 对响应数据做点什么
  return config.allData ? data : data.data;
}, (error) => {
  console.log(error)
  Message.error('服务异常，请联系管理员')
  // 对响应错误做点什么
  return Promise.reject(error);
});


export const post = (url, data = {}, config = {}) => {
  return new Promise(reslove => {
    Service({
      method: 'post',
      data: data,
      url: url,
      config
    }).then((res) => {
      reslove(res)
    })
  })
}

/**
 * 
 * @param {*} url 请求url
 * @param {*} data 请求参数
 * @param {*} config [allData]：是否获取全量数据 [selfTip]：是否自行提示
 */
export const get = (url, data = {}, config = {}) => {
  return new Promise(reslove => {
    Service({
      method: 'get',
      params: data,
      url: url,
      config
    }).then((res) => {
      reslove(res)
    })
  })
}
