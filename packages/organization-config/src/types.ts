/**
 * Represents a type that can be null or undefined, making it optional in use.
 * @template T The type that is being made nullable.
 */
export type NullableType<T> = T | null | undefined
