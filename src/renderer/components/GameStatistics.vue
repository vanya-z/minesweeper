<template>
  <div class="wrapper">
    <div class="top-results-box">
      <h1>Top 10</h1>
      <div class="mt-5">
        <a v-for="game in gameSets" @click="resultTab=game.id" :class="{active: resultTab==game.id}">{{game.name}}</a>
      </div>
      <div class="top-results-list" v-for="(gameScores, gameId) in scores" v-if="resultTab == gameId">
        <div class="top-results-line" v-for="(val, index) in gameScores">
          <span class="name">{{index + 1}}. {{val.name}}</span>
          <span class="time">{{val.time}}s.</span>
        </div>
        <div class="top-results-line text-center" v-if="!gameScores.length">No results</div>
      </div>
      <router-link to="/" replace>Close</router-link>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'game-statistics',
    props: ['gameSets'],
    created () {
      require('electron').remote.getCurrentWindow().setSize(400, 400)
      require('electron').remote.getCurrentWindow().center(true)
      this.loadAllResults()
    },
    data () {
      return {
        scores: null,
        resultTab: this.$route.params.gameId || 1
      }
    },
    methods: {
      loadAllResults () {
        for (let game of this.gameSets) { this.loadResults(game.id) }
      },
      loadResults (gameId) {
        let that = this
        that.scores = that.scores || {}
        that.$db.find({type: "result", gameId: gameId}).sort({ time: 1, date: 1 }).limit(10).exec(function (err, docs) {
          that.scores[gameId] = docs
          that.$forceUpdate()
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

  .wrapper {
    text-align: center;
    cursor: default;
  }

  .top-results-box {
    font-family: 'Roboto', sans-serif;
    display: inline-block;
    width: 200px;
    margin: 0 auto;

    h1 {
      font-size: 20px;
    }

    .top-results-list {
      margin: 10px 0;
    }

    .top-results-line {
      font-size: 14px;
      text-align: left;
      border-bottom: 1px dotted $cover-color;
    }

    .time { float: right }

    a {
      color: $menu-active-color;
      font-size: 14px;
      padding: 5px;
      margin-top: 10px;
      text-decoration: none;
      cursor: default;
      &.active {
        color: $menu-active-color;
        text-decoration: underline;
      }
    }

    .mt-5 { margin-top: 5px; }
    .text-center { text-align: center; }
  }
</style>
