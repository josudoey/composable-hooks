module.exports = function createHook () {
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

  function createContext (instance) {
    const provides = Object.create(null)

    function setInstance (install, ...options) {
      setCurrent({ instance, provides, previous: current })
      try {
        install(instance, ...options)
      } finally {
        unsetCurrent()
      }
    }

    return {
      instance,
      setInstance
    }
  }

  return {
    createContext,
    getCurrentInstance,
    provide,
    inject
  }
}
