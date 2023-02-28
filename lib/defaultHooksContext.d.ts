import {
  type WrapFunction,
  type HookFunction,
  type HooksFunction
} from './createHooksContext'
export declare function wrap (hook: HookFunction<T, Options>): HooksFunction<T, Options>
export declare function create <T> (instance: T): WrapFunction
export declare function getCurrentInstance<T> (): T
export declare function provide<T> (key: string | unique symbol, value: T): void
export declare function inject <T> (key: string | unique symbol): T
