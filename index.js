module.exports.createHooksContext = require('./lib/createHooksContext.js')
module.exports.createComposable = require('./lib/createComposable.js')
const {
  compose,
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
} = require('./lib/defaultHooksContext.js')

const {
  createContext
} = require('./lib/defaultComposable.js')
Object.assign(module.exports, {
  compose,
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance,
  createContext
})
