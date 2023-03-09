import defaultHooksContext from './lib/defaultHooksContext.js'
export { default as createHooksContext } from './lib/createHooksContext.js'
export { default as createComposable } from './lib/createComposable.js'
const { compose, wrap, create, getCurrentInstance, provide, inject } = defaultHooksContext
export { compose, wrap, create, getCurrentInstance, provide, inject }
