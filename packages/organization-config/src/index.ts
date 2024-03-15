import merge from 'lodash/merge'

export type NullableType<T> = T | null | undefined

interface ConfigParams {
  /**
   * language used to replace `:lang` placeholder
   */
  lang?: NullableType<string>
  /**
   * accessToken used to replace `:access_token` placeholder
   */
  accessToken?: NullableType<string>
  /**
   * order id used to replace `:order_id` placeholder
   */
  orderId?: NullableType<string>
}

interface LinkConfig {
  cart?: string
  checkout?: string
  my_account?: string
  identity?: string
}

interface Country {
  value: string
  label: string
}

type StateConfig = Record<string, Country[]>

interface CheckoutConfig {
  thankyou_page?: string
  billing_countries?: Country[]
  shipping_countries?: Country[]
  billing_states?: StateConfig[]
  shipping_states?: StateConfig[]
  default_country?: string
}

interface UrlsConfig {
  privacy: string
  terms: string
}

export interface DefaultConfig {
  links?: LinkConfig
  checkout?: CheckoutConfig
  urls?: UrlsConfig
}

export interface Configs {
  default: DefaultConfig
  [key: string]: Partial<DefaultConfig>
}

interface GetConfigProps {
  /**
   * `config` attribute of the organization
   */
  jsonConfig?: { mfe?: Configs }
  /**
   * `market:id:hashid` used to override default configuration
   */
  market?: string
  /**
   * `params` used to replace url placeholders
   */
  params?: ConfigParams
}

/**
 * The function is going to manipulate the organization configuration,
 * extract the `mfe` key and merge `default` configuration with overrides
 * for the market used.
 */
export function getConfig({
  jsonConfig,
  market,
  params
}: GetConfigProps): DefaultConfig | null {
  if (jsonConfig?.mfe == null) {
    console.warn('No configuration found.')
    return null
  }

  const defaultConfig = jsonConfig?.mfe?.default
  const overrideConfig = market != null ? jsonConfig?.mfe[market] : {}

  // Replace placeholders in all string values within the object
  function replacePlaceholders(config: DefaultConfig): DefaultConfig {
    const replacedConfig = JSON.stringify(config)
      .replace(/:lang/g, params?.lang ?? ':lang')
      .replace(/:access_token/g, params?.accessToken ?? ':access_token')
      .replace(/:order_id/g, params?.orderId ?? ':order_id')

    return JSON.parse(replacedConfig)
  }

  const mergedConfig: DefaultConfig = merge(
    JSON.parse(JSON.stringify(defaultConfig)),
    overrideConfig
  )
  return replacePlaceholders(mergedConfig)
}
