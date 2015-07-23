// Set of helpers that helps easily inject dependencies using rewire.
var RewireTestHelpers = {
  // Injects specified dependencies and returns restore function.
  //
  // - (target, object) - any module required with rewire.
  // - (overrides, object): key is a module variable name,
  //   value is a new module value
  //
  // Resturns restore function.
  //
  //   beforeEach(function() {
  //     this.restore = RewireTestHelpers.injectDependencies(SideNavigation, {
  //       Link: DummyLink
  //     })
  //   })
  //
  //   afterEach(function() {
  //     this.restore()
  //   })
  //
  injectDependencies: function(target, overrides) {
    if (!target.__get__) {
      throw 'Module must be required using rewire.'
    }

    var originals = {}
    Object.keys(overrides).forEach(function(privateName) {
      originals[privateName] = target.__get__(privateName)
      target.__set__(privateName, overrides[privateName])
    });

    return function() {
      Object.keys(overrides).forEach(function(privateName) {
        target.__set__(privateName, originals[privateName])
      })
    }
  },

  // Inject specified dependencies in beforeEach filter and restore them in
  // afterEach.
  //
  // - (target, object): module to extend, must be imported with rewire
  // - (overrides, object): key is a module variable name,
  //   value is a new module value
  //
  injectDependenciesFilter: function(target, overrides) {
    var id = Math.random().toString()

    beforeEach(function() {
      this.__rewireTestHelpers = this.__rewireTestHelpers || {}
      this.__rewireTestHelpers[id] =
        RewireTestHelpers.injectDependencies(target, overrides)
    })

    afterEach(function() {
      var restore = this.__rewireTestHelpers[id]

      if (typeof restore == 'function') {
        restore()
      }
    })
  },

  // Injects specified dependencies, runs passed function and restores original
  // version.
  //
  // When passed function returns promise, rewired also returns promise.
  //
  // - (target, object): module to extend, must be imported with rewire
  // - (overrides, object): key is a module variable name,
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
  rewired: function(target, overrides, fn) {
    var restore = RewireTestHelpers.injectDependencies(target, overrides)

    var result = fn()

    // If result is promise then restore on resolve and return promise too
    if (typeof Promise != 'undefined' && result instanceof Promise) {
      return result.then(restore)

    } else {
      restore()
    }
  }
}

module.exports = RewireTestHelpers

