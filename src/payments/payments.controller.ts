import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentSessionDto } from './dto/payment-session.dto'
import { Request, Response } from 'express'
import { MessagePattern } from '@nestjs/microservices'

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@MessagePattern('create.payment.session')
	@Post('create-payment-session')
	createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
		return this.paymentsService.createPaymentSession(paymentSessionDto)
	}

	@Post('webhook')
	stripeWebhook(@Req() req: Request, @Res() res: Response) {
		this.paymentsService.stripeWebhook(req, res)
	}

	@Get('success')
	success() {
		return {
			ok: true,
			message: 'Payment successful'
		}
	}

	@Get('cancel')
	cancel() {
		return {
			ok: false,
			message: 'Payment cancelled'
		}
	}
}
