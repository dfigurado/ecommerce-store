import {CartItem} from './cartitem';

export type CartType = {
  id: string;
  items: CartItem[];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}
