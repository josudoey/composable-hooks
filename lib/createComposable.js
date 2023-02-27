const createHook = require('./createHook.js')
module.exports = function createComposable () {
  const {
    createContext,
    getCurrentInstance,
    provide,
    inject
  } = createHook()

  return {
    createContext (instance) {
      const ctx = createContext(instance)
      const installedPlugins = new Set()
      function use (plugin, ...useOptions) {
        if (installedPlugins.has(plugin)) {
          console.error('plugin has already been applied to target.')
          return
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          ctx.setInstance(plugin, ...useOptions)
          return this
        }

        installedPlugins.add(plugin)
        ctx.setInstance(plugin.install, ...useOptions)
        return this
      }

      return {
        instance,
        use
      }
    },
    getCurrentInstance,
    provide,
    inject
  }
}
