<template>
  <div class="game-field">
    <div v-for="(row, rowIndex) in field" class="row">
      <game-cell
        v-for="(cell, colIndex) in row"
        :cell="cell"
        :game="game"
        @opened="checkGame"
        @marked="emitFlagsNumber"
        @openCellsAround="openCellsAround">
      </game-cell>
    </div>
  </div>
</template>

<script>
  import GameCell from './GameCell'

  export default {
    name: 'game-field',
    components: { GameCell },
    mounted: function() {
      this.initField()
    },
    props: ['game'],
    data () {
      return {
        field: null,
        currentCell: null
      }
    },
    methods: {
      initField () {
        let field = []
        for(let i = 0; i < this.rows; i++) {
          field[i] = []
          for(let j = 0; j< this.cols; j++) {
            field[i][j] = {
              rowIndex: i,
              colIndex: j,
              value: null,
              mark: 0,
              isMine: false,
              isOpen: false,
              isFlagged: false,
              withError: false,
              active: false,
              needToOpen: false
            }
          }
        }
        this.field = field
        this.$forceUpdate()
        this.currentCell = null
        this.setGameStatus('starting')
      },
      setMines (exceptIndexes) {
        let randCells = this.getRandCells(exceptIndexes)
        for (let item of randCells) { this.field[item[0]][item[1]].isMine = true }
        this.setMinesNumberAroundCell()
      },
      getRandCells (exceptIndexes) {
        let usedCells = []
        for(let i = 0; i < this.mines; i++) {
          let rowIndex = this.getRand(this.rows)
          let colIndex = this.getRand(this.cols)
          while (JSON.stringify(usedCells).indexOf(JSON.stringify([rowIndex, colIndex])) != -1 || JSON.stringify([rowIndex, colIndex]) == JSON.stringify(exceptIndexes)) {
            rowIndex = this.getRand(this.rows)
            colIndex = this.getRand(this.cols)
          }
          usedCells.push([rowIndex, colIndex])
        }
        return usedCells
      },
      getRand (max) {
        return Math.floor(Math.random() * max)
      },
      setMinesNumberAroundCell () {
        this.field.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (cell.isMine) { return }
            cell.value = this.getMinesNumberAroundCell(rowIndex, colIndex)
          })
        })
        this.setGameStatus('playing')
      },
      getMinesNumberAroundCell (rowIndex, colIndex) {
        return this.getCellIndexesAroundCell(rowIndex, colIndex).filter(i => this.field[i[0]][i[1]].isMine).length
      },
      getFlagsNumberAroundCell (rowIndex, colIndex) {
        return this.getCellIndexesAroundCell(rowIndex, colIndex).filter(i => this.field[i[0]][i[1]].mark % 3 == 1).length
      },
      getCellIndexesAroundCell (rowIndex, colIndex) {
        let result = []
        for (let i = rowIndex - 1; i <= rowIndex + 1; i++) {
          if (i >= 0 && i < this.rows) {
            for (let j = colIndex - 1; j <= colIndex + 1; j++) {
              if (j >= 0 && j < this.cols && !(i == rowIndex && j == colIndex)) {
                result.push([i, j])
              }
            }
          }
        }
        return result
      },
      checkGame (arrayOfIndexes) {
        if (this.game.status == 'starting') {
          this.setMines(arrayOfIndexes)
        }

        if (this.game.status != 'playing') { return }

        this.currentCell = arrayOfIndexes

        let cell = this.cellFindByIndexes(arrayOfIndexes)
        // cell.isOpen = true
        // cell.mark = 0

        if (cell.isMine) {
          cell.withError = true
          this.setGameStatus('lost')
          return
        }

        if (this.getOpenedCellNumber == this.getClearCellNumber) {
          this.setGameStatus('win')
          return
        }

        this.$emit('openedCellNumber', this.getOpenedCellNumber)
      },
      emitFlagsNumber () {
        this.$emit('flagged', this.getAllFlagsNumber)
      },
      openCellsAround (arrayOfIndexes) {
        let cell = this.cellFindByIndexes(arrayOfIndexes)
        let cells = this.getCellIndexesAroundCell(arrayOfIndexes[0], arrayOfIndexes[1])
        let flagsNumber = (cells.filter((i) => this.field[i[0]][i[1]].mark % 3 == 1)).length
        if (cell.value == flagsNumber) {
          cells.forEach((i) => {
            let cell = this.cellFindByIndexes(i)
            if (!cell.isOpen && cell.mark % 3 == 0) { cell.needToOpen = true}
          })
        }
      },
      setGameStatus (status) {
        this.$emit('gameStatus', status)
      },
      cellFindByIndexes (arrayOfIndexes) {
        return this.field[arrayOfIndexes[0]][arrayOfIndexes[1]]
      }
    },
    computed: {
      getClearCellNumber: function () {
        return this.rows * this.cols - this.mines
      },
      getOpenedCellNumber: function () {
        let result = 0
        this.field.forEach((row) => {
          row.forEach((cell) => {
            if (cell.isOpen && !cell.isMine) { result++ }
          })
        })
        return result
      },
      getAllFlagsNumber: function () {
        let res = 0
        this.field.forEach((row) => {
          row.forEach((cell) => {
            if (cell.mark % 3 == 1) { res++ }
          })
        })
        return res
      },
      rows: function () { return this.game.settings.rows },
      cols: function () { return this.game.settings.cols },
      mines: function () { return this.game.settings.mines }
    },
    watch: {
      'game.status': function () {
        if (this.game.status == 'restarting') {
          this.initField()
        }
      },
      currentCell: function (value) {
        if (value == null || this.cellFindByIndexes(value).value != 0 || this.game.status == 'restarting') { return }
        this.getCellIndexesAroundCell(value[0], value[1]).forEach((i) => {
          this.field[i[0]][i[1]].needToOpen = true
        })
        this.$forceUpdate()
      }
    }
  }
</script>

<style lang="scss" scoped>
  $col-size: 22px;
  $cover-color: #ccc;

  .game-field { border: 1px solid $cover-color; }
  .row {
    height: $col-size;
  }
</style>
