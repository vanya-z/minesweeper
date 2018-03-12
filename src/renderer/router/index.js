import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'game',
      component: require('@/components/Game').default
    },
    {
      path: '/statistics/:gameId',
      name: 'game-statistics',
      component: require('@/components/GameStatistics').default
    },
    {
      path: '/custom',
      name: 'game-custom-form',
      component: require('@/components/GameCustomForm').default
    },
    {
      path: '/winner/game/:gameId/time/:time',
      name: 'game-winner-form',
      component: require('@/components/GameWinnerForm').default,
      props: true
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
