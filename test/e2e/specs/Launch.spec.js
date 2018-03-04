import utils from '../utils'

describe('Launch', function () {
  beforeEach(utils.beforeEach)
  afterEach(utils.afterEach)

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  it('shows the proper application title', function () {
    return this.app.client.getTitle()
      .then(title => {
        expect(title).to.equal('Minesweeper')
      })
  })

})
