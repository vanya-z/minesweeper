<template>
  <div class="info">
    <span class="mines">{{game.settings.mines - game.flagged}}</span>
    <a :class="smileClass" @click="restartGame"></a>
    <span class="timer">{{seconds}}</span>
  </div>
</template>

<script>
  export default {
    props: [
      'game'
    ],
    data () {
      return {
        timer: null,
        seconds: 0,
        secondsLimit: 999
      }
    },
    methods: {
      restartGame () {
        this.$emit('gameStatus', 'restarting')
      },
      startTimer () {
        let that = this
        this.seconds++
        this.timer = setTimeout(that.startTimer, 1000)
      },
      stopTimer () {
        if (this.timer) { clearTimeout(this.timer) }
      }
    },
    computed: {
      smileClass: function () {
        if (this.game.status == 'win') { return 'smile win' }
        if (this.game.status == 'lost') { return 'smile lost' }
        return 'smile normal'
      }
    },
    watch: {
      'game.status': function () {
        if (this.game.status == 'restarting') { return this.seconds = 0 }
        if (this.game.status == 'playing') { return this.startTimer() }
        this.stopTimer()
      },
      seconds: function () {
        if (this.seconds >= this.secondsLimit) { this.stopTimer() }
        this.$emit('seconds', this.seconds)
      }
    }
  }
</script>

<style lang="scss" scoped>
  $col-size: 22px;
  $cover-color: #ccc;
  $bg-color: #f2f2f2;
  $menu-active-color: #247ba0;

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
      &.win  { background-image: url(../assets/Sunglasses_Emoji.png) }
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
</style>
