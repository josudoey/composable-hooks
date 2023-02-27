module.exports = function createComposable () {
  let current
  let installing = false

  const setCurrent = (instanceContext) => {
    if (installing) {
      console.error('plugin is currently being installed to the target.')
      return
    }
    installing = true
    current = instanceContext
  }

  function unsetCurrent () {
    installing = false
    current = undefined
  }

  function getCurrentInstance () {
    if (!installing) {
      console.error('getCurrentInstance() can only be used inside install().')
      return
    }
    return current.instance
  }

  function provide (key, value) {
    if (!installing) {
      console.error('provide() can only be used inside install().')
      return
    }

    const provides = current.provides
    if (key in provides) {
      console.error(`injection ${String(key)} duplicate provided`)
      return
    }

    provides[key] = value
  }

  function inject (key) {
    if (!installing) {
      console.error('inject() can only be used inside install().')
      return
    }

    const instance = current
    const provides = instance.provides
    if (key in provides) {
      return provides[key]
    }

    console.error(`injection "${String(key)}" not found.`)
  }

  function createContext (instance) {
    const provides = Object.create(null)
    const installedPlugins = new Set()

    function setup (install, ...useOptions) {
      setCurrent({ instance, provides })
      try {
        install(instance, ...useOptions)
      } finally {
        unsetCurrent()
      }
    }

    function use (plugin, ...useOptions) {
      if (installedPlugins.has(plugin)) {
        console.error('plugin has already been applied to target.')
        return
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
