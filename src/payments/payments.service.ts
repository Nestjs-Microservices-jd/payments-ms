import { Injectable } from '@nestjs/common'
import { envs } from 'src/config'
import Stripe from 'stripe'
import { PaymentSessionDto } from './dot/payment-session.dto'
import { Request, Response } from 'express'

@Injectable()
export class PaymentsService {
	private readonly stripe = new Stripe(envs.stripeSecret)

	createPaymentSession(paymentSessionDto: PaymentSessionDto) {
		const { currency, items, orderId } = paymentSessionDto

		const lineItems = items.map(item => {
			return {
				price_data: {
					currency: currency,
					product_data: {
						name: item.name
					},
					unit_amount: Math.round(item.price * 100) // // 20 dolares 2000 / 100  = 20.00
				},
				quantity: item.quantity
			}
		})

		return this.stripe.checkout.sessions.create({
			// Colocar el ID de la orden
			payment_intent_data: {
				metadata: {
					orderId
				}
			},
			line_items: lineItems,
			mode: 'payment',
			success_url: envs.stripeSuccessUrl,
			cancel_url: envs.stripeCancelUrl
		})
	}

	stripeWebook(req: Request, res: Response) {
		// install stripe CLI
		// https://docs.stripe.com/webhooks#local-listener

		// testing
		// to get the enpdointSecret run 'stripe listen'
		// example: 'whsec_fa133fdbc5eba01aced2581e0b60a121bbdb7013a85a4b1ab689f204ad6f2c85'
		// stripe login
		// stripe listen --forward-to http://localhost:3003/payments/webhook
		// stripe trigger payment_intent.succeeded

		const sig = req.headers['stripe-signature']

		// real con hookdeck, event gateway - forwarder. Usando CLI para el destino
		// stripe webhook -> hookdeck -> localhost - /payments/weebhook (CLI)
		// hookdeck listen [port] [source name]

		const endpointSecret = envs.stripeEndpointSecret
		let event: Stripe.Event

		try {
			event = this.stripe.webhooks.constructEvent(
				req['rawBody'],
				sig,
				endpointSecret
			)
		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`)
			return
		}

		switch (event.type) {
			case 'charge.succeeded':
				const chargeSucceeded = event.data.object
				console.log(chargeSucceeded.metadata)
				break
			default:
				console.log(`Event ${event.type} not handled`)
		}

		return res.status(200).send({ sig })
	}
}
