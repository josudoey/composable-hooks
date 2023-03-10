import {
  type WrapFunction,
  type HookFunction,
  type HooksFunction,
  type ProvideFunction,
  type InjectFunction
} from './createHooksContext'

export interface Injector<T=any> {
  inject: InjectFunction<T>
}

export interface Provider<T=any> {
  provide: ProvideFunction<T>
}
export type ComposeContext<ProvideType=any, InjectType=any> = Provider<ProvideType> & Injector<InjectType>
export type ComposerFunction<ReturnType=any, ProvideType=any, InjectType=any> = (ctx: ComposeContext<ProvideType, InjectType>) => ReturnType

export declare function compose<T> (composer: ComposerFunction<T>): T
export declare function wrap (hook: HookFunction<T, Options>): HooksFunction<T, Options>
export declare function create <T> (instance: T): WrapFunction
export declare function getCurrentInstance<T> (): T
export declare function provide<T> (key: string | unique symbol, value: T): void
export declare function inject <T> (key: string | unique symbol): T
