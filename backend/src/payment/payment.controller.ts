import { Controller, Post, Body, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ServiceService } from '../service/service.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly serviceService: ServiceService,
  ) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() { serviceId }: { serviceId: number },
    @Res() res,
  ) {
    const service = await this.serviceService.findOne(serviceId);
    const session = await this.paymentService.createCheckoutSession(service);
    res.json({ id: session.id });
  }
}
