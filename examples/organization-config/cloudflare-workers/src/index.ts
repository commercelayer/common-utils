/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getConfig } from '@commercelayer/organization-config';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const defaultConfig = {
			links: {
				cart: 'https://cart.example.com/:order_id?accessToken=:access_token',
				checkout: 'https://checkout.example.com/:order_id?accessToken=:access_token',
			},
			checkout: {
				thankyou_page: 'https://example.com/thanks/:lang/:order_id',
			},
		};

		const overrideConfig = {
			links: {
				cart: 'https://example.com/custom-cart/:order_id?accessToken=:access_token',
			},
		};

		const jsonConfig = {
			mfe: {
				default: defaultConfig,
				'market:id:ZKcv13rT': overrideConfig,
			},
		};

		const config = getConfig({
			jsonConfig,
			market: 'market:id:ZKcv13rT',
			params: {
				lang: 'en',
				orderId: 'order-123',
				accessToken: 'my-valid-access-token',
			},
		});

		console.log(config);
		return new Response(`Hello World! ${JSON.stringify(config)}}`);
	},
};
