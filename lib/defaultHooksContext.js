const { create, provide, inject, getCurrentInstance } = require('./createHooksContext.js')()
const wrap = create(null)
Object.assign(module.exports, {
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
})
