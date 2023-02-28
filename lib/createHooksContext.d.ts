export type HookFunction<T=any, Options=any> = (...options: Options) => T
export type HooksFunction<T, Options=any> = (...options: Options) => T
export type WrapFunction = (hook: HookFunction<T, Options>) => HooksFunction<T, Options>
export type CreateFunction<T> = (instance: T) => WrapFunction

export type GetCurrentInstanceFunction<T> = () => T
export type ProvideFunction<T> = (key: string | unique symbol, value: T) => void
export type InjectFunction<T> = (key: string | unique symbol) => T

export interface HooksContext <T> {
  create: CreateFunction<T>
  getCurrentInstance: () => T
  provide: ProvideFunction<any>
  inject: InjectFunction<any>
}

export declare function createHooksContext <T=any, Options=any[]> (): HooksContext<T, Options>
