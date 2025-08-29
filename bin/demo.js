#!/usr/bin/env node

const repl = require('repl')
const { Path } = require('../dist/path.js')

console.log('Path demo. Type $ to access a Path instance and Path to access the class.')
const r = repl.start('path-demo> ')
r.context.Path = Path
r.context.$ = new Path()
