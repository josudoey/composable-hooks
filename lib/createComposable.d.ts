import { type InstallFunction } from './createHook'

export interface Installable<T, Options=any[]> {
  install: Install<T, Options>
}

export type Plugin<T, UseOptions=any[]> = InstallFunction<T, UseOptions> | Installable<T, UseOptions>

export type UseFunction<T, UseOptions=any[]> = (plugin: Plugin<T>, ...options: UseOptions) => this
export interface ComposableContext<T, UseOptions=any[]> {
  use: UseFunction<T, UseOptions>
  instance: T
}

export type CreateComposableContextFunction<T, UseOptions=any[]> = (instance: T) => ComposableContext<T, UseOptions>
export interface Composable <T, UseOptions> {
  createContext: CreateComposableContextFunction<T, UseOptions>
  getCurrentInstance: () => T
  provide: <T>(key: string | unique symbol, value: T) => void
  inject: <T>(key: string | unique symbol) => T
}

export declare function createComposable <T=any, UseOptions=any[]> (): Composable<T, UseOptions>
