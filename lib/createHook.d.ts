export type InstallFunction<T, Options=any[]> = (instance: T, ...options: Options) => void
export type SetInstanceFunction<T, Options=any[]> = (install: InstallFunction<T>, ...options: Options) => this

export interface HookContext<T, Options=any[]> {
  setInstance: SetInstanceFunction<T, Options>
  instance: T
}

export type CreateHookContextFunction<T, Options=any[]> = (instance: T) => HookContext<T, Options>
export interface Hook <T, Options> {
  createContext: CreateHookContextFunction<T, Options>
  getCurrentInstance: () => T
  provide: <T>(key: string | unique symbol, value: T) => void
  inject: <T>(key: string | unique symbol) => T
}

export declare function createHook <T=any, Options=any[]> (): Hook<T, Options>
