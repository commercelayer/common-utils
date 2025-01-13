import { type NullableType } from './types'

type HideableItems = 'tags' | 'details' | 'metadata'
type ItemsWithDefault = (typeof appsWithDefault)[number]

// orders and customers are special cases with extended options
const appsWithDefault = [
  'default',
  'bundles',
  'exports',
  'gift_cards',
  'imports',
  'inventory',
  'price_lists',
  'promotions',
  'returns',
  'shipments',
  'sku_lists',
  'skus',
  'stock_transfers',
  'subscriptions',
  'tags',
  'webhooks'
] as const

export type AppsConfigWithDefault = Record<
  'default' | ItemsWithDefault,
  { hide: NullableType<HideableItems[]> }
> & {
  customers: {
    hide: NullableType<Array<HideableItems | 'customer_groups'>>
  }
  orders: { hide: NullableType<Array<HideableItems | 'markets'>> }
}

export type AppsConfig = Omit<AppsConfigWithDefault, 'default'>

/**
 * Get the apps configuration filling them with with the default values, if specified
 */
export function getAppsConfig({
  jsonConfig
}: {
  /** `config` attribute of the organization */
  jsonConfig?: { apps?: Partial<AppsConfigWithDefault> }
}): AppsConfig {
  const cfg = jsonConfig?.apps ?? {}
  const keys = [...appsWithDefault, 'orders', 'customers'] as const

  return keys.reduce((acc, key) => {
    if (key === 'default') {
      return acc
    }
    return {
      ...acc,
      [key]: mergeWithDefaults(cfg, key)
    }
  }, {}) as AppsConfig
}

/**
 * Merge the default `hide` array with the app specific `hide` array
 */
function mergeWithDefaults<
  Item extends keyof Omit<AppsConfigWithDefault, 'default'>
>(cfg: Partial<AppsConfigWithDefault>, app: Item): AppsConfigWithDefault[Item] {
  const defaultHide = cfg.default?.hide ?? []
  const itemHide = (cfg[app]?.hide ?? []) as HideableItems[]
  const mergedDeduped = Array.from(new Set(defaultHide.concat(itemHide)))
  return {
    hide: mergedDeduped
  }
}
