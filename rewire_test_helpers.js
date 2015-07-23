/**
 * Set of helpers that helps easily inject dependencies using [rewire](rewire-link).
 * [rewire-link]: https://github.com/jhnns/rewire
 */
var RewireTestHelpers = {
  /**
   * Injects specified dependencies and returns restore function.
   *
   * @param {object} target - any module required with rewire.
   * @param {object} overrides - object, where key is private name and value is
   * an override.
   * @returns {function} restore function.
   *
   * @example
   * beforeEach(function() {
   *   this.restore = RewireTestHelpers.injectDependencies(SideNavigation, {
   *     Link: DummyLink
   *   });
   * });
   *
   * afterEach(function() {
   *   this.restore()
   * });
   */
  injectDependencies: function(target, overrides) {
    if (!target.__get__) {
      throw 'Module must be required using rewire.';
    }

    var originals = {};
    Object.keys(overrides).forEach(function(privateName) {
      originals[privateName] = target.__get__(privateName);
      target.__set__(privateName, overrides[privateName]);
    });

    return function() {
      Object.keys(overrides).forEach(function(privateName) {
        target.__set__(privateName, originals[privateName]);
      });
    };
  },

  /**
   * Inject specified dependencies in beforeEach filter and restore them in
   * afterEach.
   *
   * @param {Object} target - any module required with rewire.
   * @param {Object} overrides - object, where key is private name and value is
   * an override.
   */
  injectDependenciesFilter: function(target, overrides) {

    beforeEach(function() {
      this.restoreInjectedDependencies =
        RewireTestHelpers.injectDependencies(target, overrides);
    });

    afterEach(function() {
      this.restoreInjectedDependencies();
    });
  },

  /**
   * Injects specified dependencies, runs passed function and restores original
   * version.
   *
   * @param {Object} target - any module required with rewire.
   * @param {Object} overrides - object, where key is private name and value is
   * an override.
   * @param {Function} fn - function to be called.
   *
   * @example
   * var SideNavigation = sinon.spy();
   * RewireTestHelpers.rewired(AppLayout, {SideNavigation}, function() {
   *   playground.render(<AppLayout />);
   *   expect(SideNavigation).to.be.called;
   * });
   */
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
};

module.exports = RewireTestHelpers;

