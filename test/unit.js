/* eslint-env mocha */

var assert = require('power-assert')
var sinon = require('sinon')
var RewireTestHelpers = require('..')

describe('RewireTestHelpers', function () {
  describe('injectDependencies', function () {
    context('when rewire API is not defined', function () {
      it('throws an error', function () {
        assert.throws(function () {
          RewireTestHelpers.injectDependencies({}, {})
        }, /Module must be required using rewire./)
      })
    })

    function testInjectDependenciesAgainst (apiVersion) {
      it('overrides passed properties', function () {
        var obj = getObj(apiVersion)
        RewireTestHelpers.injectDependencies(obj, {b: 2, c: 3})
        assert(sinon.match({a: 'A', b: 2, c: 3}).test(obj))
      })

      it('returns a function that restores overriden properties', function () {
        var obj = getObj(apiVersion)
        var restoreObj = RewireTestHelpers.injectDependencies(obj, {b: 2, c: 3})
        restoreObj()
        assert(sinon.match({a: 'A', b: 'B', c: 'C'}).test(obj))
      })
    }

    context('when original rewire API is defined', function () {
      testInjectDependenciesAgainst('original')
    })

    context('when babel-plugin-rewire API is defined', function () {
      testInjectDependenciesAgainst('babel_plugin')

      context('when glob import (import * as ...) is rewired', function () {
        testInjectDependenciesAgainst('babel_plugin_glob')
      })
    })
  })

  describe('injectDependenciesFilter', function () {
    function redefineFilters (fn) {
      var _beforeEach = global.beforeEach
      var _afterEach = global.afterEach
      global.beforeEach = sinon.spy()
      global.afterEach = sinon.spy()
      fn(fn)
      global.beforeEach = _beforeEach
      global.afterEach = _afterEach
    }

    context('when rewire API is not defined', function () {
      it('throws an error on beforeEach', function () {
        redefineFilters(function () {
          RewireTestHelpers.injectDependenciesFilter({}, {})
          assert.throws(function () {
            global.beforeEach.args[0][0]()
          }, /Module must be required using rewire./)
        })
      })
    })

    function testInjectDependenciesFilterAgainst (apiVersion) {
      it('overrides passed properties on beforeEach', function () {
        redefineFilters(function () {
          var obj = getObj(apiVersion)
          RewireTestHelpers.injectDependenciesFilter(obj, {b: 2, c: 3})
          assert(sinon.match({a: 'A', b: 'B', c: 'C'}).test(obj))
          global.beforeEach.args[0][0]()
          assert(sinon.match({a: 'A', b: 2, c: 3}).test(obj))
        })
      })

      it('restores overriden properties on afterEach', function () {
        redefineFilters(function () {
          var obj = getObj(apiVersion)
          RewireTestHelpers.injectDependenciesFilter(obj, {b: 2, c: 3})
          var context = {}
          global.beforeEach.args[0][0].call(context)
          global.afterEach.args[0][0].call(context)
          assert(sinon.match({a: 'A', b: 'B', c: 'C'}).test(obj))
        })
      })
    }

    context('when original rewire API is defined', function () {
      testInjectDependenciesFilterAgainst('original')
    })

    context('when babel-plugin-rewire API is defined', function () {
      testInjectDependenciesFilterAgainst('babel_plugin')

      context('when glob import (import * as ...) is rewired', function () {
        testInjectDependenciesFilterAgainst('babel_plugin_glob')
      })
    })
  })

  describe('rewired', function () {
    context('when rewire API is not defined', function () {
      it('throws an error', function () {
        assert.throws(function () {
          RewireTestHelpers.rewired({}, {}, function () {})
        }, /Module must be required using rewire./)
      })
    })

    function testRewiredAgainst (apiVersion) {
      it('overrides passed properties', function (done) {
        var obj = getObj(apiVersion)
        RewireTestHelpers.rewired(obj, {b: 2, c: 3}, function () {
          assert(sinon.match({a: 'A', b: 2, c: 3}).test(obj))
          done()
        })
      })

      it('restores overriden properties after execution', function () {
        var obj = getObj(apiVersion)
        RewireTestHelpers.rewired(obj, {b: 2, c: 3}, function () {})
        assert(sinon.match({a: 'A', b: 'B', c: 'C'}).test(obj))
      })

      context('when passed body function returns a promise', function () {
        it('restores overriden properties only when promise is resolved', function (done) {
          var obj = getObj(apiVersion)
          RewireTestHelpers.rewired(obj, {b: 2, c: 3}, function () {
            return new Promise(function (resolve) {
              setTimeout(function () {
                resolve()
                setTimeout(function () {
                  assert(sinon.match({a: 'A', b: 'B', c: 'C'}).test(obj))
                  done()
                })
              })
            })
          })
          assert(sinon.match({a: 'A', b: 2, c: 3}).test(obj))
        })
      })
    }

    context('when original rewire API is defined', function () {
      testRewiredAgainst('original')
    })

    context('when babel-plugin-rewire API is defined', function () {
      testRewiredAgainst('babel_plugin')

      context('when glob import (import * as ...) is rewired', function () {
        testRewiredAgainst('babel_plugin_glob')
      })
    })
  })
})

function getObj (apiVersion) {
  var obj = {
    a: 'A',
    b: 'B',
    c: 'C'
  }

  function get (prop) {
    return obj[prop]
  }

  function set (prop, value) {
    obj[prop] = value
  }

  switch (apiVersion) {
    case 'original':
      Object.assign(obj, {__get__: get, __set__: set})
      break
    case 'babel_plugin':
      Object.assign(obj, {__GetDependency__: get, __Rewire__: set})
      break
    case 'babel_plugin_glob':
      Object.assign(obj, {default: {__GetDependency__: get, __Rewire__: set}})
      break
  }

  return obj
}
