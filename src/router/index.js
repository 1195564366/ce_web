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
      meta: { title: '店铺管理', icon: 'analysis' }
    }]
  },

  {
    path: '/member',
    component: Layout,
    redirect: '/member/manage',
    children: [{
      path: 'manage',
      name: 'manage',
      component: () => import('@/views/member/manage'),
      meta: { title: '产品管理', icon: 'member' }
    }]
  },

  {
    path: '/order',
    component: Layout,
    redirect: '/order/index',
    children: [{
      path: 'index',
      name: 'index',
      component: () => import('@/views/order/index'),
      meta: { title: '账单管理', icon: 'order' }
    }]
  },

  {
    path: '/person',
    component: Layout,
    redirect: '/person/manage',
    children: [{
      path: 'manage',
      name: 'manage',
      component: () => import('@/views/person/manage'),
      meta: { title: '发货记录', icon: 'home' }
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
