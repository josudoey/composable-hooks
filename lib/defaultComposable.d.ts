import { type ComposableContext } from './createComposable'

export declare function createContext<T, UseOptions=any[]> (instance: T): ComposableContext<T, UseOptions>
export declare function getCurrentInstance<T> (): T
export declare function provide<T> (key: string | unique symbol, value: T): void
export declare function inject <T> (key: string | unique symbol): T
