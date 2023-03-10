const { create, provide, inject, getCurrentInstance } = require('./createHooksContext.js')()

function compose (composer) {
  const ctx = { provide, inject }
  return create(ctx)(composer)(ctx)
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
