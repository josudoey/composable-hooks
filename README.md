# composable-hook
[![npm](https://img.shields.io/npm/v/composable-hook)](https://www.npmjs.com/package/composable-hook)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/josudoey/composable-hook/action.yml)](https://github.com/josudoey/composable-hook/actions)

- [composable-hook](#composable-hook)
  - [Installation](#installation)
  - [Composable](#composable)
    - [Usage](#usage)
  - [Hooks](#hooks)
  - [Reference Docs](#reference-docs)

## Installation

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install composable-hook
```

## Composable
The `createComposable` function is a utility function that returns an object with several methods used to create and manage a context for plugins. The following methods are available:

- `createContext(instance)`: creates a new context for a given instance. The instance parameter can be any object that will act as the context. This method returns an object with a use method which is used to apply plugins to the context.
  - `context.wrap(hook)`
  - `context.use(plugin, ...)`
- `getCurrentInstance()`: retrieves the current instance in use. It can only be used inside the hook() method.
- `provide(key, value)`: provides a value to a key in the current context. It can only be used inside the hook() method.
- `inject(key)`: retrieves the value associated with a key in the current context. It can only be used inside the hook() method.


### Usage

The code above shows an example of how to use the composable-hook library to create a modular and composable application.

```mjs
// core.js
import { createComposable } from 'composable-hook'

// like koa or express or vue
import { createApp } from './createApp.js' 

// The core.js file imports the createComposable function from the composable-hook library,
// which returns a set of functions to create and manage a composable application.
// It also imports a createApp function from a createApp.js module.

const {
  getCurrentInstance,
  provide,
  inject,
  createContext
} = createComposable()


// The createCore function creates a new instance of the application
// by calling the createApp function and creating a new context using the createContext function from the createComposable module.
// It returns an object with a use function to add plugins to the application and an app property to access the application instance.
export function createCore (options) {
  const app = createApp(options)
  const { use } = createContext(app)

  return {
    use,
    app
  }
}

// The useCore function returns the current instance of the application.
export function useCore () {
  return getCurrentInstance()
}
export { provide, inject }
```

The config.js and logger.js files demonstrate how to create plugins using the provide and inject functions from the core.js module. Both plugins define a unique key as a symbol to avoid naming conflicts.

```mjs
// config.js
import { provide, inject } from './core.js'
const key = Symbol('config')


// The createConfigPlugin function returns an object
// with an install method that initializes the configuration and provides
// it to the application using the provide function.
export function createConfigPlugin (options) {
  return {
    install (app) {
      // ... init config
      provide(key, config)
    }
  }
}

// The useConfig function returns the configuration object
// by calling the inject function with the key defined in config.js.
export function useConfig () {
  return inject(key)
}
```

```mjs
// logger.js
import { provide, inject } from './core.js'
import { useConfig } from './config.js'
const key = Symbol('logger')

// The createLoggerPlugin function returns an object with an install method
// that initializes the logger by accessing the configuration object
// using the useConfig function and provides it to the application using the provide function.
export function createLoggerPlugin (options) {
  return {
    install (app) {
      // useConfig function gets the config instance provided by createConfigPlugin's install function.
      const config = useConfig()
      // ... init logger
      provide(key, logger)
    }
  }
}

// The useLogger function returns the logger object by calling the inject function with the key defined in logger.js.
export function useLogger () {
  return inject(key)
}
```

Finally, the main.js file demonstrates how to use the createCore function to create a new instance of the application and add the createConfigPlugin and createLoggerPlugin plugins to it using the use function.

```mjs
// main.js
import { createCore } from './core.js'
import { createConfigPlugin } from './config.js'
import { createLoggerPlugin } from './logger.js'

const core = createCore(...)
              .use(createConfigPlugin(...), ...)
              .use(createLoggerPlugin(...), ...) 
```

## Hooks
`createHooksContext` returns an object with the following methods:
- `create(instance)`: method is used to create a new hook. It takes an instance argument, which is the object that the hook is attached to. It returns a function that takes a hook argument, which is the function that defines the hook.
  - `wrap(hook)`: method returns the a hooks function.
- `getCurrentInstance()`: method returns the current instance that the hook is attached to. It can only be called from within a hooks.
- `provide(key, value)`: Registers a value with a key in the current hook's "provides" object. This object can be used to share values between different hooks.
- `inject(key)`: Returns the value registered with the given key in the current hook's "provides" object. This function can only be used inside the install function.


## Reference Docs
- [composable](https://vuejs.org/guide/reusability/composables.html#what-is-a-composable)
- [hooks](https://reactjs.org/docs/hooks-intro.html)
- [context](https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiCreateApp.ts#L204)
- [injection](https://github.com/vuejs/core/blob/a0e7dc334356e9e6ffaa547d29e55b34b9b8a04d/packages/runtime-core/src/apiInject.ts#L6)
- [react fiber](https://github.com/facebook/react/blob/6ff1733e63fdb948ae973a713741b4526102c73c/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1910-L1927)
