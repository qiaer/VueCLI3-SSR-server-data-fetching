import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'

import './common/style/common.less'

import VueLazyload from 'vue-lazyload'

// Vue.use(VueLazyload)

// 导出一个工厂函数，用于创建新的
// 应用程序、router 和 store 实例
export function createApp() {
  // 创建 router 实例
  const router = createRouter()
  const store = createStore()

  Vue.use(VueLazyload, {
    preLoad: 1.3,
    error: require('./common/img/bg_load_error.png'), 
    loading: require('./common/img/bg_load_default.png'),
    attempt: 1
})

  sync(store, router)

  const app = new Vue({
    // 注入 router 到根 Vue 实例
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store }
}
