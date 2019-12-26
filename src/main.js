/*
 * @Author: Caven
 * @Date: 2019-12-23 13:28:54
 * @Last Modified by: Caven
 * @Last Modified time: 2019-12-26 09:59:43
 */
import Vue from 'vue'
import appLoader from './App.Loader'
;(async () => {
  let loaders = await appLoader.install()
  for (let i = 0; i < loaders.length; i++) {
    let loader = loaders[i].default
    if (!loader || !loader.load) continue
    await loader.load()
  }
  global.Http.get('config/conf.json')
    .then(response => {
      global.config = response.data
      Promise.all([import('@/App.vue'), import('@/router'), import('@/store')]).then(
        ([{ default: App }, { default: router }, { default: store }]) => {
          router.beforeEach((to, from, next) => {
            if (to.path === '/login') {
              next()
            } else {
              let filter = []
              if (store.getters.menuList) {
                filter = store.getters.menuList.filter(item => to.path === item.path)
              }
              if (store.getters.sessionId && store.getters.token && filter.length) {
                next()
              } else {
                next('/login')
              }
            }
          })
          new Vue({
            router,
            store,
            render: h => h(App)
          }).$mount('#app')
        }
      )
    })
    .catch(e => {
      console.log(e)
    })
})()
