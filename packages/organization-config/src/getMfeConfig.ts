import { merge } from 'merge-anything'
import { type ValidConfigForOrganizationsInCommerceLayer } from './schema/types'

/**
 * Represents a type that can be null or undefined, making it optional in use.
 * @template T The type that is being made nullable.
 */
type NullableType<T> = T | null | undefined

/**
 * Params used by the getConfig function
 */
interface ConfigParams {
  /**
   * Language code (e.g., 'en', 'fr') used to dynamically replace the `:lang` placeholder in URLs.
   */
  lang?: NullableType<string>
  /**
   * Organization slug used to replace the `:slug` placeholder in URLs.
   */
  slug?: NullableType<string>
  /**
   * Access token string used to replace the `:access_token` placeholder in URLs.
   */
  accessToken?: NullableType<string>
  /**
   * Unique identifier for an order used to replace the `:order_id` placeholder in URLs.
   */
  orderId?: NullableType<string>
  /**
   * Unique identifier for an SKU list used to replace the `:sku_list_id` placeholder in URLs.
   */
  skuListId?: NullableType<string>
  /**
   * Unique identifier for an SKU used to replace the `:sku_id` placeholder in URLs.
   */
  skuId?: NullableType<string>
}

interface GetMfeConfigProps {
  /**
   * `config` attribute of the organization
   */
  jsonConfig?: { mfe?: MfeConfigs }
  /**
   *  Market identifier for fetching specific configuration overrides. (`market:id:hashid`)
   */
  market?: string
  /**
   * Parameters for replacing URL placeholders.
   */
  params?: ConfigParams
}

export type MfeConfigs = NonNullable<
  ValidConfigForOrganizationsInCommerceLayer['mfe']
>

export type DefaultMfeConfig = NonNullable<
  ValidConfigForOrganizationsInCommerceLayer['mfe']
>['default']

/**
 * Retrieves and merges the default organization configuration with market-specific overrides based on the provided market identifier.
 * Placeholder values in the configuration URLs can be replaced with actual values from the `params`.
 *
 * @param jsonConfig The complete configuration object of the organization.
 * @param market The market identifier used to get market-specific configuration overrides.
 * @param params The object containing replacement values for URL placeholders, such as language and access token.
 * @returns The merged configuration object for the specified market, or null if no configuration is found.
 */
export function getMfeConfig({
  jsonConfig,
  market,
  params
}: GetMfeConfigProps): DefaultMfeConfig | null {
  if (jsonConfig?.mfe == null) {
    return null
  }

  const defaultConfig = jsonConfig?.mfe?.default ?? {}
  const overrideConfig = market != null ? (jsonConfig?.mfe[market] ?? {}) : {}

  // Replace placeholders in all string values within the object
  function replacePlaceholders(config: DefaultMfeConfig): DefaultMfeConfig {
    const replacedConfig = JSON.stringify(config)
      .replace(/:lang/g, params?.lang ?? ':lang')
      .replace(/:slug/g, params?.slug ?? ':slug')
      .replace(/:access_token/g, params?.accessToken ?? ':access_token')
      .replace(/:order_id/g, params?.orderId ?? ':order_id')
      .replace(/:sku_list_id/g, params?.skuListId ?? ':sku_list_id')
      .replace(/:sku_id/g, params?.skuId ?? ':sku_id')

    return JSON.parse(replacedConfig)
  }

  const mergedConfig: DefaultMfeConfig = merge(
    JSON.parse(JSON.stringify(defaultConfig)),
    overrideConfig
  )
  return replacePlaceholders(mergedConfig)
}
