import {StepperSelectionEvent} from '@angular/cdk/stepper';
import {CurrencyPipe} from '@angular/common';
import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {Router, RouterLink} from '@angular/router';
import {
  ConfirmationToken,
  StripeAddressElement,
  StripeAddressElementChangeEvent,
  StripePaymentElement,
  StripePaymentElementChangeEvent
} from '@stripe/stripe-js';
import {firstValueFrom} from 'rxjs';
import {AccountService} from '../../core/services/account.service';
import {CartService} from '../../core/services/cart.service';
import {SnackbarService} from '../../core/services/snackbar.service';
import {StripeService} from '../../core/services/stripe.service';
import {OrderSummaryComponent} from '../../shared/components/order-summary/order-summary.component';
import {IAddress} from '../../shared/models/iaddress';
import {CheckoutDeliveryComponent} from "./checkout-delivery/checkout-delivery.component";
import {CheckoutReviewComponent} from './checkout-review/checkout-review.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {IShippingAddress} from '../../shared/models/order/ishippingaddress';
import {IOrderToCreate} from '../../shared/models/order/iordertocreate';
import {OrderService} from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    RouterLink,
    MatButton,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {

  cartService = inject(CartService);

  private router = inject(Router);
  private snackBar = inject(SnackbarService);
  private stripeService = inject(StripeService);
  private accountService = inject(AccountService);
  private orderService = inject(OrderService);

  loading = false;
  saveAddress = false;
  paymentElement?: StripePaymentElement;
  confirmationToken?: ConfirmationToken;
  billingAddressElement?: StripeAddressElement;

  completionStatus = signal<{
    address: boolean,
    card: boolean,
    delivery: boolean
  }>({
      address: false,
      card: false,
      delivery: false
    });

  async ngOnInit() {
    try {
      this.billingAddressElement = await this.stripeService.createAddressElement();
      this.billingAddressElement.mount('#address-element');
      this.billingAddressElement.on('change', this.handleAddressChange);

      this.paymentElement = await this.stripeService.createPaymentElement();
      this.paymentElement.mount('#payment-element');
      this.paymentElement.on('change', this.handlePaymentChange)

    } catch (error: any) {
      this.snackBar.error(error.message);
    }
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update(state => {
      state.address = event.complete
      return state;
    });
  }

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update(state => {
      state.card = event.complete
      return state;
    });
  }

  handleDeliveryChange(event: boolean) {
    this.completionStatus.update(state => {
      state.delivery = event;
      return state;
    })
  }

  async getConfirmationToken() {
    try
    {
      if (Object.values(this.completionStatus()).every(status => status)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
    } catch (error: any) {
      this.snackBar.error(error.message);
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress();
        address && await firstValueFrom(this.accountService.updateAddress(address));
      }
    }

    if (event.selectedIndex === 2) {
      this.stripeService.createOrUpdatePaymentIntent();
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);

        if (result.paymentIntent?.status === 'succeeded') {
          const orderToCreate = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(orderToCreate));

          if (!orderResult) {
            throw new Error('Order creation failed');
          } else {
            this.cartService.deleteCart();
            this.cartService.selectedDelivery.set(null);
            this.router.navigateByUrl('checkout/success');
          }
        } else if (result.error) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Payment failed');
        }
      }
    } catch (error: any) {
      this.snackBar.error(error.message || 'Failure');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async createOrderModel(): Promise<IOrderToCreate> {
    const cart = this.cartService.cart();
    const shippingAddress = await this.getAddressFromStripeAddress() as IShippingAddress;
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !cart?.deliveryMethodId || !card || !shippingAddress) {
      throw new Error('Problem creating order');
    }

    return {
      cartId: cart.id,
      deliveryMethodId: cart.deliveryMethodId,
      shippingAddress: shippingAddress,
      paymentSummary: {
        last4: card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      }
    };
  }

  private async getAddressFromStripeAddress(): Promise<IAddress | IShippingAddress | null> {
    const result = await this.billingAddressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        name: result?.value.name,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        county: address.state ,
        postalCode: address.postal_code,
        country: address.country ?? "United Kingdom"
      };
    } else return null;
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }
}
