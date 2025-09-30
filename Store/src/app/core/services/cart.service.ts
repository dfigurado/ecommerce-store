import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IDeliveryMethod } from '../../shared/models/ideliverymethod';
import { IProduct } from '../../shared/models/iproduct';
import { Cart } from '../../shared/models/shopping/cart';
import { CartItem } from '../../shared/models/shopping/cartitem';
import { Coupon } from '../../shared/models/shopping/coupon';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  cart = signal<Cart | null>(null);

  itemCount = computed(() => {
    return this.cart()?.items.reduce((total, item) => total + item.quantity, 0);
  });

  selectedDelivery = signal<IDeliveryMethod | null>(null);

  totals = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();

    if (!cart) return null;
    const subtotal = cart.items.reduce((total, item) =>
      total + item.price * item.quantity, 0);

    let discountValue = 0;

    if (cart.coupon) {
      if (cart.coupon?.amountOff) {
        discountValue = cart.coupon.amountOff;
      } else if (cart.coupon.percentOff) {
        discountValue = subtotal * (cart.coupon.percentOff / 100);
      }
    }

    const shipping = delivery ? delivery.price : 0;

    const total = subtotal + shipping - discountValue;

    return {
      subtotal,
      shipping,
      discount: discountValue,
      total
    };
  })

  getCart(id:string) {
    return this.http.get<Cart>(this.baseUrl + "cart?id=" + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    )
  }

  setCart(cart: Cart) {
    return this.http.put<Cart>(this.baseUrl + "cart", cart).pipe(
      tap(cart => {
        this.cart.set(cart);
      })
    );
  }

  applyDiscount(code: string) {
    return this.http.get<Coupon>(this.baseUrl + 'coupons/' + code);
  }

  async addItemToCart (item: CartItem | IProduct, quantity = 1) {
    const cart = this.cart() ?? this.createCart();
    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }
    cart.items = this.addOrUpdateItem(cart.items, item, quantity);
    await firstValueFrom(this.setCart(cart));
  }

  async removeItemFromCart(productId: number, quantity: number = 1) {
    const cart = this.cart();
    if (!cart) return;
    const index = cart.items.findIndex(i => i.productId === productId);
    if (index !== -1) {
      if (cart.items[index].quantity > quantity) {
        cart.items[index].quantity -= quantity;
      } else {
        cart.items.splice(index, 1);
      }
      if (cart.items.length === 0) {
        this.deleteCart();
      } else {
        await firstValueFrom(this.setCart(cart));
      }
    }
  }

  deleteCart() {
    this.http.delete(this.baseUrl + "cart?id=" + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    })
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number) {
    const index = items.findIndex(i => i.productId === item.productId);
    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity;
    }

    return items;
  }

  private mapProductToCartItem(item: IProduct): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      imageUrl: item.imageUrl,
      brand: item.brand,
      type: item.type
    }
  }

  private isProduct(item: CartItem | IProduct ): item is IProduct {
    return (item as IProduct).id !== undefined;
  }

  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
