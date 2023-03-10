import {
  type GetCurrentInstanceFunction,
  type ProvideFunction,
  type InjectFunction,

  type InstallFunction,
  type Installable,
  type Plugin,

  type UseFunction,
  type ComposableContext,

  type CreateComposableContextFunction,
  type Composable,

  createComposable
} from '../'

describe('createComposable', () => {
  let fixtureInstance: any
  let composable: Composable<symbol, any[]>
  let createContext: CreateComposableContextFunction<any, any[]>
  let getCurrentInstance: GetCurrentInstanceFunction<any>
  let provide: ProvideFunction<any>
  let inject: InjectFunction<any>

  beforeEach(() => {
    composable = createComposable()
    createContext = composable.createContext
    getCurrentInstance = composable.getCurrentInstance
    provide = composable.provide
    inject = composable.inject
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
        expect(context.wrap(getCurrentInstance)()).toStrictEqual(fixtureInstance)
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
          const consoleMock = jest.spyOn(console, 'error').mockImplementation()
          context.use(plugin)
          expect(consoleMock.mock.calls[0][0]).toStrictEqual('plugin has already been applied to target.')
          consoleMock.mockRestore()
        })
      })

      describe('installing call use', () => {
        let fixtureOtherSymbol: symbol
        let otherContext: ComposableContext<{ symbol: symbol }>
        beforeAll(() => {
          fixtureOtherSymbol = Symbol('other')
          plugin = jest.fn(() => {
            otherContext = createContext({})
            otherContext.use((instance) => {
              instance.symbol = fixtureOtherSymbol
            })
          })
        })

        test('result matched', () => {
          expect(plugin).toBeCalled()
          expect(otherContext.wrap(getCurrentInstance)().symbol).toStrictEqual(fixtureOtherSymbol)
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
        currentInstance = getCurrentInstance()
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
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        expect(getCurrentInstance()).toBeUndefined()
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside hook().')
        consoleMock.mockRestore()
      })
    })

    describe('not installing', () => {
      test('errror matched', () => {
        const consoleMock = jest.spyOn(console, 'error').mockImplementation()
        pluginMock()
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside hook().')
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
            provide(Symbol('a'), 'test')
            provide(Symbol('a'), 'test')
          })
        })

        test('plugin called', () => {
          expect(pluginMock).toBeCalled()
        })
      })
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      provide(Symbol('key'), 'value')
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('provide() can only be used inside hook().')
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
            provide(fixtureKey1, fixtureValue1)
            provide(fixtureKey2, fixtureValue2)
          })
        })

        test('injection matched', () => {
          expect(() =>
            fixtureContext.use(() => {
              expect(inject(fixtureKey1)).toStrictEqual(fixtureValue1)
              expect(inject(fixtureKey2)).toStrictEqual(fixtureValue2)
            })).not.toThrowError()
        })
      })
    })

    test('injection not found', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      createContext({}).use(() => {
        inject(Symbol('other'))
      })
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection "Symbol(other)" not found.')
      consoleMock.mockRestore()
    })

    test('not installing', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      inject(Symbol('error'))
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('inject() can only be used inside hook().')
      consoleMock.mockRestore()
    })
  })
})
