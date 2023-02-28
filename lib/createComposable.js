const createHookContext = require('./createHookContext.js')
module.exports = function createComposable () {
  const {
    wrap,
    getCurrentInstance,
    provide,
    inject
  } = createHookContext()

  return {
    createContext (instance) {
      const hook = wrap(instance)
      const installedPlugins = new Set()
      function use (plugin, ...useOptions) {
        if (installedPlugins.has(plugin)) {
          console.error('plugin has already been applied to target.')
          return
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          hook(plugin, ...useOptions)
          return this
        }

        installedPlugins.add(plugin)
        hook(plugin.install, ...useOptions)
        return this
      }

      return {
        hook,
        use
      }
    },
    getCurrentInstance,
    provide,
    inject
  }
}
