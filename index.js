module.exports.createHooksContext = require('./lib/createHooksContext.js')
module.exports.createComposable = require('./lib/createComposable.js')
const {
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
} = require('./lib/defaultHooksContext.js')
Object.assign(module.exports, {
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
})
