export type InstallFunction<T, Options=any[]> = (instance: T, ...options: Options) => void
export type HookFunction<T, Options=any[]> = (install?: InstallFunction<T>, ...options: Options) => T

export type WrapFunction<T, Options=any[]> = (instance: T) => HookFunction<T, Options>
export type GetCurrentInstanceFunction<T> = () => T
export type ProvideFunction<T> = (key: string | unique symbol, value: T) => void
export type InjectFunction<T> = (key: string | unique symbol) => T

export interface HooksContext <T, Options> {
  wrap: WrapFunction<T, Options>
  getCurrentInstance: () => T
  provide: ProvideFunction<any>
  inject: InjectFunction<any>
}

export declare function createHooksContext <T=any, Options=any[]> (): HooksContext<T, Options>
