import { IProduct } from './../../shared/models/iproduct';
import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Cart } from '../../shared/models/shopping/cart';
import { CartItem } from '../../shared/models/shopping/cartitem';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  cart = signal<Cart | null>(null);
  itemCount = computed(() => {
    return this.cart()?.items.reduce((total, item) => total + item.quantity, 0);
  })

  totals = computed(() => {
    const carts = this.cart();
    if (!carts) return null;
    const subtotal = carts.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = 0;
    const discount = 0;
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
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
    return this.http.put<Cart>(this.baseUrl + "cart", cart).subscribe({
      next: cart => this.cart.set(cart),
      error: error => console.log(error)
    });
  }

  deleteCart(id: string) {
    return this.http.delete(this.baseUrl + "cart?id=" + id).subscribe({
      next: () => this.cart.set(null),
      error: error => console.log(error)
    });
  }

  addItemToCart(item: CartItem | IProduct, quantity = 1) {
    const cart = this.cart() ?? this.createCart();
    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }
    cart.items = this.addOrUpdateItem(cart.items, item, quantity);
    this.setCart(cart);
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
      quantity: 1,
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