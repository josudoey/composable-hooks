import defaultHooksContext from './lib/defaultHooksContext.js'
export { default as createHooksContext } from './lib/createHooksContext.js'
export { default as createComposable } from './lib/createComposable.js'
const { create, getCurrentInstance, provide, inject } = defaultHooksContext
export { create, getCurrentInstance, provide, inject }
