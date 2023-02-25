export declare function Install<T, InstallOptions> (instance: T, ...options: InstallOptions): void
export interface Installable<T, InstallOptions> {
  install: Install<T, InstallOptions>
}

export type Plugin<T=any, InstallOptions=any[]> = Install<T, InstallOptions> | Installable<T, InstallOptions>

export declare function Use<T> (plugin: Plugin<T>): this

export interface Useable<T> {
  use: Use<T>
}

export interface Composable <T=any> {
  getCurrentInstance: () => T
  provide: <T>(key: string | unique symbol, value: T) => void
  inject: <T>(key: string | unique symbol) => T
  createUseable: (instance: T) => Useable<T>
}

export declare function createComposable <T=any> (): Composable<T>
