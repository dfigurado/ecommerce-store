import {CartType} from "./carttype";
import { CartItem } from "./cartitem";
import {nanoid} from "nanoid";

export class Cart implements CartType {
  id = nanoid();
  items: CartItem[] = [];
}
