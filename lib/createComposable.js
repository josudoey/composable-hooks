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
      const ctx = { wrap }
      ctx.use = wrap(function (plugin, ...useOptions) {
        if (installedPlugins.has(plugin)) {
          console.error('plugin has already been applied to target.')
          return ctx
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          plugin(instance, ...useOptions)
          return this
        }

        installedPlugins.add(plugin)
        plugin.install(instance, ...useOptions)
        return ctx
      })

      return ctx
    },
    getCurrentInstance,
    provide,
    inject
  }
}
