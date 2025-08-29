import { inspect } from 'node:util'
import { Path } from '../path'

const $ = new Path()

test('Path construction', () => {
  const a = new Path()
  const b = new Path([])
  expect(a instanceof Object)
    .toStrictEqual(true)
  expect(Path.array(a))
    .toStrictEqual([])
  expect(a.b instanceof Object)
    .toStrictEqual(true)
  expect(Path.array(a.b))
    .toStrictEqual(['b'])
  expect(a.b === b.b)
    .toStrictEqual(false)
})

test('Path properties', () => {
  expect($.a.b.c)
    .toBe($.a.b.c)
  expect($.a[2].c)
    .toBe($.a[2].c)
  expect($.a['2'].c)
    .toBe($.a[2].c)
  expect($.a[2]['c d'])
    .toBe($.a[2]['c d'])
  expect($.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)
    .toBe($.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)
})

test('Path iteration', () => {
  expect([...$])
    .toStrictEqual([])
  expect([...$.a.b.c])
    .toStrictEqual(['a', 'b', 'c'])
  expect([...$[0][1][2]])
    .toStrictEqual(['0', '1', '2'])
  expect([...$.a[2].c])
    .toStrictEqual(['a', '2', 'c'])
})

test('Path printing', () => {
  expect(`${$.a.b.c}`)
    .toStrictEqual('$.a.b.c')
  expect(`${$.a[2].c}`)
    .toStrictEqual('$.a[2].c')
  expect(`${$.a['2'].c}`)
    .toStrictEqual('$.a[2].c')
  expect(`${$.a[2]['c d']}`)
    .toStrictEqual('$.a[2][\'c d\']')
  expect(inspect($.a.b.c))
    .toStrictEqual('$.a.b.c')
})

test('Path.array', () => {
  expect(Path.array($))
    .toStrictEqual([])
  expect(Path.array($.a.b.c))
    .toStrictEqual(['a', 'b', 'c'])
})

test('Path.concat', () => {
  expect(Path.concat($.a.b.c))
    .toBe($.a.b.c)
  expect(Path.concat($, ['a', 'b', 'c']))
    .toBe($.a.b.c)
  expect(Path.concat($, ['a', 2, 'c']))
    .toBe($.a[2].c)
  expect(Path.concat($, $.a.b, ['a', '2', 'c']))
    .toBe($.a.b.a[2].c)
})

test('Path.callable', () => {
  const c = Path.callable
  expect(c($.a.b.c)({ a: { b: { c: 3 } } }))
    .toStrictEqual(3)
  expect(c($)({}))
    .toStrictEqual({})
  expect(c($.a.b.c)({ a: {} }))
    .toStrictEqual(undefined)
  expect(c($.a[2].c)({ a: [0, 1, { c: 'v' }, 3] }))
    .toStrictEqual('v')
  expect([{ a: 1 }, { a: 2 }].map(c($.a)))
    .toStrictEqual([1, 2])
})
