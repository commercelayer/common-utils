import { bench, describe } from 'vitest'
import merge from 'lodash/merge'
import dm from 'deepmerge'
import { deepmerge as dmts } from 'deepmerge-ts'
import { merge as anything } from 'merge-anything'
import { defaultConfig, overrideConfig } from './index.test.js'

describe('merging', () => {
  bench(
    'lodash',
    () => {
      merge(JSON.parse(JSON.stringify(defaultConfig)), overrideConfig)
    },
    { time: 1000 }
  )

  bench(
    'deepmerge',
    () => {
      dm(defaultConfig, overrideConfig)
    },
    { time: 1000 }
  )

  bench(
    'deepmerge-ts',
    () => {
      dmts(defaultConfig, { ...overrideConfig })
    },
    { time: 1000 }
  )

  bench(
    'merge-anything',
    () => {
      anything(defaultConfig, { ...overrideConfig })
    },
    { time: 1000 }
  )
})
