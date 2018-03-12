<template>
  <div id="app">
    <router-view :gameSets="gameSets"></router-view>
  </div>
</template>

<script>
  export default {
    name: 'minesweeper',
    data () {
      return {
        gameSets: [
          { id: 1, name: 'Beginner', rows: 9, cols: 9, mines: 10 },
          { id: 2, name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
          { id: 3, name: 'Expert', rows: 16, cols: 30, mines: 99 }
        ]
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('new', (e, gameSetsIndex) => { this.$router.replace({path: '/'}) })
      this.$electron.ipcRenderer.on('custom', e => { this.$router.replace({path: '/custom'}) })
      this.$electron.ipcRenderer.on('statistics', e => { this.$router.replace({path: '/statistics/1'}) })
    }
  }
</script>

<style>
  /* CSS */
</style>
