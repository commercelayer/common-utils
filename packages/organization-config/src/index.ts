import { merge } from 'merge-anything'

/**
 * Represents a type that can be null or undefined, making it optional in use.
 * @template T The type that is being made nullable.
 */
export type NullableType<T> = T | null | undefined

/**
 * Params used by the getConfig function
 */
interface ConfigParams {
  /**
   * Language code (e.g., 'en', 'fr') used to dynamically replace the `:lang` placeholder in URLs.
   */
  lang?: NullableType<string>
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

/**
 * Configuration for overriding default links of the micro frontends,
 * allowing customization of specific components.
 */
interface LinkConfig {
  /** URL for a custom cart. */
  cart?: string
  /** URL for a custom checkout */
  checkout?: string
  /** URL for a custom my account */
  my_account?: string
  /** URL for a custom identity */
  identity?: string
  /** URL for a custom microstore */
  microstore?: string
}

interface Country {
  /** The country code (e.g., 'US', 'UK') */
  value: string
  /** The display name of the country (e.g., 'United States', 'United Kingdom') */
  label: string
}

interface State {
  /** The province/state code (e.g., 'FI', 'LI') */
  value: string
  /** The display name of the province/state (e.g., 'Firenze', 'Livorno') */
  label: string
}

type StatesConfig = Record<string, State[]>

/**
 * Configuration settings for customizing the Checkout application.
 */
interface CheckoutConfig {
  /** URL for a custom thank you page displayed after completing a purchase. */
  thankyou_page?: string
  /** List of countries available for selection in billing address forms. */
  billing_countries?: Country[]
  /** List of countries available for selection in shipping address forms. */
  shipping_countries?: Country[]
  /** Configuration for states or regions to display in billing address forms, which may override default settings. */
  billing_states?: StatesConfig
  /** Configuration for states or regions to display in shipping address forms, which may override default settings. */
  shipping_states?: StatesConfig
  /** Country code preselected by default in billing and shipping address forms. */
  default_country?: string
}

interface UrlsConfig {
  /** URL of the privacy policy page */
  privacy: string
  /** URL of the terms and conditions page */
  terms: string
}

/** Interface of the config of the organization */
export interface DefaultConfig {
  /** Custom links for overriding default micro frontends. */
  links?: LinkConfig
  /** Checkout-specific configuration, like custom thank you page and country lists. */
  checkout?: CheckoutConfig
  /** URLs for privacy policy and terms of service pages. */
  urls?: UrlsConfig
}

/** Configuration structure containing defaults and market-specific overrides. */
export interface Configs {
  /** Default configuration applicable to all markets. */
  default: DefaultConfig
  /** Market-specific configuration overrides, keyed by market identifier. */
  [key: string]: Partial<DefaultConfig>
}

interface GetConfigProps {
  /**
   * `config` attribute of the organization
   */
  jsonConfig?: { mfe?: Configs }
  /**
   *  Market identifier for fetching specific configuration overrides. (`market:id:hashid`)
   */
  market?: string
  /**
   * Parameters for replacing URL placeholders.
   */
  params?: ConfigParams
}

/**
 * Retrieves and merges the default organization configuration with market-specific overrides based on the provided market identifier.
 * Placeholder values in the configuration URLs can be replaced with actual values from the `params`.
 *
 * @param jsonConfig The complete configuration object of the organization.
 * @param market The market identifier used to get market-specific configuration overrides.
 * @param params The object containing replacement values for URL placeholders, such as language and access token.
 * @returns The merged configuration object for the specified market, or null if no configuration is found.
 */
export function getConfig({
  jsonConfig,
  market,
  params
}: GetConfigProps): DefaultConfig | null {
  if (jsonConfig?.mfe == null) {
    return null
  }

  const defaultConfig = jsonConfig?.mfe?.default ?? {}
  const overrideConfig = market != null ? jsonConfig?.mfe[market] ?? {} : {}

  // Replace placeholders in all string values within the object
  function replacePlaceholders(config: DefaultConfig): DefaultConfig {
    const replacedConfig = JSON.stringify(config)
      .replace(/:lang/g, params?.lang ?? ':lang')
      .replace(/:access_token/g, params?.accessToken ?? ':access_token')
      .replace(/:order_id/g, params?.orderId ?? ':order_id')
      .replace(/:sku_list_id/g, params?.skuListId ?? ':sku_list_id')
      .replace(/:sku_id/g, params?.skuId ?? ':sku_id')

    return JSON.parse(replacedConfig)
  }

  const mergedConfig: DefaultConfig = merge(
    JSON.parse(JSON.stringify(defaultConfig)),
    overrideConfig
  )
  return replacePlaceholders(mergedConfig)
}
