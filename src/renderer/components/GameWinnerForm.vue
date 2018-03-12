<template>
  <div class="custom-game-form">
    <h1>You are in top 10!</h1>
    <form>
      <div class="form-group">
        <label for="name">Your name:</label>
        <input id="name" type="text" name="name" v-model="name">
        <button @click.prevent="saveResult()">OK</button>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'game-winner-form',
    data () {
      return {
        name: null
      }
    },
    created () {
      require('electron').remote.getCurrentWindow().setSize(400, 400)
      require('electron').remote.getCurrentWindow().center(true)
    },
    methods: {
      saveResult () {
        let that = this
        let gameId = this.$route.params.gameId
        let time = this.$route.params.time
        let result = { type: 'result', gameId: +gameId, name: this.name || "unknown", time: +time, date: new Date() }
        this.$db.insert(result, function (err, newDoc) {
          that.$router.replace({path: '/statistics/' + gameId})
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
    }
  }

</style>
