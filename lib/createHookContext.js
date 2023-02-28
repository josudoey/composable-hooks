module.exports = function createHookContext () {
  let current = null

  const setCurrent = (currenctContext) => {
    current = currenctContext
  }

  function unsetCurrent () {
    current = current.previous
  }

  function getCurrentInstance () {
    if (!current) {
      console.error('getCurrentInstance() can only be used inside install().')
      return
    }
    return current.instance
  }

  function provide (key, value) {
    if (!current) {
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
    if (!current) {
      console.error('inject() can only be used inside install().')
      return
    }

    const provides = current.provides
    if (key in provides) {
      return provides[key]
    }

    console.error(`injection "${String(key)}" not found.`)
  }

  function wrap (instance) {
    const provides = Object.create(null)

    return function hook (install, ...options) {
      if (!install) {
        return instance
      }

      setCurrent({ instance, provides, previous: current })
      try {
        install(instance, ...options)
      } finally {
        unsetCurrent()
      }
      return instance
    }
  }

  return {
    wrap,
    getCurrentInstance,
    provide,
    inject
  }
}
