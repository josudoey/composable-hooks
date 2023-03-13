module.exports = function createHooksContext () {
  let current = null

  const setCurrent = (currentContext) => {
    current = currentContext
  }

  function unsetCurrent () {
    current = current.previous
  }

  function getCurrentInstance () {
    if (!current) {
      console.error('getCurrentInstance() can only be used inside hook().')
      return
    }
    return current.instance
  }

  function provide (key, value) {
    if (!current) {
      console.error('provide() can only be used inside hook().')
      return
    } else if (typeof value === 'undefined') {
      delete current.provides[key]
      return
    }

    current.provides[key] = value
  }

  function inject (key) {
    if (!current) {
      console.error('inject() can only be used inside hook().')
      return
    }

    const provides = current.provides
    if (key in provides) {
      return provides[key]
    }

    console.error(`injection "${String(key)}" not found.`)
  }

  function create (instance) {
    const provides = Object.create(null)

    return function wrap (hook) {
      return function hooks (...options) {
        setCurrent({ instance, provides, previous: current })

        try {
          return hook(...options)
        } finally {
          unsetCurrent()
        }
      }
    }
  }

  return {
    create,
    getCurrentInstance,
    provide,
    inject
  }
}
