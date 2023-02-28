import {
  type WrapFunction
} from './createHooksContext'
export declare function create <T> (instance: T): WrapFunction
export declare function getCurrentInstance<T> (): T
export declare function provide<T> (key: string | unique symbol, value: T): void
export declare function inject <T> (key: string | unique symbol): T
