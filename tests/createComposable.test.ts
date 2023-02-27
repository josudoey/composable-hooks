import {
  type InstallFunction,
  type Installable,
  type Plugin,

  type UseFunction,
  type ComposableContext,

  type CreateContextFunction,
  type Composable,

  createComposable
} from '../'

describe('createComposable', () => {
  let fixtureInstance: any
  let composable: Composable<symbol, any[]>
  let createContext: CreateContextFunction<any, any[]>

  beforeEach(() => {
    composable = createComposable()
    createContext = composable.createContext
  })

  describe('createContext', () => {
    let context: ComposableContext<symbol>

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
    let context: ComposableContext<any>

    beforeEach(() => {
      context = createContext(fixtureInstance)
    })

    describe('context.use', () => {
      let use: UseFunction<any>
      let fixtureArg1: symbol
      let fixtureArg2: symbol
      let fixtureArg3: symbol
      let plugin: Plugin<any>

      beforeEach(() => {
        use = context.use
        use(plugin, fixtureArg1, fixtureArg2, fixtureArg3)
      })

      describe('already been applied', () => {
        beforeAll(() => {
          plugin = jest.fn()
        })

        test('error matched', () => {
          const consoleMock = jest.spyOn(console, 'error')
          context.use(plugin)
          expect(consoleMock.mock.calls[0][0]).toStrictEqual('plugin has already been applied to target.')
          consoleMock.mockRestore()
        })
      })

      describe('installing call use', () => {
        let consoleMock: jest.SpyInstance
        beforeAll(() => {
          consoleMock = jest.spyOn(console, 'error')
          plugin = jest.fn(() => { use(() => {}) })
        })
        afterAll(() => {
          consoleMock.mockRestore()
        })

        test('error matched', () => {
          expect(consoleMock.mock.calls[0][0]).toStrictEqual('plugin is currently being installed to the target.')
        })
      })

      describe('InstallFunction plugin', () => {
        let installFunctionMock: jest.Mock<InstallFunction<any>>

        beforeAll(() => {
          fixtureInstance = Symbol('instance')
          fixtureArg1 = Symbol('arg1')
          fixtureArg2 = Symbol('arg2')
          fixtureArg3 = Symbol('arg3')
          plugin = installFunctionMock = jest.fn()
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

      describe('Installable plugin', () => {
        let installable: Installable<any>
        let installFunctionMock: jest.Mock

        beforeAll(() => {
          fixtureInstance = Symbol('instance')
          fixtureArg1 = Symbol('arg1')
          fixtureArg2 = Symbol('arg2')
          fixtureArg3 = Symbol('arg3')
          installFunctionMock = jest.fn()
          installable = { install: installFunctionMock }
          plugin = installable
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
    let pluginMock: jest.Mock

    beforeEach(() => {
      pluginMock = jest.fn(() => {
        currentInstance = composable.getCurrentInstance()
      })
    })

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.use(pluginMock)
      })

      test('plugin called', () => {
        expect(pluginMock).toBeCalled()
      })

      test('instance matched', () => {
        expect(currentInstance).toStrictEqual(fixtureInstance)
      })
    })

    describe('plugin install error', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        expect(() => fixtureContext.use(() => {
          throw new Error('plugin install error')
        })).toThrowError('plugin install error')
      })

      test('currenct instance is undefined', () => {
        expect(composable.getCurrentInstance()).toBeUndefined()
      })
    })

    describe('not installing', () => {
      test('errror matched', () => {
        const consoleMock = jest.spyOn(console, 'error')
        pluginMock()
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside install().')
        consoleMock.mockRestore()
      })
    })
  })

  describe('provide', () => {
    let pluginMock: jest.Mock

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.use(pluginMock)
      })

      describe('happy path', () => {
        beforeAll(() => {
          pluginMock = jest.fn(() => {
            composable.provide(Symbol('a'), 'test')
            composable.provide(Symbol('a'), 'test')
          })
        })

        test('plugin called', () => {
          expect(pluginMock).toBeCalled()
        })
      })

      test('duplicate', () => {
        const consoleMock = jest.spyOn(console, 'error')
        fixtureContext.use(() => {
          const duplicatedKey = Symbol('duplicatedKey')
          composable.provide(duplicatedKey, 'test1')
          composable.provide(duplicatedKey, 'test2')
        })
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection Symbol(duplicatedKey) duplicate provided')
        consoleMock.mockRestore()
      })
    })

    test('not installin', () => {
      const consoleMock = jest.spyOn(console, 'error')
      composable.provide(Symbol('key'), 'value')
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('provide() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })

  describe('inject', () => {
    let pluginMock: jest.Mock

    describe('installing', () => {
      let fixtureContext: any
      let fixtureInstance: symbol

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureContext = createContext(fixtureInstance)
        fixtureContext.use(pluginMock)
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
          pluginMock = jest.fn(() => {
            composable.provide(fixtureKey1, fixtureValue1)
            composable.provide(fixtureKey2, fixtureValue2)
          })
        })

        test('injection matched', () => {
          expect(() =>
            fixtureContext.use(() => {
              expect(composable.inject(fixtureKey1)).toStrictEqual(fixtureValue1)
              expect(composable.inject(fixtureKey2)).toStrictEqual(fixtureValue2)
            })).not.toThrowError()
        })
      })
    })

    test('injection not found', () => {
      const consoleMock = jest.spyOn(console, 'error')
      createContext({}).use(() => {
        composable.inject(Symbol('other'))
      })
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection "Symbol(other)" not found.')
      consoleMock.mockRestore()
    })

    test('not installin', () => {
      const consoleMock = jest.spyOn(console, 'error')
      composable.inject(Symbol('error'))
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('inject() can only be used inside install().')
      consoleMock.mockRestore()
    })
  })
})
