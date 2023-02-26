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

  function createContext (instance) {
    const provides = Object.create(null)
    const installedPlugins = new Set()

    function setup (install, ...useOptions) {
      setCurrent({ instance, provides })
      try {
        install(instance, ...useOptions)
      } catch (err) {
        unsetCurrent()
        throw err
      }
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

    return {
      instance,
      use
    }
  }

  return {
    createContext,
    getCurrentInstance,
    provide,
    inject
  }
}
