# organization-config

Organization config utils for extracting config by market.

## How to use

```shell
pnpm add @commercelayer/organization-config
```

you can use the function `getConfig` to manipulate the configuration settings of your organization.

```javascript
getConfig({
  jsonConfig: organizationConfig,
  market: 'market:id:hashid',
  params: { lang: 'en', orderId: 'your-order-id' }
})

```

The function is going to manipulate the organization configuration, extract the `mfe` key and merge `default` configuration with overrides for the market used.