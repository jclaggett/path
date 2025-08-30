# @metagov/path

A TypeScript utility class for dynamic construction of paths to access object properties using dotted and indexed notation. Key features:
- **Value Equality**: `$.a.b.c === $.a.b.c`
- **Iteration**: `[...$.a.b.c] // ['a', 'b', 'c']`
- **Callable Paths**: `$.a.b.c({a:{b:{c: 42}}}) // 42`
- **Type Safety**: Fully typed for robust development

Run the demo yourself:
```bash
pnpx @metagov/path demo
```

## Installation

```bash
pnpm install @metagov/path
```

## Usage

```typescript
import { Path } from '@metagov/path'

// Define a root path
const $ = new Path()

// Grow new paths from the root
const a = $.a
const ab = $.a.b
const abc = ab.c
const abc2 = $.a.b.c[2]

// Equality (identity)
abc === $.a.b.c // true

// Iteration
[...$] // []
[...abc] // ['a', 'b', 'c']
for (const key of $.a[2]) {
  console.log(key)
} // outputs 'a' and '2'

// Calling paths to dig into objects and arrays
const data = {a: {b: {c: [0, 1, 42]}}}
$(data) === data // true
abc(data) === data.a.b.c // true
abc2(data) === 42 // true
[{a:1}, {a:2}, {a:3}].map($.a) // [1, 2, 3]

// Edge cases
abc({}) // undefined (path not found)
$.a['b.c']({a: {'b.c': 42}}) // 42 (special characters in keys)

// Path methods
Path.isPath($.a) // true
Path.concat(abc, ['d', 'e'], $.f) // $.a.b.c.d.e.f
Path.array(ab) // ['a', 'b']
Path.callable(abc2)(data) // 42 (typesafe call)
```

## API

### `Path` Class
A utility class for dynamic path construction and property access.

- **`constructor(path: Key[] = [])`**: Creates a new `Path` instance.
  - `path`: Optional array of keys (strings or numbers) to initialize the path.
  - Example: `new Path(['a', 'b']) // $.a.b`

- **`[key: Key]: Path`**: Dynamically creates a new `Path` by appending a key.
  - Example: `$.a.b // Path for $.a.b`

- **`[Symbol.iterator](): IterableIterator<Key>`**: Enables iteration over path keys.
  - Example: `[...$.a.b] // ['a', 'b']`

- **`[Symbol.toPrimitive](): string`**: Returns the string representation of the path.
  - Example: `String($.a.b) // '$.a.b'`

- **`(obj: any): any`**: Resolves the path against an object, returning the value or `undefined` if not found.
  - Example: `$.a.b({a: {b: 42}}) // 42`

### Static Methods

- **`Path.callable(path: Path): CallablePath`**: Converts a `Path` to a callable function.
  - `path`: The `Path` instance to convert.
  - Returns: A callable `Path` that resolves values.
  - Example: `Path.callable($.a.b)({a: {b: 42}}) // 42`

- **`Path.isPath(x: any): x is Path`**: Checks if a value is a `Path` instance.
  - `x`: The value to check.
  - Returns: `true` if `x` is a `Path`, `false` otherwise.
  - Example: `Path.isPath($.a) // true`

- **`Path.array(path: Path): Key[]`**: Returns the underlying path as an array of keys.
  - `path`: The `Path` instance.
  - Returns: Array of keys.
  - Example: `Path.array($.a.b) // ['a', 'b']`

- **`Path.concat(path: Path, ...paths: (Path | Key[])[]): Path`**: Concatenates paths or key arrays to create a new `Path`.
  - `path`: The base `Path`.
  - `paths`: Additional `Path` instances or key arrays to concatenate.
  - Returns: A new `Path` with combined keys.
  - Example: `Path.concat($.a, ['b', 'c']) // $.a.b.c`

## Building

```bash
pnpm run clean # optional
pnpm install
pnpm run build
```

## Testing

```bash
pnpm run test
pnpm run test --coverage
```

## License

ISC
