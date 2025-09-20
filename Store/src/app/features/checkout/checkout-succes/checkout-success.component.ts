import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {SignalrService} from '../../../core/services/signalr.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {AddressPipe} from '../../../shared/pipes/address-pipe';
import {PaymenCardtPipe} from '../../../shared/pipes/payment-pipe';

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
export class CheckoutSuccessComponent {
  signalrService = inject(SignalrService);

}
