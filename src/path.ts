type Key = string | number

const pathsSym = Symbol('PathsSym')
const arraySym = Symbol('arraySym')
const inspectSym = Symbol.for('nodejs.util.inspect.custom')

const dottedLiteralRegex = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/
const indexLiteralRegex = /^[0-9]+$/

/**
 * Returns string representation of a path.
 * @param path - The path to render as an array of keys.
 * @returns A string representation of the path (e.g., `$.a.b` or `$.a[2]`).
 */
const pathToString = (path: Key[]): string =>
  '$' + path
    .map(x =>
      dottedLiteralRegex.test(String(x))
        ? `.${x}`
        : indexLiteralRegex.test(String(x))
          ? `[${x}]`
          : `['${x}']`)
    .join('')

// Define callable signature for Path in a separate interface because
// TypeScript does not support callable classes directly.
interface CallablePath extends Path {
  /**
   * Resolves the path against an object.
   * @param value - The object to resolve the path against.
   * @returns The value at the path, or `undefined` if not found.
   */
  (value: any): any
}

/**
 * Path is a utility class for dynamic construction of paths to access object properties.
 * Supports dotted (e.g., `$.a.b`) and indexed (e.g., `$.a[2].c`) notation.
 * Paths are immutable, equal by value, iterable, and callable.
 * @example
 * const $ = new Path()
 * const path = $.a.b.c
 * $.a.b.c === path // true
 * path({ a: { b: { c: 3 } } }) // 3
 * [...path] // ['a', 'b', 'c']
 */
export class Path {
  [key: Key]: Path
  [Symbol.iterator]!: () => IterableIterator<Key>
  [Symbol.toPrimitive]!: () => string
  [inspectSym]!: (_depth: number, options: any, _inspect: any) => string

  /**
   * Creates a new Path instance.
   * @param path - Optional array of keys to initialize the path.
   */
  constructor(path: Key[] = []) {
    const pathString = pathToString(path)
    /**
     * Resolves the path against an object.
     * @param obj - The object to resolve the path against.
     * @returns The value at the path, or `undefined` if not found.
     */
    const target: CallablePath = ((obj) => {
      let current = obj
      for (const key of path) {
        if (current == null) {
          return undefined
        }
        current = current[key]
      }
      return current
    }) as CallablePath

    Object.setPrototypeOf(target, Path.prototype)

      ; (target as any)[arraySym] = path
      ; (target as any)[pathsSym] = new Map<Key, Path>()
      ; (target as any)[Symbol.iterator] = () => path[Symbol.iterator]()
      ; (target as any)[Symbol.toPrimitive] = () => pathString
      ; (target as any)[inspectSym] = (_depth: number, options: any, _inspect: any) =>
        options.stylize(pathString, 'special')

    return new Proxy(target, {
      get: (obj: CallablePath, prop: Key | symbol): typeof prop extends symbol ? any : Path => {
        if (typeof prop === 'symbol') return (obj as any)[prop]
        const paths = (obj as any)[pathsSym]
        if (!paths.has(prop)) paths.set(prop, new Path([...path, prop]))
        return paths.get(prop)!
      }
    })
  }

  /**
   * Converts a Path instance to a callable function.
   * @param path - The Path instance to convert.
   * @returns A callable Path that resolves values.
   * @example
   * const $ = new Path()
   * Path.callable($.a.b)({a: {b: 42}}) // 42
   */
  static callable(path: Path): CallablePath {
    return path as CallablePath
  }

  /**
   * Checks if a value is a Path instance.
   * @param x - The value to check.
   * @returns `true` if the value is a Path instance, `false` otherwise.
   * @example
   * const $ = new Path()
   * Path.isPath($.a) // true
   * Path.isPath({}) // false
   */
  static isPath(x: any): x is Path {
    return x instanceof Path
  }

  /**
   * Returns the underlying path as an array of keys.
   * @param path - The Path instance.
   * @returns An array of keys representing the path.
   * @example
   * const $ = new Path()
   * Path.array($.a.b) // ['a', 'b']
   */
  static array(path: Path): Key[] {
    return (path as any)[arraySym]
  }

  /**
   * Concatenates paths or key arrays to create a new Path.
   * @param path - The base Path instance.
   * @param paths - Additional Path instances or key arrays to concatenate.
   * @returns A new Path with combined keys.
   * @example
   * const $ = new Path()
   * Path.concat($.a, ['b', 'c']) // $.a.b.c
   * Path.concat($, $.a.b, ['c']) // $.a.b.c
   */
  static concat(path: Path, ...paths: (Path | Key[])[]): Path {
    return paths.reduce(
      (acc: Path, path: Path | Key[]) => {
        const pathArray = Path.isPath(path) ? Path.array(path) : path
        return pathArray.reduce(
          (dp: Path, key: Key) => dp[key],
          acc
        )
      },
      path
    )
  }
}
