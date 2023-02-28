import {
  type WrapFunction,
  type HookFunction,
  type HooksFunction,

  create,
  getCurrentInstance,
  provide,
  inject
} from '..'

describe('defaultHooksContext', () => {
  let fixtureInstance: any

  describe('wrap', () => {
    let wrap: WrapFunction

    beforeEach(() => {
      wrap = create(fixtureInstance)
    })

    describe('hook', () => {
      let fixtureArg0: symbol
      let fixtureArg1: symbol
      let fixtureArg2: symbol
      let hook: HookFunction
      let hooks: HooksFunction<any>

      beforeEach(() => {
        hooks = wrap(hook)
      })

      describe('hooks', () => {
        let hookMock: jest.Mock
        beforeAll(() => {
          fixtureInstance = Symbol('instance')
          fixtureArg0 = Symbol('arg1')
          fixtureArg1 = Symbol('arg2')
          fixtureArg2 = Symbol('arg3')
          hookMock = hook = jest.fn((arg1, arg2, arg3) => {
            return { arg1, arg2, arg3 }
          })
        })

        beforeEach(() => {
          hooks(fixtureArg0, fixtureArg1, fixtureArg2)
        })

        test('hookMock called', () => {
          expect(hookMock).toBeCalled()
        })

        test('options matched', () => {
          expect(hookMock.mock.calls[0][0]).toStrictEqual(fixtureArg0)
          expect(hookMock.mock.calls[0][1]).toStrictEqual(fixtureArg1)
          expect(hookMock.mock.calls[0][2]).toStrictEqual(fixtureArg2)
        })
      })

      describe('hooks call hooks', () => {
        let fixtureNumbers: number[]
        let expectedSum: number
        let randHooks: Array<HooksFunction<{ r: number }>>
        const stackSize = 1000

        beforeAll(() => {
          fixtureNumbers = []
          randHooks = []
          expectedSum = 0
          for (let i = 0; i < stackSize; i++) {
            const r = Math.random()
            fixtureNumbers.push(r)
            expectedSum += r
          }

          function setRandHooks (i: number): void {
            if (i > 0) {
              setRandHooks(i - 1)
            }

            const rand = { r: fixtureNumbers[i] }
            const wrap = create(rand)
            randHooks.push(wrap(() => {
              return rand
            }))
          }

          hook = () => { setRandHooks(stackSize - 1) }
        })

        beforeEach(() => {
          hooks()
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
    })
  })

  describe('getCurrentInstance', () => {
    let wrap: WrapFunction
    let currentInstance: any
    let getCurrentInstanceHooks: any

    beforeAll(() => {
      fixtureInstance = Symbol('instance')
      wrap = create(fixtureInstance)
    })

    beforeEach(() => {
      currentInstance = getCurrentInstanceHooks()
    })

    describe('getCurrentInstanceHooksHooks', () => {
      beforeAll(() => {
        getCurrentInstanceHooks = wrap(getCurrentInstance)
      })
      test('currentInstance mathed', () => {
        expect(currentInstance).toStrictEqual(fixtureInstance)
      })
    })

    describe('outside hooks', () => {
      let consoleMock: jest.SpyInstance
      beforeAll(() => {
        consoleMock = jest.spyOn(console, 'error').mockImplementation()
        getCurrentInstanceHooks = getCurrentInstance
      })
      afterAll(() => {
        consoleMock.mockRestore()
      })
      test('errror matched', () => {
        expect(consoleMock.mock.calls[0][0]).toStrictEqual('getCurrentInstance() can only be used inside hook().')
      })
    })
  })

  describe('provide', () => {
    let wrap: WrapFunction

    beforeEach(() => {
      fixtureInstance = Symbol('instance')
      wrap = create(fixtureInstance)
    })

    describe('inside hooks', () => {
      let hook: HookFunction<void>
      let hooks: HooksFunction<void>

      beforeEach(() => {
        hooks = wrap(hook)
        hooks()
      })

      describe('happy path', () => {
        let hookMock: jest.Mock

        beforeAll(() => {
          hookMock = hook = jest.fn(() => {
            provide(Symbol('a'), 'test')
            provide(Symbol('a'), 'test')
          })
        })

        test('hook called', () => {
          expect(hookMock).toBeCalled()
        })
      })
    })

    test('outside hooks', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      provide(Symbol('key'), 'value')
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('provide() can only be used inside hook().')
      consoleMock.mockRestore()
    })
  })

  describe('inject', () => {
    let wrap: WrapFunction

    beforeEach(() => {
      fixtureInstance = Symbol('instance')
      wrap = create(fixtureInstance)
    })

    describe('inside hooks', () => {
      let hook: HookFunction<void>
      let hooks: HooksFunction<void>

      beforeEach(() => {
        hooks = wrap(hook)
        hooks()
      })

      describe('happy path', () => {
        let fixtureKey1: symbol
        let fixtureKey2: symbol
        let fixtureValue1: symbol
        let fixtureValue2: symbol
        let hookMock: jest.Mock

        beforeAll(() => {
          fixtureKey1 = Symbol('key1')
          fixtureKey2 = Symbol('key2')
          fixtureValue1 = Symbol('value1')
          fixtureValue2 = Symbol('value2')
          hookMock = hook = jest.fn(() => {
            provide(fixtureKey1, fixtureValue1)
            provide(fixtureKey2, fixtureValue2)
          })
        })

        test('hook called', () => {
          expect(hookMock).toBeCalled()
        })

        test('injection matched', () => {
          expect(() =>
            wrap(() => {
              expect(inject(fixtureKey1)).toStrictEqual(fixtureValue1)
              expect(inject(fixtureKey2)).toStrictEqual(fixtureValue2)
            })()).not.toThrowError()
        })
      })

      describe('injection not found', () => {
        let consoleMock: jest.SpyInstance

        beforeAll(() => {
          consoleMock = jest.spyOn(console, 'error').mockImplementation()
          hook = jest.fn(() => {
            inject(Symbol('other'))
          })
        })

        afterAll(() => {
          consoleMock.mockRestore()
        })

        test('error message matched', () => {
          expect(consoleMock.mock.calls[0][0]).toStrictEqual('injection "Symbol(other)" not found.')
        })
      })
    })

    test('outside hooks', () => {
      const consoleMock = jest.spyOn(console, 'error').mockImplementation()
      inject(Symbol('error'))
      expect(consoleMock.mock.calls[0][0]).toStrictEqual('inject() can only be used inside hook().')
      consoleMock.mockRestore()
    })
  })
})
