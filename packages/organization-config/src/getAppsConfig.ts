import { type ValidConfigForOrganizationsInCommerceLayer } from './schema/types'

const apps: Array<
  keyof NonNullable<ValidConfigForOrganizationsInCommerceLayer['apps']>
> = [
  'default',
  'bundles',
  'customers',
  'exports',
  'gift_cards',
  'imports',
  'inventory',
  'orders',
  'price_lists',
  'promotions',
  'resources',
  'returns',
  'shipments',
  'skus',
  'sku_lists',
  'stock_transfers',
  'subscriptions',
  'tags',
  'webhooks'
]

export type AppsConfigWithDefault = NonNullable<
  ValidConfigForOrganizationsInCommerceLayer['apps']
>

export type FullAppsConfig = Required<Omit<AppsConfigWithDefault, 'default'>>

type HideableItems = NonNullable<
  Required<AppsConfigWithDefault>['default']['hide']
>

/**
 * Get the apps configuration filling them with with the default values, if specified
 */
export function getAppsConfig({
  jsonConfig
}: {
  /** `config` attribute of the organization */
  jsonConfig?: { apps?: AppsConfigWithDefault }
}): FullAppsConfig {
  const cfg = jsonConfig?.apps ?? {}

  return apps.reduce((acc, key) => {
    if (key === 'default') {
      return acc
    }
    return {
      ...acc,
      [key]: mergeWithDefaults(cfg, key)
    }
  }, {}) as FullAppsConfig
}

/**
 * Merge the default `hide` array with the app specific `hide` array
 */
function mergeWithDefaults<
  Item extends keyof Omit<AppsConfigWithDefault, 'default'>
>(cfg: Partial<AppsConfigWithDefault>, app: Item): AppsConfigWithDefault[Item] {
  const defaultHide = cfg.default?.hide ?? []
  const itemHide = (cfg[app]?.hide ?? []) as HideableItems
  const mergedDeduped = Array.from(new Set(defaultHide.concat(itemHide)))
  return {
    hide: mergedDeduped
  }
}
