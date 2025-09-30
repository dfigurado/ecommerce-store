import { CartItem } from './cartitem';
import { Coupon } from './coupon';

export type CartType = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  coupon?: Coupon;
}
