const { create, provide, inject, getCurrentInstance } = require('./createHooksContext.js')()

function compose (hook) {
  const ctx = { provide, inject }
  return create(ctx)(hook)(ctx)
}

const wrap = create(null)
Object.assign(module.exports, {
  compose,
  wrap,
  create,
  provide,
  inject,
  getCurrentInstance
})
