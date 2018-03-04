import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'minesweeper-page',
      component: require('@/components/MinesweeperPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
