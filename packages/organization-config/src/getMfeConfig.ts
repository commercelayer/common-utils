import { jwtDecode } from "@commercelayer/js-auth"
import { merge } from "merge-anything"
import type { SetRequired } from "type-fest"
import type { ValidConfigForOrganizationsInCommerceLayer } from "./schema/types"

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
   * Order token string used to replace the `:token` placeholder in URLs.
   */
  token?: NullableType<string>
  /**
   * Unique identifier for an SKU list used to replace the `:sku_list_id` placeholder in URLs.
   */
  skuListId?: NullableType<string>
  /**
   * Unique identifier for an SKU used to replace the `:sku_id` placeholder in URLs.
   */
  skuId?: NullableType<string>
  /**
   * Type used for the identity, which can be used to replace a `:identity_type` placeholder in URLs.
   */
  identityType?: NullableType<"login" | "signup">
  /**
   * Client ID used for authentication, which can be used to replace a `:client_id` placeholder in URLs.
   */
  clientId?: NullableType<string>
  /**
   * For the identity, it is the market used for the login process (e.g. a private market).
   */
  scope?: NullableType<string>
  /**
   * For the identity, it is the default scope used by the app to obtain the organization settings needed to customize the UI (name, logo, colors, etc.).
   */
  publicScope?: NullableType<string>
  /**
   * Return URL after certain actions, which can be used to replace a `:return_url` placeholder in URLs.
   */
  returnUrl?: NullableType<string>
  /**
   * URL to the reset password page, which can be used to replace a `:reset_password_url` placeholder in URLs.
   */
  resetPasswordUrl?: NullableType<string>
}

interface GetMfeConfigProps {
  /**
   * `config` attribute of the organization
   */
  jsonConfig?: { mfe?: MfeConfigs } | null
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
  ValidConfigForOrganizationsInCommerceLayer["mfe"]
>

export type DefaultMfeConfig = NonNullable<
  NonNullable<ValidConfigForOrganizationsInCommerceLayer["mfe"]>["default"]
>

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
  params,
}: GetMfeConfigProps): DefaultMfeConfig | null {
  const defaultConfig = merge(
    getDefaults({ params }),
    jsonConfig?.mfe?.default ?? {},
  )

  const overrideConfig = market != null ? (jsonConfig?.mfe?.[market] ?? {}) : {}

  // Replace placeholders in all string values within the object
  function replacePlaceholders(config: DefaultMfeConfig): DefaultMfeConfig {
    const replacedConfig = JSON.stringify(config)
      .replace(/:lang/g, params?.lang ?? ":lang")
      .replace(/:slug/g, params?.slug ?? ":slug")
      .replace(/:token/g, params?.token ?? ":token")
      .replace(/:access_token/g, params?.accessToken ?? ":access_token")
      .replace(/:order_id/g, params?.orderId ?? ":order_id")
      .replace(/:sku_list_id/g, params?.skuListId ?? ":sku_list_id")
      .replace(/:sku_id/g, params?.skuId ?? ":sku_id")
      .replace(/:identity_type/g, params?.identityType ?? ":identity_type")
      .replace(/:client_id/g, params?.clientId ?? ":client_id")
      .replace(/:scope/g, params?.scope ?? ":scope")
      .replace(/:public_scope/g, params?.publicScope ?? ":public_scope")
      .replace(/:return_url/g, params?.returnUrl ?? ":return_url")
      .replace(
        /:reset_password_url/g,
        params?.resetPasswordUrl ?? ":reset_password_url",
      )

    return JSON.parse(replacedConfig)
  }

  const mergedConfig: DefaultMfeConfig = merge(
    JSON.parse(JSON.stringify(defaultConfig)),
    overrideConfig,
  )

  if (Object.keys(mergedConfig).length === 0) {
    return null
  }

  return replacePlaceholders(mergedConfig)
}

/**
 * Provides default MFE configuration.
 */
function getDefaults({ params }: GetMfeConfigProps): DefaultMfeConfig {
  if (params?.accessToken == null) {
    return {}
  }

  try {
    const jwt = jwtDecode(params.accessToken)
    const slug =
      params.slug ??
      ("organization" in jwt.payload ? jwt.payload.organization.slug : null)

    if (slug == null) {
      return {}
    }

    const domainPrefix = jwt.payload.iss.endsWith("commercelayer.co")
      ? ".stg"
      : ""

    const appEndpoint = `https://${slug}${domainPrefix}.commercelayer.app`

    const defaultConfig: DefaultMfeConfig = {
      links: {
        cart: `${appEndpoint}/cart/:order_id?accessToken=:access_token`,
        checkout: `${appEndpoint}/checkout/:order_id?accessToken=:access_token`,
        my_account: `${appEndpoint}/my-account?${[
          "accessToken=:access_token",
          params.returnUrl != null ? "returnUrl=:return_url" : null,
        ]
          .filter((part) => part != null)
          .join("&")}`,
        identity: `${appEndpoint}/identity/:identity_type?${[
          "clientId=:client_id",
          "scope=:scope",
          params.publicScope != null ? "publicScope=:public_scope" : null,
          params.lang != null ? "lang=:lang" : null,
          params.returnUrl != null ? "returnUrl=:return_url" : null,
          params.resetPasswordUrl != null
            ? "resetPasswordUrl=:reset_password_url"
            : null,
        ]
          .filter((part) => part != null)
          .join("&")}`,
        microstore:
          params.skuListId != null
            ? `${appEndpoint}/microstore/list/:sku_list_id?accessToken=:access_token`
            : `${appEndpoint}/microstore/sku/:sku_id?accessToken=:access_token`,
      },
    }

    return defaultConfig
  } catch (_error) {
    console.log(_error)
    return {}
  }
}

export function hasValidLinks(
  config: ReturnType<typeof getMfeConfig>,
): config is MfeConfigWithLinks {
  return (
    config != null &&
    config.links != null &&
    config.links.cart != null &&
    config.links.checkout != null &&
    config.links.identity != null &&
    config.links.my_account != null
  )
}

export type MfeConfigWithLinks = Omit<DefaultMfeConfig, "links"> & {
  links: SetRequired<
    NonNullable<DefaultMfeConfig["links"]>,
    "cart" | "checkout" | "identity" | "my_account"
  >
}
