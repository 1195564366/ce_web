import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true
  },

  {
    path: '/forgot',
    component: () => import('@/views/forgot/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'home',
      component: () => import('@/views/home'),
      meta: { title: '首页', icon: 'home' }
    }]
  },

  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/shop'),
      meta: { title: '我的店铺', icon: 'shop' }
    }]
  },

  {
    path: '/product',
    component: Layout,
    redirect: '/product/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/product'),
      meta: { title: '我的产品', icon: 'product' }
    }]
  },

  {
    path: '/sendGoods',
    component: Layout,
    redirect: '/sendGoods/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/sendGoods'),
      meta: { title: '我的发货', icon: 'sendGoods' }
    }]
  },

  {
    path: '/bill',
    component: Layout,
    redirect: '/bill/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/bill'),
      meta: { title: '我的账单', icon: 'bill' }
    }]
  },

  {
    path: '/recover',
    component: Layout,
    redirect: '/recover/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/recover'),
      meta: { title: '我的回收', icon: 'recover' }
    }]
  },


  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
