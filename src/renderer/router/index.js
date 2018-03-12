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
      name: 'statistics',
      component: require('@/components/Statistics').default
    },
    {
      path: '/custom',
      name: 'form-custom-game',
      component: require('@/components/FormCustomGame').default
    },
    {
      path: '/winner/game/:gameId/time/:time',
      name: 'form-winner',
      component: require('@/components/FormWinner').default,
      props: true
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
