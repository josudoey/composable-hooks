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

        test('error match', () => {
          expect(() => context.use(plugin, fixtureArg1, fixtureArg2, fixtureArg3))
            .toThrowError('plugin has already been applied to target.')
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

    describe('not installing', () => {
      test('errror matched', () => {
        expect(() => pluginMock())
          .toThrowError('getCurrentInstance() can only be used inside install().')
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
        expect(() =>
          fixtureContext.use(() => {
            const duplicatedKey = Symbol('duplicatedKey')
            composable.provide(duplicatedKey, 'test1')
            composable.provide(duplicatedKey, 'test2')
          }))
          .toThrowError('injection Symbol(duplicatedKey) duplicate provided')
      })
    })

    test('not installing', function () {
      expect(() => { composable.provide(Symbol('key'), 'value') })
        .toThrowError('provide() can only be used inside install().')
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

        test('injection not found', () => {
          expect(() =>
            fixtureContext.use(() => {
              composable.inject(Symbol('other'))
            })).toThrowError('injection "Symbol(other)" not found.')
        })
      })
    })

    test('not installing', function () {
      expect(() => composable.inject(Symbol('error')))
        .toThrowError('inject() can only be used inside install().')
    })
  })
})
