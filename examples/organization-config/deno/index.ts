import { getConfig } from '@commercelayer/organization-config'

const defaultConfig = {
  links: {
    cart: 'https://cart.example.com/:order_id?accessToken=:access_token',
    checkout: 'https://checkout.example.com/:order_id?accessToken=:access_token'
  },
  checkout: {
    thankyou_page: 'https://example.com/thanks/:lang/:order_id'
  }
}

const overrideConfig = {
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

const config = getConfig({
  jsonConfig,
  market: 'market:id:ZKcv13rT',
  params: {
    lang: 'en',
    orderId: 'order-123',
    accessToken: 'my-valid-access-token'
  }
})

console.log(config)
