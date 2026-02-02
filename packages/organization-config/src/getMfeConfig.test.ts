import { describe, expect, it } from "vitest"
import { getMfeConfig } from "./getMfeConfig"
import { defaultConfig, overrideConfig } from "./testHelper"

const jsonConfig = {
  mfe: {
    default: defaultConfig,
    "market:id:ZKcv13rT": overrideConfig,
  },
}

describe("getMfeConfig function", () => {
  it("should return null if jsonConfig is empty", () => {
    expect(
      getMfeConfig({
        jsonConfig: {},
        market: "market:id:ZKcv13rT",
        params: {},
      }),
    ).toBeNull()

    expect(
      getMfeConfig({
        jsonConfig: null,
        market: "market:id:ZKcv13rT",
        params: {},
      }),
    ).toBeNull()

    expect(
      getMfeConfig({
        jsonConfig: undefined,
        market: "market:id:ZKcv13rT",
        params: {},
      }),
    ).toBeNull()
  })

  it("should return the default config if there is no override", () => {
    const config = getMfeConfig({
      jsonConfig: { mfe: { default: defaultConfig } },
      market: "non-existing-market",
      params: {},
    })
    expect(config).toEqual(defaultConfig)
  })

  it("should return the default config if no override per market with replaced placeholder", () => {
    const config = getMfeConfig({
      jsonConfig,
      market: "non-existing-market",
      params: {
        lang: "en",
        orderId: "123-order",
        accessToken: "valid-access-token",
      },
    })
    expect(config?.checkout?.thankyou_page).toBe(
      "https://example.com/thanks/en/123-order",
    )
    expect(config?.links?.checkout).toBe(
      "https://checkout.example.com/123-order?accessToken=valid-access-token",
    )
  })

  it("should merge default and override configs for a given market", () => {
    const config = getMfeConfig({
      jsonConfig,
      market: "market:id:ZKcv13rT",
      params: {},
    })
    expect(config?.links?.cart).toEqual(overrideConfig.links.cart)
  })

  it("should merge default and override configs for a given market replacing placeholders", () => {
    const config = getMfeConfig({
      jsonConfig,
      market: "market:id:ZKcv13rT",
      params: {
        lang: "en",
        orderId: "123-order",
        accessToken: "valid-access-token",
      },
    })
    expect(config?.links?.cart).toEqual(
      "https://example.com/custom-cart/123-order?accessToken=valid-access-token",
    )
  })

  it("should replace consider different token and access token", () => {
    const params = {
      lang: "en",
      accessToken: "abc123",
      orderId: "xyz789",
      token: "abc321",
    }
    const config = getMfeConfig({
      jsonConfig,
      market: "market:id:ZKcv13rT",
      params,
    })
    expect(config?.links?.my_account).toContain(params.accessToken)
    expect(config?.links?.my_account).toContain(params.token)
    expect(config?.links?.my_account).toBe(
      "https://cart.example.com/xyz789/abc321/abc123",
    )
  })

  it("should replace placeholders with provided parameters", () => {
    const params = { lang: "en", accessToken: "abc123", orderId: "xyz789" }
    const config = getMfeConfig({
      jsonConfig,
      market: "market:id:ZKcv13rT",
      params,
    })
    expect(config?.links?.cart).toContain(params.accessToken)
    expect(config?.checkout?.thankyou_page).toContain(params.lang)
    expect(config?.checkout?.thankyou_page).toContain(params.orderId)
    expect(config?.checkout?.thankyou_page).toBe(
      "https://example.com/thanks/en/xyz789",
    )
  })

  it("should get countries", () => {
    const params = { lang: "en", accessToken: "abc123", orderId: "xyz789" }
    const config = getMfeConfig({
      jsonConfig,
      market: "market:id:ZKcv13rT",
      params,
    })

    expect(config?.checkout?.billing_countries?.length).toBe(3)
    expect(
      config?.checkout?.billing_countries?.map((c) => c.value),
    ).toStrictEqual(["ES", "IT", "US"])
  })

  it("should override countries and merge states", () => {
    const countriesOverrideConfig = {
      checkout: {
        billing_countries: [
          {
            value: "NO",
            label: "Norway",
          },
        ],
        billing_states: {
          NO: [
            {
              value: "OS",
              label: "Oslo",
            },
            {
              value: "BE",
              label: "Bergen",
            },
          ],
        },
      },
    }
    const mergedConfig = {
      mfe: {
        default: defaultConfig,
        "market:id:ZKcv13rT": countriesOverrideConfig,
      },
    }

    const params = { lang: "en", accessToken: "abc123", orderId: "xyz789" }
    const config = getMfeConfig({
      jsonConfig: mergedConfig,
      market: "market:id:ZKcv13rT",
      params,
    })

    expect(config?.checkout?.billing_countries?.length).toBe(1)
    expect(
      config?.checkout?.billing_countries?.map((c) => c.value),
    ).toStrictEqual(["NO"])
    expect(
      config?.checkout?.billing_states != null &&
        Object.keys(config?.checkout?.billing_states).length,
    ).toBe(3)

    expect(
      config?.checkout?.billing_states != null &&
        Object.keys(config?.checkout?.billing_states),
    ).toStrictEqual(["FR", "IT", "NO"])
  })

  it("should avoid value if not on default", () => {
    const thankyouPageConfig = {
      checkout: {
        thankyou_page:
          "https://example.com/thankyou/:order_id?accessToken=:access_token",
      },
    }
    const mergedConfig = {
      mfe: {
        default: {},
        "market:id:ZKcv13rT": thankyouPageConfig,
      },
    }

    const params = { lang: "en", accessToken: "abc123", orderId: "xyz789" }
    const config = getMfeConfig({
      jsonConfig: mergedConfig,
      market: "market:id:ZKcv13rT",
      params,
    })

    expect(config?.checkout?.thankyou_page).toBe(
      "https://example.com/thankyou/xyz789?accessToken=abc123",
    )

    const defaultConfig = getMfeConfig({
      jsonConfig: mergedConfig,
      params,
    })
    expect(defaultConfig?.checkout?.thankyou_page).toBe(undefined)
  })

  it("should handle language as default", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            language: "en-US",
          },
        },
      },
    })
    expect(config?.language).toBe("en-US")
  })

  it("should handle hide item code on checkout", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            checkout: {
              hide_item_codes: true,
            },
          },
        },
      },
    })
    expect(config?.checkout?.hide_item_codes).toBe(true)
  })

  it("should handle hide item code on cart", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            cart: {
              hide_item_codes: true,
            },
          },
        },
      },
    })
    expect(config?.cart?.hide_item_codes).toBe(true)
  })

  it("should handle hide item code on microstore", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            microstore: {
              hide_item_codes: true,
            },
          },
        },
      },
    })
    expect(config?.microstore?.hide_item_codes).toBe(true)
  })

  it("should handle hide item code on my-account and hide returns", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            my_account: {
              hide_item_codes: true,
              hide_returns: true,
            },
          },
        },
      },
    })
    expect(config?.my_account?.hide_item_codes).toBe(true)
    expect(config?.my_account?.hide_returns).toBe(true)
  })

  it("should handle language as market override", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            language: "en-US",
          },
          "market:id:ZKcv13rT": {
            language: "it-IT",
          },
        },
      },
      market: "market:id:ZKcv13rT",
    })
    expect(config?.language).toBe("it-IT")
  })

  it("should use default links set to our official build-in apps (microstore as list)", () => {
    const config = getMfeConfig({
      jsonConfig: null,
      params: {
        accessToken: ioAccessToken,
        orderId: "order123",
        skuListId: "skuList123",
      },
      market: "market:id:ZKcv13rT",
    })
    expect(config).toMatchObject({
      links: {
        cart: `https://demo-store.commercelayer.app/cart/order123?accessToken=${ioAccessToken}`,
        checkout: `https://demo-store.commercelayer.app/checkout/order123?accessToken=${ioAccessToken}`,
        identity: `https://demo-store.commercelayer.app/identity`,
        microstore: `https://demo-store.commercelayer.app/microstore/list/skuList123?accessToken=${ioAccessToken}`,
        my_account: `https://demo-store.commercelayer.app/my-account?accessToken=${ioAccessToken}`,
      },
    })
  })

  it("should use default links set to our official build-in apps (microstore as sku)", () => {
    const config = getMfeConfig({
      jsonConfig: null,
      params: {
        accessToken: ioAccessToken,
        orderId: "order123",
        skuId: "sku123",
      },
      market: "market:id:ZKcv13rT",
    })
    expect(config).toMatchObject({
      links: {
        cart: `https://demo-store.commercelayer.app/cart/order123?accessToken=${ioAccessToken}`,
        checkout: `https://demo-store.commercelayer.app/checkout/order123?accessToken=${ioAccessToken}`,
        identity: `https://demo-store.commercelayer.app/identity`,
        microstore: `https://demo-store.commercelayer.app/microstore/sku/sku123?accessToken=${ioAccessToken}`,
        my_account: `https://demo-store.commercelayer.app/my-account?accessToken=${ioAccessToken}`,
      },
    })
  })

  it("should use default links set to our official build-in apps with the ability to extend", () => {
    const config = getMfeConfig({
      jsonConfig: {
        mfe: {
          default: {
            links: {
              cart: "https://custom-cart.example.com/:order_id?accessToken=:access_token",
              checkout:
                "https://custom-checkout.example.com/:order_id?accessToken=:access_token",
            },
          },
          "market:id:ZKcv13rT": {
            links: {
              cart: "https://market-cart.example.com/:order_id?accessToken=:access_token",
              identity: "https://custom-identity.example.com",
            },
          },
        },
      },
      params: {
        accessToken: ioAccessToken,
        orderId: "order123",
        skuListId: "skuList123",
      },
      market: "market:id:ZKcv13rT",
    })
    expect(config).toMatchObject({
      links: {
        cart: `https://market-cart.example.com/order123?accessToken=${ioAccessToken}`,
        checkout: `https://custom-checkout.example.com/order123?accessToken=${ioAccessToken}`,
        identity: `https://custom-identity.example.com`,
        microstore: `https://demo-store.commercelayer.app/microstore/list/skuList123?accessToken=${ioAccessToken}`,
        my_account: `https://demo-store.commercelayer.app/my-account?accessToken=${ioAccessToken}`,
      },
    })
  })
})

