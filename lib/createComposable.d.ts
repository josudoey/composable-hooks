export type InstallFunction<T, UseOptions=any[]> = (instance: T, ...options: UseOptions) => void
export interface Installable<T, UseOptions=any[]> {
  install: Install<T, UseOptions>
}

export type Plugin<T, UseOptions=any[]> = Install<T, UseOptions> | Installable<T, UseOptions>

export type UseFunction<T, UseOptions=any[]> = (plugin: Plugin<T>, ...options: UseOptions) => this
export interface ComposableContext<T, Options=any[]> {
  use: UseFunction<T, Options>
}

export type SetupInstanceFunction<T, CreateOptions=any[], UseOptions=any[]> = (ctx: ComposableContext<T, UseOptions>, ...options: CreateOptions) => T

export type CreateFunction<T, CreateOptions=any[]> = (...options: CreateOptions) => T
export interface Composable <T, CreateOptions> {
  getCurrentInstance: () => T
  provide: <T>(key: string | unique symbol, value: T) => void
  inject: <T>(key: string | unique symbol) => T
  create: CreateFunction<T, CreateOptions>
}

export declare function createComposable <T=any, CreateOptions=any[], UseOptions=any[]> (setup: SetupInstanceFunction<T, CreateOptions, UseOptions>): Composable<T, CreateOptions>
