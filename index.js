const defaultHooksContext = require('./lib/defaultHooksContext.js')
module.exports.createHooksContext = require('./lib/createHooksContext.js')
module.exports.createComposable = require('./lib/createComposable.js')
module.exports.create = defaultHooksContext.create
module.exports.getCurrentInstance = defaultHooksContext.getCurrentInstance
module.exports.provide = defaultHooksContext.provide
module.exports.inject = defaultHooksContext.inject
