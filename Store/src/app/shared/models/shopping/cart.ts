import { nanoid } from "nanoid";
import { CartItem } from "./cartitem";
import { CartType } from "./carttype";

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
  deliveryMethodId?: number;
  paymentIntentId?: string;
  clientSecret?: string;
}
