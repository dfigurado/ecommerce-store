import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymenCardtPipe } from '../../../shared/pipes/payment-pipe';

@Component({
  selector: 'app-checkout-success',
  imports: [
    MatButton,
    RouterLink,
    MatProgressSpinnerModule,
    DatePipe,
    AddressPipe,
    CurrencyPipe,
    PaymenCardtPipe,
  ],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss'
})
export class CheckoutSuccessComponent implements OnDestroy {
  signalrService = inject(SignalrService);
  private orderService = inject(OrderService);

  ngOnDestroy() {
    this.orderService.orderComplete = false;
    this.signalrService.orderSignal.set(null);
  }
}
