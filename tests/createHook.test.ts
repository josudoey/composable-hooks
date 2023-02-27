import {
  type InstallFunction,
  type SetInstanceFunction,

  type HookContext,
  type CreateHookContextFunction,

  type Hook,
  createHook
} from '..'

describe('createHook', () => {
  let fixtureInstance: any
  let hook: Hook<symbol, any[]>
  let createContext: CreateHookContextFunction<any, any[]>

  beforeEach(() => {
    hook = createHook()
    createContext = hook.createContext
  })

  describe('createContext', () => {
    let context: HookContext<symbol>

    beforeEach(() => {
      context = createContext(fixtureInstance)
    })

    describe('happy path', () => {
      beforeAll(() => {
        fixtureInstance = Symbol('instance')
      })

      test('instance matched', () => {
        expect(context.instance).toStrictEqual(fixtureInstance)
      })
    })
  })

  describe('context', () => {
    let context: HookContext<any>

    beforeEach(() => {
      context = createContext(fixtureInstance)
    })

    describe('context.setInstance', () => {
      let setInstance: SetInstanceFunction<symbol>
      let fixtureArg1: symbol
      let fixtureArg2: symbol
      let fixtureArg3: symbol
      let install: InstallFunction<any>

      beforeEach(() => {
        setInstance = context.setInstance
        setInstance(install, fixtureArg1, fixtureArg2, fixtureArg3)
      })

      describe('installing call setInstance', () => {
        let fixtureNumbers: number[]
        let expectedSum: number
        let otherContexts: Array<HookContext<{ r: number }>>
        const stackSize = 1000

        beforeAll(() => {
          fixtureNumbers = []
          otherContexts = []
          expectedSum = 0
          for (let i = 0; i < stackSize; i++) {
            const r = Math.random()
            fixtureNumbers.push(r)
            expectedSum += r
            otherContexts.push(createContext({ r: 0 }))
          }

          function setInstanceForR (i: number): void {
            otherContexts[i].setInstance((instance: object) => {
              if (i + 1 < fixtureNumbers.length) {
                setInstanceForR(i + 1)
              }

              Object.assign(instance, {
                r: fixtureNumbers[i]
              })
            })
          }

          install = jest.fn(() => { setInstanceForR(0) })
        })

        test('sum matched', () => {
          let sum = 0
          for (let i = 0; i < stackSize; i++) {
            sum += otherContexts[i].instance.r
          }
          expect(sum).toStrictEqual(expectedSum)
        })
      })

      describe('InstallFunction plugin', () => {
        let installFunctionMock: jest.Mock<InstallFunction<any>>

        beforeAll(() => {
          fixtureInstance = Symbol('instance')
          fixtureArg1 = Symbol('arg1')
          fixtureArg2 = Symbol('arg2')
          fixtureArg3 = Symbol('arg3')
          install = installFunctionMock = jest.fn()
        })

        test('installFunctionMock called', () => {
          expect(installFunctionMock).toBeCalled()
        })

        test('instance matched', () => {
          expect(installFunctionMock.mock.calls[0][0]).toStrictEqual(fixtureInstance)
        })

        test('options matched', () => {
          expect(installFunctionMock.mock.calls[0][1]).toStrictEqual(fixtureArg1)
          expect(installFunctionMock.mock.calls[0][2]).toStrictEqual(fixtureArg2)
          expect(installFunctionMock.mock.calls[0][3]).toStrictEqual(fixtureArg3)
        })
      })
    })
  })

  describe('getCurrentInstance', () => {
    let currentInstance: any
    let installMock: jest.Mock

    beforeEach(() => {
      installMock = jest.fn(() => {
        currentInstance = hook.getCurrentInstance()
      })
    })

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.setInstance(installMock)
      })

      test('install called', () => {
        expect(installMock).toBeCalled()
      })

      test('instance matched', () => {
        expect(currentInstance).toStrictEqual(fixtureInstance)
      })
    })

    describe('install error', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        expect(() => fixtureContext.setInstance(() => {
          throw new Error('install error')
        })).toThrowError('install error')
      })

      test('currenct instance is undefined', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        expect(hook.getCurrentInstance()).toBeUndefined()
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside install().')
        consoleMock.mockRestore()
      })
    })

    describe('not installing', () => {
      test('errror matched', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        installMock()
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside install().')
        consoleMock.mockRestore()
      })
    })
  })

  describe('provide', () => {
    let installMock: jest.Mock

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.setInstance(installMock)
      })

      describe('happy path', () => {
        beforeAll(() => {
          installMock = jest.fn(() => {
            hook.provide(Symbol('a'), 'test')
            hook.provide(Symbol('a'), 'test')
          })
        })

        test('plugin called', () => {
          expect(installMock).toBeCalled()
        })
      })

      test('duplicate', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        fixtureContext.setInstance(() => {
          const duplicatedKey = Symbol('duplicatedKey')
          hook.provide(duplicatedKey, 'test1')
          hook.provide(duplicatedKey, 'test2')
        })
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection Symbol(duplicatedKey) duplicate provided')
        consoleMock.mockRestore()
      })
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      hook.provide(Symbol('key'), 'value')
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('provide() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })

  describe('inject', () => {
    let installMock: jest.Mock

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.setInstance(installMock)
      })

      describe('happy path', () => {
        let fixtureKey1: symbol
        let fixtureKey2: symbol
        let fixtureValue1: symbol
        let fixtureValue2: symbol

        beforeAll(() => {
          fixtureKey1 = Symbol('key1')
          fixtureKey2 = Symbol('key2')
          fixtureValue1 = Symbol('value1')
          fixtureValue2 = Symbol('value2')
          installMock = jest.fn(() => {
            hook.provide(fixtureKey1, fixtureValue1)
            hook.provide(fixtureKey2, fixtureValue2)
          })
        })

        test('injection matched', () => {
          expect(() =>
            fixtureContext.setInstance(() => {
              expect(hook.inject(fixtureKey1)).toStrictEqual(fixtureValue1)
              expect(hook.inject(fixtureKey2)).toStrictEqual(fixtureValue2)
            })).not.toThrowError()
        })
      })
    })

    test('injection not found', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      createContext({}).setInstance(() => {
        hook.inject(Symbol('other'))
      })
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection "Symbol(other)" not found.')
      consoleMock.mockRestore()
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      hook.inject(Symbol('error'))
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('inject() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })
})