const ioAccessToken =
  "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjliN2JiZmVlMzQzZDVkNDQ5ZGFkODhmMjg0MGEyZTM3YzhkZWFlZTg5NjM4MGQ1ODA2YTc4NWVkMWQ1OTc5ZjAifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJleW9aT0Z2UHBSIiwic2x1ZyI6ImRlbW8tc3RvcmUiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJwWWRxaVBBUW5NIiwiY2xpZW50X2lkIjoiQklTRzhiYjNHV3BDOF9EN050MVN1V1dkaWVTNWJKcTgzMUE1MExnQl9JZyIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlLCJjb25maWRlbnRpYWwiOmZhbHNlfSwibWFya2V0Ijp7ImlkIjpbIktvYUpZaE1WVmoiXSwic3RvY2tfbG9jYXRpb25faWRzIjpbIkRHekFvdXBwd24iLCJva2RZenVZWXZNIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sInNjb3BlIjoibWFya2V0OmlkOktvYUpZaE1WVmoiLCJleHAiOjE3NzAwMzg1NTIsInRlc3QiOnRydWUsInJhbmQiOjAuOTk0OTg2OTM3MzE4MzUxMywiaWF0IjoxNzcwMDMxMzUyLCJpc3MiOiJodHRwczovL2F1dGguY29tbWVyY2VsYXllci5pbyJ9.YoOSos--J0BBEVWnOWDPcF7EgDVMK2ieyzjpOEnR8z7G89PfURv6NX34vexUsYu7HxKwUCd7jrZHBON7Ya1jE8YD5L17eikTxGqm5sDcbLf2eQSVA3tvWcIKrkgAw-t1A_XfD2qCttBuINIM43A8umTQC6ABH3Bprfg5EpFCEfButhdABTb6gf_RAISo-qG3IryLew02x-0xXAJcOfZKvSOkh3CcPZF6IrSfdsFN0Lts2R5-W5u8nXXP2XTmA8kmjCmvH-aEdHDjxJ5wR_AKlNu2Z7IOsTsrrQl_GkLgzGunZcaphCdn7qzWcSwQuhJqR9awOGpEMOFpzaGmrot1pwDfKnuXEhl1VLDUrQXQwm1im0kGopkx_GwnVSmSlhB9FKOK7nIQ4NnBu22vn8kdAcJv8qdyyK4nJlpWeUHyzZW6HxbXCC_RIdqt7P0Q7cDfFIOv0gUO0hs4IhU4r5CCifT8Vkzxss1lWHJPrUrO26B7eUmhiy_0_XKH71xWQ4O2jl2pdb7dqp9wr_vDTM1NteBhV0-xgkkw6FLUz2jwTxnNsNrbtHRiXCWaeD_AgrTFxy_oeHQerP_vcqfK4GwIMfb6GXRxE_e6CR1awz12LoX7k64NGZwAQUVGHCpLjLfr4GXDdRK97RyChnDVvb8eq1GGq1aa9P525egRG0dQ4C0"
