/* eslint-env mocha */

import assert from 'power-assert'
import RewireTestHelpers from '../../..'
import module from './module'

describe('Sytem tests for babel-plugin-rewire API against ES 2015 modules', function () {
  describe('rewireMap', function () {
    it('overrides passed properties and returns a function that restores them', function () {
      var restore = RewireTestHelpers.rewireMap(module, {a: 1, b: 2})
      assert.deepEqual(module(), [1, 2, 'C'])
      restore()
      assert.deepEqual(module(), ['A', 'B', 'C'])
    })
  })

  describe('rewireFilter', function () {
    RewireTestHelpers.rewireFilter(module, {a: 1, b: 2})

    afterEach(function () {
      assert.deepEqual(module(), ['A', 'B', 'C'], "Properties weren't restored in afterEach filter")
    })

    it('redefines passed properties in beforeEach filter', function () {
      assert.deepEqual(module(), [1, 2, 'C'])
    })
  })

  describe('rewired', function () {
    it('redefines passed properties in the body function', function () {
      RewireTestHelpers.rewired(module, {a: 1, b: 2}, function () {
        assert.deepEqual(module(), [1, 2, 'C'])
      })
      assert.deepEqual(module(), ['A', 'B', 'C'])
    })

    context('when passed body function returns a promise', function () {
      it('restores overriden properties only when promise is resolved', function (done) {
        RewireTestHelpers.rewired(module, {a: 1, b: 2}, function () {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve()
              setTimeout(function () {
                assert.deepEqual(module(), ['A', 'B', 'C'])
                done()
              })
            })
          })
        })
        assert.deepEqual(module(), [1, 2, 'C'])
      })
    })
  })
})
