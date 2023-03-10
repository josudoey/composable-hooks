import defaultHooksContext from './lib/defaultHooksContext.js'
import defaultComposable from './lib/defaultComposable.js'
export { default as createHooksContext } from './lib/createHooksContext.js'
export { default as createComposable } from './lib/createComposable.js'
const { compose, wrap, create, getCurrentInstance, provide, inject } = defaultHooksContext
const { createContext } = defaultComposable
export { compose, wrap, create, getCurrentInstance, provide, inject, createContext }
