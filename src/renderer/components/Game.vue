<template>
  <div id="wrapper" v-if="game.settings" v-cloak>
    <game-info @gameStatus="setGameStatus" @seconds="setSeconds" :game="game"></game-info>
    <game-field @gameStatus="setGameStatus" @flagged="setFlagged" :game="game"></game-field>
  </div>
</template>

<script>
  import GameInfo from './GameInfo'
  import GameField from './GameField'

  export default {
    name: 'game',
    components: { GameInfo, GameField },
    created: function() {
      this.loadGameSettings()
    },
    mounted () {
      this.$electron.ipcRenderer.on('new', (e, gameSetsIndex) => {
        if (gameSetsIndex != undefined && 0 <= gameSetsIndex <= 2) {
          this.$db.remove({type: 'gameSettings'}, { multi: true }, function (err, numRemoved) {})
          this.$db.insert({settings: this.gameSets[gameSetsIndex], type: 'gameSettings'}, function (err, newDoc) {})
          this.game.settings = this.gameSets[gameSetsIndex]
        }
        this.setGameStatus('restarting')
      })
    },
    props: ['gameSets'],
    data () {
      return {
        game: {
          settings: null,
          status: 'starting',
          flagged: 0,
          seconds: 0
        }
      }
    },
    methods: {
      currentWindow () {
        return require('electron').remote.getCurrentWindow()
      },
      resizeWindow () {
        // this.currentWindow().setSize(1000, 600)
        this.currentWindow().setSize(this.game.settings.cols * 22 + 22, this.game.settings.rows * 22 + 75)
        this.currentWindow().center(true)
      },
      loadGameSettings () {
        let that = this
        this.$db.find({type: 'gameSettings'}, function (err, docs) {
          if (docs.length == 0) {
            that.game.settings = that.gameSets[0]
          } else {
            that.game.settings = docs[0].settings
          }
        })
      },
      setGameStatus (status) {
        this.game.status = status
      },
      setFlagged (value) {
        this.game.flagged = value
      },
      setSeconds (value) {
        this.game.seconds = value
      }
    },
    watch: {
      'game.settings': function () {
        this.resizeWindow()
      },
      'game.status': function () {
        if (this.game.settings.id == 4) { return false }
        if (this.game.status != 'win') { return false }
        let that = this
        this.$db.find({type: 'result', gameId: this.game.settings.id}).sort({ time: 1, date: 1 }).limit(10).exec(function (err, docs) {
          if (docs.length < 10 || docs[docs.length - 1].time > that.game.seconds) {
            that.$router.replace({path: '/winner/game/' + that.game.settings.id + '/time/' + that.game.seconds})
          }
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  $col-size: 22px;
  $cover-color: #ccc;
  $bg-color: #f2f2f2;
  $menu-active-color: #247ba0;

  @font-face: {
    font-family: 'Roboto', sans-serif;
    src: url('../assets/fonts/Roboto-Regular.ttf');
  }

  @font-face: {
    font-family: 'Digital-7';
    src: url('../assets/fonts/digital-7.ttf');
  }

  [v-cloak] {
    display: none;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #wrapper {
    font-family: 'Roboto', sans-serif;
    height: 100vh;
    padding: 10px;
    width: 100vw;
    cursor: default;
    -webkit-touch-callout: none; // iOS Safari
      -webkit-user-select: none; // Safari
       -khtml-user-select: none; // Konqueror HTML
         -moz-user-select: none; // Firefox
          -ms-user-select: none; // Internet Explorer/Edge
              user-select: none; // Non-prefixed version, currently supported by Chrome and Opera
  }
</style>
