function createContext (instance) {
  return {
    instance,
    provides: Object.create(null)
  }
}

module.exports = function createComposable () {
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

  function createUseable (instance) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiCreateApp.ts#L205
    const installedPlugins = new Set()
    const context = createContext(instance)

    const useable = {
      use (plugin, ...options) {
        if (installedPlugins.has(plugin)) {
          throw new Error('Plugin has already been applied to target useable.')
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          setCurrent(context)
          plugin(instance, ...options)
          unsetCurrent()
          return this
        }

        installedPlugins.add(plugin)
        setCurrent(context)
        plugin.install(instance, ...options)
        unsetCurrent()
        return this
      }
    }

    return useable
  }

  return {
    getCurrentInstance,
    provide,
    inject,
    createUseable
  }
}
