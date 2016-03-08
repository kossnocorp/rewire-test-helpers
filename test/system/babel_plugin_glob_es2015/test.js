/* eslint-env mocha */

import assert from 'power-assert'
import RewireTestHelpers from '../../..'
import * as _module from './module'

test(_module)

function test (module) {
  describe('Sytem tests for original rewire API', function () {
    describe('injectDependencies', function () {
      it('overrides passed properties and returns a function that restores them', function () {
        var restore = RewireTestHelpers.injectDependencies(module, {a: 1, b: 2})
        assert.deepEqual(module.fn(), [1, 2, 'C'])
        restore()
        assert.deepEqual(module.fn(), ['A', 'B', 'C'])
      })
    })

    describe('injectDependenciesFilter', function () {
      RewireTestHelpers.injectDependenciesFilter(module, {a: 1, b: 2})

      afterEach(function () {
        assert.deepEqual(module.fn(), ['A', 'B', 'C'], "Properties weren't restored in afterEach filter")
      })

      it('redefines passed properties in beforeEach filter', function () {
        assert.deepEqual(module.fn(), [1, 2, 'C'])
      })
    })

    describe('rewired', function () {
      it('redefines passed properties in the body function', function () {
        RewireTestHelpers.rewired(module, {a: 1, b: 2}, function () {
          assert.deepEqual(module.fn(), [1, 2, 'C'])
        })
        assert.deepEqual(module.fn(), ['A', 'B', 'C'])
      })

      context('when passed body function returns a promise', function () {
        it('restores overriden properties only when promise is resolved', function (done) {
          RewireTestHelpers.rewired(module, {a: 1, b: 2}, function () {
            return new Promise(function (resolve) {
              setTimeout(function () {
                resolve()
                setTimeout(function () {
                  assert.deepEqual(module.fn(), ['A', 'B', 'C'])
                  done()
                })
              })
            })
          })
          assert.deepEqual(module.fn(), [1, 2, 'C'])
        })
      })
    })
  })
}
