<template>
  <div id="wrapper">
    <div class="overlay-box" v-if="showCustomForm || showWinnerForm || showTopResults">
      <form v-if="showCustomForm">
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
          <button @click.prevent="newCustomGame(customGame);showCustomForm=false">OK</button>
          <button @click.prevent="showCustomForm=false">Cancel</button>
        </div>
      </form>
      <form v-if="showWinnerForm">
        <h1>You are in top 10!</h1>
        <div class="form-group">
          <label for="name">Your name:</label>
          <input id="name" type="text" name="name" v-model="name">
          <button @click.prevent="saveResult();showWinnerForm=false">OK</button>
        </div>
      </form>
      <div class="top-results-box" v-if="showTopResults">
        <h1>Top 10</h1>
        <div class="mt-5">
          <a v-for="game in games" @click="resultTab=game.id" :class="{active: resultTab==game.id}">{{game.name}}</a>
        </div>
        <div class="mt-5" v-for="(gameScores, gameId) in scores" v-if="resultTab == gameId">
          <div class="top-results-line" v-for="(val, index) in gameScores">
            <span class="name">{{index + 1}}. {{val.name}}</span>
            <span class="time">{{val.time}}s.</span>
          </div>
          <div class="top-results-line text-center" v-if="!gameScores.length">No results</div>
        </div>
        <button class="mt-5" @click.prevent="showTopResults=false">Close</button>
      </div>
    </div>
    <div class="menu">
      <a @click="showSubmenu = !showSubmenu" :class="{active: showSubmenu}">Game</a>
    </div>
    <div v-if="showSubmenu" class="submenu">
      <a @click="newGame(currentGame);showSubmenu=false">New</a>
      <hr>
      <a v-for="game in games" @click="newGame(game);showSubmenu=false">
        {{game.name}}
        <font-awesome-icon v-if="currentGame.id == game.id" :icon="['fas', 'check']"/>
      </a>
      <a @click="showCustomForm=true;showSubmenu=false">
        {{customGame.name}}
        <font-awesome-icon v-if="currentGame.id == customGame.id" :icon="['fas', 'check']"/>
      </a>
      <hr>
      <a @click="showTopResults=true;showSubmenu=false">TOP Results</a>
      <hr>
      <a @click="toggleMarkable();showSubmenu=false">
        Marks(?)
        <font-awesome-icon v-if="markable" :icon="['fas', 'check']"/>
      </a>
      <!-- <a @click="clearAllResults();showSubmenu=false">Clear DB</a> -->
      <!-- <a @click="loadAllResults();showSubmenu=false">loadAllResults</a> -->
    </div>
    <div class="info" @click="showSubmenu = false">
      <span class="mines">{{numMinesLeft}}</span>
      <a class="smile" @click="newGame(currentGame)" :class="smile"></a>
      <span class="timer">{{seconds}}</span>
    </div>
    <div class="game-field" @click="showSubmenu = false">
      <div class="row" v-for="(row, row_index) in gameField">
        <span class="col" v-for="(col, col_index) in row" @click.left="openCol(row_index, col_index)" @click.right="markCol(row_index, col_index)" @click.middle="middle(row_index, col_index)" @mousedown.left="activeColIndex = stringifyIndex(row_index, col_index)" @mouseup="activeColIndex = null" :class="[openedColClass(col), closedColClass(col), { open: col.isOpened, active: isActiveCol(row_index, col_index, col) }]"></span>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

  export default {
    name: 'landing-page',
    components: { FontAwesomeIcon },
    mounted: function(){
      this.loadAllResults()
    },
    data () {
      return {
        games: [
          { id: 1, name: 'Beginner', rows: 9, cols: 9, mines: 10 },
          { id: 2, name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
          { id: 3, name: 'Expert', rows: 16, cols: 30, mines: 99 }
        ],
        currentGame: this.loadGameSettings(),
        customGame: this.loadCustomGameSettings(),
        markable: this.loadMarksSettings(),
        scores: null,
        name: null,
        timer: null,
        resultTab: 1,
        seconds: 0,
        maxSecondsVal: 999,
        minesAreSet: false,
        gameField: [],
        showSubmenu: false,
        smile: 'normal',
        gameIsFinished: false,
        showCustomForm: false,
        showWinnerForm: false,
        showTopResults: false,
        minCustomRows: 8,
        minCustomCols: 8,
        maxCustomRows: 30,
        maxCustomCols: 30,
        activeColIndex: null
      }
    },
    methods: {
      newGame (game) {
        this.currentGame = game
        this.setGameSettings(game)
        this.initField(game.rows, game.cols)
        this.stopTimer()
        this.seconds = 0
        this.smile = 'normal'
        this.minesAreSet = false
        this.gameIsFinished = false
      },
      newCustomGame (game) {
        game.rows = game.rows <= this.maxCustomRows ? game.rows : this.maxCustomRows
        game.rows = game.rows >= this.minCustomRows ? game.rows : this.minCustomRows
        game.cols = game.cols <= this.maxCustomCols ? game.cols : this.maxCustomCols
        game.cols = game.cols >= this.minCustomCols ? game.cols : this.minCustomCols

        let maxCustomMines = game.rows * game.cols - 1
        game.mines = game.mines <= maxCustomMines ? game.mines : maxCustomMines
        game.mines = game.mines >= 0 ? game.mines : 0

        this.customGame = game
        this.setCustomGameSettings(this.customGame)
        this.newGame(game)
      },
      initField (numRows, numCols) {
        // this.currentWindow().setSize(1000, 600)
        this.currentWindow().setSize(numCols * 22 + 22, numRows * 22 + 100)
        this.currentWindow().center(true)
        let field = []
        for(let i = 0; i < numRows; i++) {
          field[i] = []
          for(let j = 0; j< numCols; j++) {
            field[i][j] = {isOpened: false, value: null, cover: 0}
          }
        }
        this.gameField = field
      },
      setMines (except) {
        let usedFields = []
        for(let i = 0; i < this.currentGame.mines; i++) {
          let rowIndex = this.rand(this.currentGame.rows)
          let colIndex = this.rand(this.currentGame.cols)
          while (JSON.stringify(usedFields).indexOf(JSON.stringify([rowIndex, colIndex])) != -1 || JSON.stringify([rowIndex, colIndex]) == JSON.stringify(except)) {
            rowIndex = this.rand(this.currentGame.rows)
            colIndex = this.rand(this.currentGame.cols)
          }
          usedFields.push([rowIndex, colIndex])
        }
        for (let item of usedFields) {
          this.gameField[item[0]][item[1]].value = 'mine'
        }
        this.minesAreSet = true
        this.setColValues()
        this.startTimer()
      },
      setColValues () {
        this.gameField.forEach((row, row_index) => {
          row.forEach((col, col_index) => {
            if (col.value == 'mine') { return }
            col.value = this.calculateMinesCountAroundCol(row_index, col_index)
          })
        })
      },
      calculateMinesCountAroundCol (row_index, col_index) {
        let count = 0
        for (let i = row_index - 1; i <= row_index + 1; i++) {
          if (i >= 0 && i < this.currentGame.rows) {
            for (let j = col_index - 1; j <= col_index + 1; j++) {
              if (j >= 0 && j < this.currentGame.cols && this.gameField[i][j].value == 'mine') { count++ }
            }
          }
        }
        return count
      },
      startTimer () {
        let self = this
        this.seconds++
        this.timer = setTimeout(self.startTimer, 1000)
        if (this.seconds >= this.maxSecondsVal) { this.stopTimer() }
      },
      stopTimer () {
        if (this.timer) { clearTimeout(this.timer) }
      },
      rand (max) {
        return Math.floor(Math.random() * max)
      },
      openCol (rowIndex, colIndex) {
        let col = this.gameField[rowIndex][colIndex]
        if (col.isOpened || this.gameIsFinished || col.cover % this.numCover() == 1) { return }
        // if (col.isOpened == false && !this.gameIsFinished && col.cover % this.numCover() != 1) {
        col.cover = 0
        if (!this.minesAreSet) { this.setMines([rowIndex, colIndex]) }
        col.isOpened = true

        if (col.value == 'mine') {
          col.value = 'error'
          this.stopGame()
        }
        this.checkGamePlay()

        if (col.value == 0) {
          this.openColsAround(rowIndex, colIndex)
        }
        // }
      },
      stopGame () {
        this.stopTimer()
        this.smile = 'lost'
        this.gameIsFinished = true
        this.openMines()
      },
      openMines () {
        for (let i = 0; i < this.currentGame.rows; i++) {
          for (let j = 0; j < this.currentGame.cols; j++) {
            if (this.gameField[i][j].value == 'mine') { this.gameField[i][j].isOpened = true }
          }
        }
      },
      openFlags () {
        for (let i = 0; i < this.currentGame.rows; i++) {
          for (let j = 0; j < this.currentGame.cols; j++) {
            if (this.gameField[i][j].value == 'mine') { this.gameField[i][j].cover = 1 }
          }
        }
      },
      markCol (rowIndex, colIndex) {
        let col = this.gameField[rowIndex][colIndex]
        if (!this.gameIsFinished && !col.isOpened) { col.cover++ }
      },
      middle (rowIndex, colIndex) {
        let col = this.gameField[rowIndex][colIndex]
        if (col.isOpened && col.value == this.countFlagsAround(rowIndex, colIndex)) {
          this.openColsAround(rowIndex, colIndex)
        }
      },
      openColsAround (rowIndex, colIndex) {
        for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
          if (i >= 0 && i < this.currentGame.rows) {
            for (let j = colIndex - 1; j <= colIndex + 1; j++) {
              if (j >= 0 && j < this.currentGame.cols && !(i == rowIndex && j == colIndex) && this.gameField[i][j].cover % this.numCover() == 0) { this.openCol(i, j) }
            }
          }
        }
      },
      setGameSettings (game) {
        this.$db.remove({type: 'gameSettings'}, { multi: true }, function (err, numRemoved) {})
        this.$db.insert({game: game, type: 'gameSettings'}, function (err, newDoc) {})
      },
      loadGameSettings () {
        let that = this
        this.$db.find({type: 'gameSettings'}, function (err, docs) {
          if (docs.length == 0) {
            that.currentGame = that.games[0]
            that.setGameSettings(that.currentGame)
          } else {
            that.currentGame = docs[0].game
          }
          that.initField(that.currentGame.rows, that.currentGame.cols)
        })
      },
      setCustomGameSettings (game) {
        this.$db.remove({type: 'customGameSettings'}, { multi: true }, function (err, numRemoved) {})
        this.$db.insert({game: game, type: 'customGameSettings'}, function (err, newDoc) {})
      },
      loadCustomGameSettings () {
        let that = this
        this.$db.find({type: 'customGameSettings'}, function (err, docs) {
          if (docs.length == 0) {
            that.customGame = {
              id: 4,
              name: 'Custom...',
              rows: that.games[0].rows,
              cols: that.games[0].cols,
              mines: that.games[0].mines
            }
            that.setCustomGameSettings(that.customGame)
          } else {
            that.customGame = docs[0].game
          }
        })
      },
      setMarksSettings (value) {
        this.$db.remove({type: 'marksSettings'}, { multi: true }, function (err, numRemoved) {})
        this.$db.insert({markable: value, type: 'marksSettings'}, function (err, newDoc) {})
      },
      loadMarksSettings () {
        let that = this
        this.$db.find({type: 'marksSettings'}, function (err, docs) {
          if (docs.length == 0) {
            that.setMarksSettings(true)
            that.markable = true
          } else {
            that.markable = docs[0].markable
          }
        })
      },
      loadAllResults () {
        for (let game of this.games) { this.loadResults(game.id) }
      },
      loadResults (gameId) {
        let that = this
        that.scores = that.scores || {}
        that.$db.find({type: "result", gameId: gameId}).sort({ time: 1, date: 1 }).limit(10).exec(function (err, docs) {
          that.scores[gameId] = docs
        })
      },
      saveResult () {
        let that = this
        let result = { type: 'result', gameId: this.currentGame.id, name: this.name || "unknown", time: this.seconds, date: new Date() }
        this.$db.insert(result, function (err, newDoc) {
          that.loadResults(newDoc.gameId)
        })
      },
      clearAllResults () {
        let that = this
        this.$db.remove({}, { multi: true }, function (err, numRemoved) {
          that.loadAllResults()
        })
      },
      checkGamePlay () {
        if (this.clearColsCount() != this.openedColsCount()) { return }
        this.stopTimer()
        this.smile = 'smile'
        this.openFlags()
        this.gameIsFinished = true
        this.checkIfNeedToSaveResult()
      },
      clearColsCount () {
        return this.currentGame.rows * this.currentGame.cols - this.currentGame.mines
      },
      openedColsCount () {
        let openedCount = 0
        for (let i = 0; i < this.currentGame.rows; i++) {
          for (let j = 0; j < this.currentGame.cols; j++) {
            if (this.gameField[i][j].isOpened) { openedCount++ }
          }
        }
        return openedCount
      },
      checkIfNeedToSaveResult () {
        if (this.currentGame.id == 4) { return false }
        let that = this
        this.$db.find({type: 'result', gameId: this.currentGame.id}).sort({ time: 1, date: 1 }).limit(10).exec(function (err, docs) {
          if (docs.length < 10 || docs[docs.length - 1].time > that.seconds) { that.showWinnerForm = true }
        })
      },
      countFlagsAround (row_index, col_index) {
        let count = 0
        for (let i = row_index - 1; i <= row_index + 1; i++) {
          if (i >= 0 && i < this.currentGame.rows) {
            for (let j = col_index - 1; j <= col_index + 1; j++) {
              if (j >= 0 && j < this.currentGame.cols && this.gameField[i][j].cover % this.numCover() == 1) { count++ }
            }
          }
        }
        return count
      },
      toggleMarkable () {
        this.markable = !this.markable
        this.setMarksSettings(this.markable)
        for (let i = 0; i < this.currentGame.rows; i++) {
          for (let j = 0; j < this.currentGame.cols; j++) {
            this.gameField[i][j].cover = this.gameField[i][j].cover % (this.markable ? 2 : 3)
          }
        }
      },
      isActiveCol (row_index, col_index, col) {
        return this.activeColIndex == this.stringifyIndex(row_index, col_index) && !this.gameIsFinished && col.cover % this.numCover() != 1
      },
      openedColClass (col) {
        if (col.isOpened) { return "mine-" + col.value }
      },
      closedColClass (col) {
        if (col.isOpened) { return }
        if (this.markable) { return ['closed', 'closed flag', 'closed mark'][col.cover % 3] }
        return ['closed', 'closed flag'][col.cover % 2]
      },
      numCover () {
        return this.markable ? 3 : 2
      },
      currentWindow () {
        return require('electron').remote.getCurrentWindow()
      },
      stringifyIndex (row, col) {
        return row + "-" + col
      }
    },
    computed: {
      numMinesLeft: function () {
        return this.currentGame ? this.currentGame.mines - this.numFlags : 0
      },
      numFlags: function () {
        if (!this.currentGame) { return 0 }
        let count = 0
        for (let i = 0; i < this.currentGame.rows; i++) {
          for (let j = 0; j < this.currentGame.cols; j++) {
            if (this.gameField[i][j] && this.gameField[i][j].cover % this.numCover() == 1) { count++ }
          }
        }
        return count
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

  .menu {
    height: 30px;
    margin-left: -8px;
    margin-top: -4px;
    a {
      font-size: 14px;
      line-height: 20px;
      padding: 5px 10px;
    }
    a:hover, a.active {
      color: white;
      background-color: $menu-active-color;
    }
  }

  .submenu {
    position: fixed;
    left: 0;
    top: 30px;
    font-size: 14px;
    background-color: $bg-color;
    padding: 5px 10px;
    border: 1px solid $cover-color;
    z-index: 3;
    a {
      display: block;
      padding: 5px 35px 5px 10px;
      &:hover {
        color: white;
        background-color: $menu-active-color;
      }
    }
  }

  .info {
    height: 30px;
    text-align: center;
    line-height: 30px;
    .smile {
      display: inline-block;
      width: 30px;
      height: 30px;
      background-repeat: no-repeat;
      background-size: 24px;
      background-position: center;
      &.smile  { background-image: url(../assets/Sunglasses_Emoji.png) }
      &.normal { background-image: url(../assets/Slightly_Smiling_Face_Emoji.png) }
      &.lost   { background-image: url(../assets/Dizzy_Face_Emoji.png) }
      &:active { background-image: url(../assets/Slightly_Smiling_Emoji_Icon_2.png) }
    }
    .mines, .timer {
      position: fixed;
      font-family: 'Digital-7';
      font-size: 30px;
      color: red;
      z-index: 2;
    }
    .mines { left: 10px }
    .timer { right: 10px }
  }

  .game-field { border: 1px solid $cover-color; }

  .row { height: $col-size; }

  .col {
    display: inline-block;
    width: $col-size;
    height: $col-size;
    background-repeat: no-repeat;
    background-position: center;
    border: 1px solid $cover-color;
  }

  .closed {
    border-left: 2px solid rgba(255,255,255,0.7);
    border-top: 2px solid rgba(255,255,255,0.7);
    background-color: $cover-color;
    &.active:active {
      background-color: $bg-color;
      border-left: 1px solid $cover-color;
      border-top: 1px solid $cover-color;
    }
  }

  .open { background-color: $bg-color; }
  .flag { background-image: url(../assets/flag.png) }
  .mark { background-image: url(../assets/q.png) }
  .mine-mine { background-image: url(../assets/mine.png) }
  .mine-error { background-image: url(../assets/mine.png); background-color: red }
  .mine-1 { background-image: url(../assets/1.png) }
  .mine-2 { background-image: url(../assets/2.png) }
  .mine-3 { background-image: url(../assets/3.png) }
  .mine-4 { background-image: url(../assets/4.png) }
  .mine-5 { background-image: url(../assets/5.png) }
  .mine-6 { background-image: url(../assets/6.png) }
  .mine-7 { background-image: url(../assets/7.png) }
  .mine-8 { background-image: url(../assets/8.png) }

  .overlay-box {
    position: absolute;
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    background-color: $bg-color;
    text-align: center;
    z-index: 4;

    h1 {
      font-size: 20px;
    }

    form { margin-top: 50px; }
    .form-group { margin-top: 10px; }
    label, input {
      display: inline-block;
      width: 80px;
      font-size: 12px;
      text-align: left;
    }
    input { padding: 3px 5px; }
    input#name { width: 120px; }
    button { padding: 5px 10px; }

    .top-results-box {
      display: inline-block;
      width: 200px;
      .top-results-line {
        font-size: 14px;
        text-align: left;
        border-bottom: 1px dotted $cover-color;
      }

      .time { float: right }

      a {
        font-size: 14px;
        padding: 5px;
        &.active {
          color: $menu-active-color;
          text-decoration: underline;
        }
      }

      .mt-5 { margin-top: 5px; }
      .text-center { text-align: center; }
    }
  }

  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid $cover-color;
    margin: 5px 0;
  }
</style>
