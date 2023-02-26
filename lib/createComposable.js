function createContext (instance) {
  return {
    instance,
    provides: Object.create(null)
  }
}

module.exports = function createComposable (setupInstance) {
  let current
  let installing = false

  const setCurrent = (instanceContext) => {
    installing = true
    current = instanceContext
  }

  function unsetCurrent () {
    installing = false
    current = undefined
  }

  function getCurrentInstance () {
    if (!installing) {
      throw new Error('getCurrentInstance() can only be used inside install().')
    }
    return current.instance
  }

  function provide (key, value) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiInject.ts#L9
    if (!installing) {
      throw new Error('provide() can only be used inside install().')
    }
    const provides = current.provides
    if (key in provides) {
      throw new Error(`injection ${String(key)} duplicate provided`)
    }
    provides[key] = value
  }

  function inject (key) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiInject.ts#L48
    if (!installing) {
      throw new Error('inject() can only be used inside install().')
    }

    const instance = current
    const provides = instance.provides
    if (!(key in provides)) {
      throw new Error(`injection "${String(key)}" not found.`)
    }

    return provides[key]
  }

  function create (...options) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiCreateApp.ts#L205
    const installedPlugins = new Set()
    const instance = setupInstance({ use }, ...options)
    const context = createContext(instance)

    function setup (install, ...useOptions) {
      setCurrent(context)
      install(instance, ...useOptions)
      unsetCurrent()
    }

    function use (plugin, ...useOptions) {
      if (installedPlugins.has(plugin)) {
        throw new Error('plugin has already been applied to target.')
      }

      if (typeof plugin === 'function') {
        installedPlugins.add(plugin)
        setup(plugin, ...useOptions)
        return this
      }

      installedPlugins.add(plugin)
      setup(plugin.install, ...useOptions)
      return this
    }

    return instance
  }

  return {
    create,
    getCurrentInstance,
    provide,
    inject
  }
}
