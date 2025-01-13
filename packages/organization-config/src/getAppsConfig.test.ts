import { describe, expect, it } from 'vitest'
import { getAppsConfig } from './getAppsConfig'

describe('getAppsConfig', () => {
  it('should return full config if initial config is empty', () => {
    const config = getAppsConfig({ jsonConfig: {} })
    expect(config).toEqual({
      bundles: { hide: [] },
      customers: { hide: [] },
      exports: { hide: [] },
      gift_cards: { hide: [] },
      imports: { hide: [] },
      inventory: { hide: [] },
      orders: { hide: [] },
      price_lists: { hide: [] },
      promotions: { hide: [] },
      returns: { hide: [] },
      shipments: { hide: [] },
      sku_lists: { hide: [] },
      skus: { hide: [] },
      stock_transfers: { hide: [] },
      subscriptions: { hide: [] },
      tags: { hide: [] },
      webhooks: { hide: [] }
    })
  })

  it('should return default values for all items', () => {
    const config = getAppsConfig({
      jsonConfig: {
        apps: {
          default: { hide: ['details', 'metadata'] }
        }
      }
    })
    expect(config).toEqual({
      bundles: { hide: ['details', 'metadata'] },
      customers: { hide: ['details', 'metadata'] },
      exports: { hide: ['details', 'metadata'] },
      gift_cards: { hide: ['details', 'metadata'] },
      imports: { hide: ['details', 'metadata'] },
      inventory: { hide: ['details', 'metadata'] },
      orders: { hide: ['details', 'metadata'] },
      price_lists: { hide: ['details', 'metadata'] },
      promotions: { hide: ['details', 'metadata'] },
      returns: { hide: ['details', 'metadata'] },
      shipments: { hide: ['details', 'metadata'] },
      sku_lists: { hide: ['details', 'metadata'] },
      skus: { hide: ['details', 'metadata'] },
      stock_transfers: { hide: ['details', 'metadata'] },
      subscriptions: { hide: ['details', 'metadata'] },
      tags: { hide: ['details', 'metadata'] },
      webhooks: { hide: ['details', 'metadata'] }
    })
  })

  it('should handle special cases and remove duplicated', () => {
    const config = getAppsConfig({
      jsonConfig: {
        apps: {
          default: { hide: ['details', 'metadata'] },
          orders: { hide: ['markets'] },
          customers: { hide: ['customer_groups', 'customer_groups'] },
          shipments: { hide: ['tags', 'details'] }
        }
      }
    })
    expect(config).toEqual({
      bundles: { hide: ['details', 'metadata'] },
      customers: { hide: ['details', 'metadata', 'customer_groups'] },
      exports: { hide: ['details', 'metadata'] },
      gift_cards: { hide: ['details', 'metadata'] },
      imports: { hide: ['details', 'metadata'] },
      inventory: { hide: ['details', 'metadata'] },
      orders: { hide: ['details', 'metadata', 'markets'] },
      price_lists: { hide: ['details', 'metadata'] },
      promotions: { hide: ['details', 'metadata'] },
      returns: { hide: ['details', 'metadata'] },
      shipments: { hide: ['details', 'metadata', 'tags'] },
      sku_lists: { hide: ['details', 'metadata'] },
      skus: { hide: ['details', 'metadata'] },
      stock_transfers: { hide: ['details', 'metadata'] },
      subscriptions: { hide: ['details', 'metadata'] },
      tags: { hide: ['details', 'metadata'] },
      webhooks: { hide: ['details', 'metadata'] }
    })
  })

  it('should single apps when no defaults are specified', () => {
    const config = getAppsConfig({
      jsonConfig: {
        apps: {
          orders: { hide: ['markets'] },
          customers: { hide: ['customer_groups', 'metadata'] },
          shipments: { hide: ['tags', 'details'] },
          imports: { hide: ['metadata'] },
          skus: { hide: [] },
          sku_lists: { hide: null }
        }
      }
    })
    expect(config).toEqual({
      bundles: { hide: [] },
      customers: { hide: ['customer_groups', 'metadata'] },
      exports: { hide: [] },
      gift_cards: { hide: [] },
      imports: { hide: ['metadata'] },
      inventory: { hide: [] },
      orders: { hide: ['markets'] },
      price_lists: { hide: [] },
      promotions: { hide: [] },
      returns: { hide: [] },
      shipments: { hide: ['tags', 'details'] },
      sku_lists: { hide: [] },
      skus: { hide: [] },
      stock_transfers: { hide: [] },
      subscriptions: { hide: [] },
      tags: { hide: [] },
      webhooks: { hide: [] }
    })
  })
})
