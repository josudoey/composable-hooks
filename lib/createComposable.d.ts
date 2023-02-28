import {
  type HookFunction,
  type InstallFunction,
  type GetCurrentInstanceFunction,
  type ProvideFunction,
  type InjectFunction
} from './createHookContext'

export interface Installable<T, Options=any[]> {
  install: Install<T, Options>
}

export type Plugin<T, UseOptions=any[]> = InstallFunction<T, UseOptions> | Installable<T, UseOptions>

export type UseFunction<T, UseOptions=any[]> = (plugin: Plugin<T>, ...options: UseOptions) => this
export interface ComposableContext<T, UseOptions=any[]> {
  hook: HookFunction<T, UseOptions>
  use: UseFunction<T, UseOptions>
}

export type CreateComposableContextFunction<T, UseOptions=any[]> = (instance: T) => ComposableContext<T, UseOptions>
export interface Composable <T, UseOptions> {
  createContext: CreateComposableContextFunction<T, UseOptions>
  getCurrentInstance: GetCurrentInstanceFunction<T>
  provide: ProvideFunction<any>
  inject: InjectFunction<any>
}

export declare function createComposable <T=any, UseOptions=any[]> (): Composable<T, UseOptions>
