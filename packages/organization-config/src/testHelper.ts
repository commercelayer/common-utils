export const defaultConfig = {
  links: {
    cart: "https://cart.example.com/:order_id?accessToken=:access_token",
    my_account: "https://cart.example.com/:order_id/:token/:access_token",
    checkout:
      "https://checkout.example.com/:order_id?accessToken=:access_token",
  },
  checkout: {
    thankyou_page: "https://example.com/thanks/:lang/:order_id",
    billing_countries: [
      {
        value: "ES",
        label: "Espana",
      },
      {
        value: "IT",
        label: "Italia",
      },
      {
        value: "US",
        label: "Unites States of America",
      },
    ],
    defaultConfig: "IT",
    billing_states: {
      FR: [
        {
          value: "PA",
          label: "Paris",
        },
        {
          value: "LY",
          label: "Lyon",
        },
        {
          value: "NI",
          label: "Nice",
        },
        {
          value: "MA",
          label: "Marseille",
        },
        {
          value: "BO",
          label: "Bordeaux",
        },
      ],
      IT: [
        {
          value: "FI",
          label: "Firenze",
        },
        {
          value: "PO",
          label: "Prato",
        },
        {
          value: "LI",
          label: "Livorno",
        },
      ],
    },
  },
}

export const overrideConfig = {
  links: {
    cart: "https://example.com/custom-cart/:order_id?accessToken=:access_token",
  },
}
