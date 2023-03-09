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
Object.assign(module.exports, {
  compose,
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
})
