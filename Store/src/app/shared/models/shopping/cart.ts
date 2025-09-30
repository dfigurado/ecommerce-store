import { nanoid } from "nanoid";
import { CartItem } from "./cartitem";
import { CartType } from "./carttype";
import { Coupon } from "./coupon";

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
  coupon?: Coupon;
}
