import {
  type InstallFunction,
  type HookFunction,

  type WrapFunction,
  type GetCurrentInstanceFunction,
  type ProvideFunction,
  type InjectFunction,
  type HookContext,

  createHookContext
} from '..'

describe('createHookContext', () => {
  let fixtureInstance: any
  let context: HookContext<any, any[]>
  let getCurrentInstance: GetCurrentInstanceFunction<any>
  let wrap: WrapFunction<any, any[]>
  let provide: ProvideFunction<any>
  let inject: InjectFunction<any>

  beforeEach(() => {
    context = createHookContext()
    wrap = context.wrap
    getCurrentInstance = context.getCurrentInstance
    provide = context.provide
    inject = context.inject
  })

  describe('createContext', () => {
    let hook: HookFunction<symbol>

    beforeEach(() => {
      hook = wrap(fixtureInstance)
    })

    describe('get instance', () => {
      beforeAll(() => {
        fixtureInstance = Symbol('instance')
      })

      test('instance matched', () => {
        expect(hook()).toStrictEqual(fixtureInstance)
      })
    })
  })

  describe('wrap', () => {
    let hook: HookFunction<symbol>

    beforeEach(() => {
      hook = wrap(fixtureInstance)
    })

    describe('hook', () => {
      let fixtureArg1: symbol
      let fixtureArg2: symbol
      let fixtureArg3: symbol
      let install: InstallFunction<any>

      beforeEach(() => {
        hook(install, fixtureArg1, fixtureArg2, fixtureArg3)
      })

      describe('installing call hook', () => {
        let fixtureNumbers: number[]
        let expectedSum: number
        let randHooks: Array<HookFunction<{ r: number }>>
        const stackSize = 1000

        beforeAll(() => {
          fixtureNumbers = []
          randHooks = []
          expectedSum = 0
          for (let i = 0; i < stackSize; i++) {
            const r = Math.random()
            fixtureNumbers.push(r)
            expectedSum += r
            randHooks.push(wrap({ r: 0 }))
          }

          function setupForR (i: number): void {
            randHooks[i]((instance: object) => {
              if (i + 1 < fixtureNumbers.length) {
                setupForR(i + 1)
              }

              Object.assign(instance, {
                r: fixtureNumbers[i]
              })
            })
          }

          install = jest.fn(() => { setupForR(0) })
        })

        test('sum matched', () => {
          let sum = 0
          for (let i = 0; i < stackSize; i++) {
            const r: number = randHooks[i]().r
            expect(r).toStrictEqual(fixtureNumbers[i])
            sum += r
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
        currentInstance = getCurrentInstance()
      })
    })

    describe('installing', () => {
      let fixtureHook: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureHook = wrap(fixtureInstance)
        fixtureHook(installMock)
      })

      test('install called', () => {
        expect(installMock).toBeCalled()
      })

      test('instance matched', () => {
        expect(currentInstance).toStrictEqual(fixtureInstance)
      })
    })

    describe('install error', () => {
      let fixtureHook: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureHook = wrap(fixtureInstance)
        expect(() => fixtureHook(() => {
          throw new Error('install error')
        })).toThrowError('install error')
      })

      test('currenct instance is undefined', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        expect(getCurrentInstance()).toBeUndefined()
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
      let fixtureHook: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureHook = wrap(fixtureInstance)
        fixtureHook(installMock)
      })

      describe('happy path', () => {
        beforeAll(() => {
          installMock = jest.fn(() => {
            provide(Symbol('a'), 'test')
            provide(Symbol('a'), 'test')
          })
        })

        test('plugin called', () => {
          expect(installMock).toBeCalled()
        })
      })

      test('duplicate', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        fixtureHook(() => {
          const duplicatedKey = Symbol('duplicatedKey')
          provide(duplicatedKey, 'test1')
          provide(duplicatedKey, 'test2')
        })
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection Symbol(duplicatedKey) duplicate provided')
        consoleMock.mockRestore()
      })
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      provide(Symbol('key'), 'value')
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('provide() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })

  describe('inject', () => {
    let installMock: jest.Mock

    describe('installing', () => {
      let hook: HookFunction<symbol>
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        hook = wrap(fixtureInstance)
        hook(installMock)
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
            context.provide(fixtureKey1, fixtureValue1)
            context.provide(fixtureKey2, fixtureValue2)
          })
        })

        test('injection matched', () => {
          expect(() =>
            hook(() => {
              expect(context.inject(fixtureKey1)).toStrictEqual(fixtureValue1)
              expect(context.inject(fixtureKey2)).toStrictEqual(fixtureValue2)
            })).not.toThrowError()
        })
      })
    })

    test('injection not found', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      wrap(Symbol('dummy'))(() => {
        context.inject(Symbol('other'))
      })
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection "Symbol(other)" not found.')
      consoleMock.mockRestore()
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      inject(Symbol('error'))
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('inject() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })
})
