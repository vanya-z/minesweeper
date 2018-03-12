<template>
  <div
    @click.left="onLeftClick"
    @click.right="onRightClick"
    @click.middle="onMiddleClick"
    @mousedown.left="onMouseDownLeft"
    :class="[
      getOpenCellClass(cell.value),
      markName,
      {
        open: cell.isOpen,
        closed: !cell.isOpen,
        mine: cell.isMine && cell.isOpen,
        active: cell.active,
        error: cell.withError
      }
    ]
  ">    
  </div>
</template>

<script>
  export default {
    props: [
      'game',
      'cell'
    ],
    methods: {
      onLeftClick () {
        if (this.playing && !this.withAFlag && !this.cell.isOpen) { this.openCell() }
      },
      onRightClick () {
        if (this.playing && !this.cell.isOpen) { this.markCell() }
      },
      onMouseDownLeft () {
        if (this.playing && !this.withAFlag) { this.cell.active = true }
      },
      onMiddleClick () {
        if (this.playing && this.cell.isOpen) {
          this.$emit('openCellsAround', [this.cell.rowIndex, this.cell.colIndex])
        }
      },
      openCell () {
        this.cell.isOpen = true
        this.$emit('opened', [this.cell.rowIndex, this.cell.colIndex])
      },
      markCell () {
        this.cell.mark++
      },
      getOpenCellClass (value) {
        if (this.cell.isOpen) { return "mine-" + value }
      }
    },
    computed: {
      markName: function () {
        if (this.cell.mark % 3 == 0) { return }
        if (this.cell.mark % 3 == 1) { return 'flag' }
        if (this.cell.mark % 3 == 2) { return 'question' }
      },
      playing: function () {
        return this.game.status == 'playing' || this.game.status == 'starting'
      },
      withAFlag: function () {
        return this.cell.mark % 3 == 1
      }
    },
    watch: {
      'cell.mark':function (value) {
        this.$emit('marked')
      },
      'cell.needToOpen': function (value) {
        if (value) { this.openCell() }
      },
      'game.status': function (val) {
        if (val == 'win' && this.cell.isMine) { this.cell.mark = 1 }
        if (val == 'lost' && this.cell.isMine) { this.openCell() }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $col-size: 22px;
  $cover-color: #ccc;
  $bg-color: #f2f2f2;
  $menu-active-color: #247ba0;

  div {
    box-sizing: border-box;
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
  .question { background-image: url(../assets/q.png) }
  .mine { background-image: url(../assets/mine.png) }
  .mine.error { background-image: url(../assets/mine.png); background-color: red }
  .mine-1 { background-image: url(../assets/1.png) }
  .mine-2 { background-image: url(../assets/2.png) }
  .mine-3 { background-image: url(../assets/3.png) }
  .mine-4 { background-image: url(../assets/4.png) }
  .mine-5 { background-image: url(../assets/5.png) }
  .mine-6 { background-image: url(../assets/6.png) }
  .mine-7 { background-image: url(../assets/7.png) }
  .mine-8 { background-image: url(../assets/8.png) }
</style>
