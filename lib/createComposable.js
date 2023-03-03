const createHooksContext = require('./createHooksContext.js')
module.exports = function createComposable () {
  const {
    create,
    getCurrentInstance,
    provide,
    inject
  } = createHooksContext()

  return {
    createContext (instance) {
      const wrap = create(instance)
      const installedPlugins = new Set()
      const use = wrap(function (plugin, ...useOptions) {
        if (installedPlugins.has(plugin)) {
          console.error('plugin has already been applied to target.')
          return this
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          plugin(instance, ...useOptions)
          return this
        }

        installedPlugins.add(plugin)
        plugin.install(instance, ...useOptions)
        return this
      })

      return {
        wrap,
        use
      }
    },
    getCurrentInstance,
    provide,
    inject
  }
}
