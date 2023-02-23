function createInstanceContext (instance) {
  return {
    instance,
    provides: Object.create(null)
  }
}

module.exports = function createComposable () {
  let currentInstanceContext = null
  const setInstanceContext = (instanceContext) => {
    currentInstanceContext = instanceContext
  }

  const getCurrentInstance = () => currentInstanceContext.instance
  function unsetCurrentInstanceContext () {
    currentInstanceContext = null
  }

  function provide (key, value) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiInject.ts#L9
    if (!currentInstanceContext) {
      warn('provide() can only be used inside install().')
    } else {
      const provides = currentInstanceContext.provides
      provides[key] = value
    }
  }

  function inject (key, defaultValue) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiInject.ts#L48
    const instance = currentInstanceContext
    if (instance) {
      const provides = instance.provides
      if (provides && key in provides) {
        return provides[key]
      } else if (arguments.length > 1) {
        return defaultValue
      } else {
        throw new Error(`injection "${String(key)}" not found.`)
      }
    } else {
      throw new Error('inject() can only be used inside install().')
    }
  }

  function createUseable (instance) {
    // ref https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiCreateApp.ts#L205
    const installedPlugins = new Set()
    const instanceContext = createInstanceContext(instance)

    const useable = {
      use (plugin, ...options) {
        if (installedPlugins.has(plugin)) {
          throw new Error('Plugin has already been applied to target useable.')
        }

        if (typeof plugin === 'function') {
          installedPlugins.add(plugin)
          setInstanceContext(instanceContext)
          plugin(instance, ...options)
          unsetCurrentInstanceContext()
          return this
        }

        installedPlugins.add(plugin)
        setInstanceContext(instanceContext)
        plugin.install(instance, ...options)
        unsetCurrentInstanceContext()
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
