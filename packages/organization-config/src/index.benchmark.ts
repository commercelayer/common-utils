import { bench, describe } from 'vitest'
import merge from 'lodash/merge'
import dm from 'deepmerge'
import { deepmerge as dmts } from 'deepmerge-ts'
import { merge as anything } from 'merge-anything'

const defaultConfig = {
  links: {
    cart: 'https://cart.example.com/:order_id?accessToken=:access_token',
    checkout: 'https://checkout.example.com/:order_id?accessToken=:access_token'
  },
  checkout: {
    thankyou_page: 'https://example.com/thanks/:lang/:order_id'
  }
}

const overrideConfig = {
  links: {
    cart: 'https://example.com/custom-cart/:order_id?accessToken=:access_token'
  }
}

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
