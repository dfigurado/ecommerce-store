import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatCardImage } from '@angular/material/card';
import { ConfirmationToken } from '@stripe/stripe-js';
import { CartService } from '../../../core/services/cart.service';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymenCardtPipe } from '../../../shared/pipes/payment-pipe';

@Component({
  selector: 'app-checkout-review',
  imports: [
    CurrencyPipe,
    MatCardImage,
    NgOptimizedImage,
    AddressPipe,
    PaymenCardtPipe
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss'
})
export class CheckoutReviewComponent {
  cartService = inject(CartService);
  @Input() confirmationToken?: ConfirmationToken;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "/images/products/placeholder.png";
  }
}
