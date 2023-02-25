import {
  createComposable,
  type Composable,
  type Useable,
  type Plugin
} from '../'

describe('createComposable', () => {
  let composable: Composable<symbol>
  let createUseable: (instance: symbol) => Useable<symbol>
  let getCurrentInstance: () => symbol
  let provide: <T>(key: symbol, value: T) => void
  let inject: <T=any>(key: symbol) => T

  beforeEach(function () {
    composable = createComposable()
    createUseable = composable.createUseable
    getCurrentInstance = composable.getCurrentInstance
    provide = composable.provide
    inject = composable.inject
  })

  describe('createUseable', () => {
    let fixtureInstance: symbol
    let fixtureArg1: symbol
    let fixtureArg2: symbol
    let fixtureArg3: symbol
    let useable: Useable<symbol>

    beforeEach(() => {
      fixtureInstance = Symbol('instance')
      fixtureArg1 = Symbol('fixtureArg1')
      fixtureArg2 = Symbol('fixtureArg2')
      fixtureArg3 = Symbol('fixtureArg3')
      useable = createUseable(fixtureInstance)
    })

    test('plugin install args matched', () => {
      const plugin: Plugin<symbol> = (instance: any, arg1: any, arg2: any, arg3: any) => {
        expect(instance).toStrictEqual(fixtureInstance)
        expect(arg1).toStrictEqual(fixtureArg1)
        expect(arg2).toStrictEqual(fixtureArg2)
        expect(arg3).toStrictEqual(fixtureArg3)
      }
      useable.use(plugin, fixtureArg1, fixtureArg2, fixtureArg3)
    })

    test('plugin installable args matched', () => {
      const plugin: Plugin<symbol> = {
        install: (instance: any, arg1: any, arg2: any, arg3: any) => {
          expect(instance).toStrictEqual(fixtureInstance)
          expect(arg1).toStrictEqual(fixtureArg1)
          expect(arg2).toStrictEqual(fixtureArg2)
          expect(arg3).toStrictEqual(fixtureArg3)
        }
      }
      useable.use(plugin, fixtureArg1, fixtureArg2, fixtureArg3)
    })
  })

  describe('getCurrentInstance', () => {
    describe('installing', () => {
      let fixtureInstance: symbol
      let fixtureUseable: Useable<symbol>

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureUseable = createUseable(fixtureInstance)
      })

      test('instance matched', () => {
        fixtureUseable.use(() => {
          expect(getCurrentInstance()).toStrictEqual(fixtureInstance)
        })
      })
    })

    test('toThrowError', function () {
      expect(() => getCurrentInstance())
        .toThrowError('getCurrentInstance() can only be used inside install().')
    })
  })

  describe('provide', () => {
    describe('installing', () => {
      let fixtureInstance: symbol
      let fixtureUseable: Useable<symbol>

      beforeEach(() => {
        fixtureInstance = Symbol('instance')
        fixtureUseable = createUseable(fixtureInstance)
      })

      test('happy path', () => {
        expect(() =>
          fixtureUseable.use(() => {
            provide(Symbol('a'), 'test')
            provide(Symbol('a'), 'test')
          })).not.toThrowError()
      })

      test('duplicate', () => {
        expect(() =>
          fixtureUseable.use(() => {
            const duplicatedKey = Symbol('duplicatedKey')
            provide(duplicatedKey, 'test1')
            provide(duplicatedKey, 'test2')
          }))
          .toThrowError('injection Symbol(duplicatedKey) duplicate provided')
      })
    })

    test('not installing', function () {
      expect(() => { provide(Symbol('key'), 'value') })
        .toThrowError('provide() can only be used inside install().')
    })
  })

  describe('inject', () => {
    describe('installing', () => {
      let fixtureKey1: symbol
      let fixtureKey2: symbol
      let fixtureValue1: symbol
      let fixtureValue2: symbol
      let fixtureUseable: Useable<symbol>

      beforeEach(() => {
        fixtureKey1 = Symbol('key1')
        fixtureKey2 = Symbol('key2')
        fixtureValue1 = Symbol('value1')
        fixtureValue2 = Symbol('value2')
        fixtureUseable = createUseable(Symbol('instance'))
        fixtureUseable.use(() => {
          provide(fixtureKey1, fixtureValue1)
          provide(fixtureKey2, fixtureValue2)
        })
      })

      test('injection matched', () => {
        expect(() =>
          fixtureUseable.use(() => {
            expect(inject(fixtureKey1)).toStrictEqual(fixtureValue1)
            expect(inject(fixtureKey2)).toStrictEqual(fixtureValue2)
          })).not.toThrowError()
      })

      test('injection not found', () => {
        expect(() =>
          fixtureUseable.use(() => {
            inject(Symbol('other'))
          })).toThrowError('injection "Symbol(other)" not found.')
      })
    })

    test('not installing', function () {
      expect(() => inject(Symbol('error')))
        .toThrowError('inject() can only be used inside install().')
    })
  })
})
