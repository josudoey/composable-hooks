export type InstallFunction<T, UseOptions=any[]> = (instance: T, ...options: UseOptions) => void
export interface Installable<T, UseOptions=any[]> {
  install: Install<T, UseOptions>
}

export type Plugin<T, UseOptions=any[]> = Install<T, UseOptions> | Installable<T, UseOptions>

export type UseFunction<T, UseOptions=any[]> = (plugin: Plugin<T>, ...options: UseOptions) => this
export interface ComposableContext<T, UseOptions=any[]> {
  use: UseFunction<T, UseOptions>
  instance: T
}

export type CreateContextFunction<T, UseOptions=any[]> = (instance: T) => ComposableContext<T, UseOptions>
export interface Composable <T, UseOptions> {
  createContext: CreateContextFunction<T, UseOptions>
  getCurrentInstance: () => T
  provide: <T>(key: string | unique symbol, value: T) => void
  inject: <T>(key: string | unique symbol) => T
}

export declare function createComposable <T=any, UseOptions=any[]> (): Composable<T, UseOptions>
