<template>
  <div class="custom-game-form">
    <h1>Custom game</h1>
    <form>
      <div class="form-group">
        <label for="rows">Height:</label>
        <input id="rows" type="number" name="rows" v-model="customGame.rows" :min="minCustomRows" :max="maxCustomRows">
      </div>
      <div class="form-group">
        <label for="cols">Width:</label>
        <input id="cols" type="number" name="cols" v-model="customGame.cols" :min="minCustomCols" :max="maxCustomCols">
      </div>
      <div class="form-group">
        <label for="mines">Mines:</label>
        <input id="mines" type="number" name="mines" v-model="customGame.mines" min="0">
      </div>
      <div class="form-group">
        <button @click.prevent="newCustomGame(customGame)">OK</button>
        <router-link to="/" replace>Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'form-custom-game',
    props: [
      'game'
    ],
    mounted () {
      this.loadCustomGameSettings()
    },
    data () {
      return {
        customGame: {
          id: 4,
          name: "Custom...",
          rows: 30,
          cols: 16,
          mines: 99
        },
        minCustomRows: 8,
        minCustomCols: 8,
        maxCustomRows: 30,
        maxCustomCols: 30,
      }
    },
    methods: {
      newCustomGame (game) {
        game.rows = +game.rows <= this.maxCustomRows ? +game.rows : this.maxCustomRows
        game.rows = +game.rows >= this.minCustomRows ? +game.rows : this.minCustomRows
        game.cols = +game.cols <= this.maxCustomCols ? +game.cols : this.maxCustomCols
        game.cols = +game.cols >= this.minCustomCols ? +game.cols : this.minCustomCols

        let maxCustomMines = game.rows * game.cols - 1
        game.mines = +game.mines <= maxCustomMines ? +game.mines : maxCustomMines
        game.mines = +game.mines >= 0 ? +game.mines : 0

        this.setCustomGameSettings(game)
      },
      loadCustomGameSettings () {
        let that = this
        this.$db.find({type: 'customGameSettings'}, function (err, docs) {
          if (docs.length > 0) { that.customGame = docs[0].game }
        })
      },
      setCustomGameSettings (game) {
        let that = this
        this.$db.remove({type: 'customGameSettings'}, { multi: true }, function (err, numRemoved) {})
        this.$db.insert({game: game, type: 'customGameSettings'}, function (err, newDoc) {})
        this.$db.remove({type: 'gameSettings'}, { multi: true }, function (err, numRemoved) {})
        this.$db.insert({settings: game, type: 'gameSettings'}, function (err, newDoc) {
          that.$router.replace({path: '/'})
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

  .custom-game-form {
    font-family: 'Roboto', sans-serif;
    text-align: center;
    cursor: default;

    h1 {
      font-size: 20px;
    }

    .form-group {
      margin-top: 10px;
    }

    label, input {
      display: inline-block;
      width: 80px;
      font-size: 12px;
      text-align: left;
    }

    input { padding: 3px 5px; }

    button, a { padding: 5px 10px; }

    a {
      color: $menu-active-color;
      font-size: 14px;
      text-decoration: none;
      cursor: default;
    }
  }

</style>
