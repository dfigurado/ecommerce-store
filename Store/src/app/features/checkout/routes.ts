import { Route } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { orderCompleteGuard } from '../../core/guards/order-complete-guard';
import { emptyCartGuardGuard } from '../../core/guards/empty-cart-guard-guard';
import { CheckoutComponent } from './checkout.component';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';

export const checkoutRoutes: Route[] = [
  { path: '', component: CheckoutComponent, canActivate: [authGuard, emptyCartGuardGuard] },
  { path: 'success', component: CheckoutSuccessComponent, canActivate: [authGuard, orderCompleteGuard] }
];
