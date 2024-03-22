import { describe, it, expect } from 'vitest'
import { getConfig } from './index.js'

export const defaultConfig = {
  links: {
    cart: 'https://cart.example.com/:order_id?accessToken=:access_token',
    checkout: 'https://checkout.example.com/:order_id?accessToken=:access_token'
  },
  checkout: {
    thankyou_page: 'https://example.com/thanks/:lang/:order_id',
    billing_countries: [
      {
        value: 'ES',
        label: 'Espana'
      },
      {
        value: 'IT',
        label: 'Italia'
      },
      {
        value: 'US',
        label: 'Unites States of America'
      }
    ],
    defaultConfig: 'IT',
    billing_states: {
      FR: [
        {
          value: 'PA',
          label: 'Paris'
        },
        {
          value: 'LY',
          label: 'Lyon'
        },
        {
          value: 'NI',
          label: 'Nice'
        },
        {
          value: 'MA',
          label: 'Marseille'
        },
        {
          value: 'BO',
          label: 'Bordeaux'
        }
      ],
      IT: [
        {
          value: 'FI',
          label: 'Firenze'
        },
        {
          value: 'PO',
          label: 'Prato'
        },
        {
          value: 'LI',
          label: 'Livorno'
        }
      ]
    }
  }
}

export const overrideConfig = {
  links: {
    cart: 'https://example.com/custom-cart/:order_id?accessToken=:access_token'
  }
}

const jsonConfig = {
  mfe: {
    default: defaultConfig,
    'market:id:ZKcv13rT': overrideConfig
  }
}

describe('getConfig function', () => {
  it('should return null if jsonConfig is empty', () => {
    expect(
      getConfig({ jsonConfig: {}, market: 'market:id:ZKcv13rT', params: {} })
    ).toBeNull()
  })

  it('should return the default config if there is no override', () => {
    const config = getConfig({
      jsonConfig: { mfe: { default: defaultConfig } },
      market: 'non-existing-market',
      params: {}
    })
    expect(config).toEqual(defaultConfig)
  })

  it('should return the default config if no override per market with replaced placeholder', () => {
    const config = getConfig({
      jsonConfig,
      market: 'non-existing-market',
      params: {
        lang: 'en',
        orderId: '123-order',
        accessToken: 'valid-access-token'
      }
    })
    expect(config?.checkout?.thankyou_page).toBe(
      'https://example.com/thanks/en/123-order'
    )
    expect(config?.links?.checkout).toBe(
      'https://checkout.example.com/123-order?accessToken=valid-access-token'
    )
  })

  it('should merge default and override configs for a given market', () => {
    const config = getConfig({
      jsonConfig,
      market: 'market:id:ZKcv13rT',
      params: {}
    })
    expect(config?.links?.cart).toEqual(overrideConfig.links.cart)
  })

  it('should merge default and override configs for a given market replacing placeholders', () => {
    const config = getConfig({
      jsonConfig,
      market: 'market:id:ZKcv13rT',
      params: {
        lang: 'en',
        orderId: '123-order',
        accessToken: 'valid-access-token'
      }
    })
    expect(config?.links?.cart).toEqual(
      'https://example.com/custom-cart/123-order?accessToken=valid-access-token'
    )
  })

  it('should replace placeholders with provided parameters', () => {
    const params = { lang: 'en', accessToken: 'abc123', orderId: 'xyz789' }
    const config = getConfig({
      jsonConfig,
      market: 'market:id:ZKcv13rT',
      params
    })
    expect(config?.links?.cart).toContain(params.accessToken)
    expect(config?.checkout?.thankyou_page).toContain(params.lang)
    expect(config?.checkout?.thankyou_page).toContain(params.orderId)
    expect(config?.checkout?.thankyou_page).toBe(
      'https://example.com/thanks/en/xyz789'
    )
  })

  it('should get countries', () => {
    const params = { lang: 'en', accessToken: 'abc123', orderId: 'xyz789' }
    const config = getConfig({
      jsonConfig,
      market: 'market:id:ZKcv13rT',
      params
    })

    expect(config?.checkout?.billing_countries?.length).toBe(3)
    expect(
      config?.checkout?.billing_countries?.map((c) => c.value)
    ).toStrictEqual(['ES', 'IT', 'US'])
  })

  it('should override countries and merge states', () => {
    const countriesOverrideConfig = {
      checkout: {
        billing_countries: [
          {
            value: 'NO',
            label: 'Norway'
          }
        ],
        billing_states: {
          NO: [
            {
              value: 'OS',
              label: 'Oslo'
            },
            {
              value: 'BE',
              label: 'Bergen'
            }
          ]
        }
      }
    }
    const mergedConfig = {
      mfe: {
        default: defaultConfig,
        'market:id:ZKcv13rT': countriesOverrideConfig
      }
    }

    const params = { lang: 'en', accessToken: 'abc123', orderId: 'xyz789' }
    const config = getConfig({
      jsonConfig: mergedConfig,
      market: 'market:id:ZKcv13rT',
      params
    })

    expect(config?.checkout?.billing_countries?.length).toBe(1)
    expect(
      config?.checkout?.billing_countries?.map((c) => c.value)
    ).toStrictEqual(['NO'])
    expect(
      config?.checkout?.billing_states != null &&
        Object.keys(config?.checkout?.billing_states).length
    ).toBe(3)

    expect(
      config?.checkout?.billing_states != null &&
        Object.keys(config?.checkout?.billing_states)
    ).toStrictEqual(['FR', 'IT', 'NO'])
  })
})
