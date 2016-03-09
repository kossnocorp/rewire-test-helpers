/* global beforeEach, afterEach */

// Set of helpers that helps easily inject dependencies using rewire.
var RewireTestHelpers = {
  // Injects specified dependencies and returns restore function.
  //
  // - (obj, object) - any module required with rewire.
  // - (overridesMap, object): key is a module variable name,
  //   value is a new module value
  //
  // Resturns restore function.
  //
  //   beforeEach(function() {
  //     this.restore = RewireTestHelpers.rewireMap(SideNavigation, {
  //       Link: DummyLink
  //     })
  //   })
  //
  //   afterEach(function() {
  //     this.restore()
  //   })
  rewireMap: function (obj, overridesMap) {
    if (!rewireGet(obj)) {
      throw new Error('Module must be required using rewire.')
    }

    var originals = {}
    Object.keys(overridesMap).forEach(function (privateName) {
      originals[privateName] = rewireGet(obj)(privateName)
      rewireSet(obj)(privateName, overridesMap[privateName])
    })

    return function () {
      Object.keys(overridesMap).forEach(function (privateName) {
        rewireSet(obj)(privateName, originals[privateName])
      })
    }
  },

  // Inject specified dependencies in beforeEach filter and restore them in
  // afterEach.
  //
  // - (obj, object): module to extend, must be imported with rewire
  // - (overridesMap, object): key is a module variable name,
  //   value is a new module value
  //
  rewireFilter: function (obj, overridesMap) {
    var id = Math.random().toString()

    beforeEach(function () {
      this.__rewireTestHelpers = this.__rewireTestHelpers || {}
      this.__rewireTestHelpers[id] =
        RewireTestHelpers.rewireMap(obj, overridesMap)
    })

    afterEach(function () {
      var restore = this.__rewireTestHelpers[id]

      if (typeof restore === 'function') {
        restore()
      }
    })
  },

  // Injects specified dependencies, runs passed function and restores original
  // version.
  //
  // When passed function returns promise, rewired also returns promise.
  //
  // - (obj, object): module to extend, must be imported with rewire
  // - (overridesMap, object): key is a module variable name,
  //   value is a new module value
  // - (fn, function): function to be called
  //
  // Basic usage:
  //
  //   it('renders side navigation', ()=> {
  //     const SideNavigation = sinon.spy()
  //
  //     rewired(AppLayout, {SideNavigation}, ()=> {
  //       render(AppLayout)
  //       assert(SideNavigation.called)
  //     })
  //   })
  //
  // Usage with promises:
  //
  //   TODO:
  //
  rewired: function (obj, overridesMap, fn) {
    var restore = RewireTestHelpers.rewireMap(obj, overridesMap)
    var result = fn()

    // If result is promise then restore on resolve and return promise too
    if (typeof Promise !== 'undefined' && result instanceof Promise) {
      return result.then(restore)
    } else {
      restore()
    }
  }
}

function rewireGet (obj) {
  return obj && obj.__get__ ||
    obj.__GetDependency__ ||
      // When glob import is passed as an argument, the object itself won't
      // have rewire API
    (obj.default && obj.default.__GetDependency__)
}

function rewireSet (obj) {
  return obj && obj.__set__ ||
    obj.__Rewire__ ||
      // When glob import is passed as an argument, the object itself won't
      // have rewire API
    (obj.default && obj.default.__Rewire__)
}

module.exports = RewireTestHelpers
