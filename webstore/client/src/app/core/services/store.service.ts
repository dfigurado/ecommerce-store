import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IPaggination } from '../../shared/models/ipagination';
import { IProduct } from '../../shared/models/iproduct';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  baseUrl = "http://localhost:5164/api/";
  private http = inject(HttpClient);

  product_types: string[] = [];
  product_brands: string[] = [];

  getProducts() {
    return this.http.get<IPaggination<IProduct>>(this.baseUrl + "products?pageSize=20")
  }

  getTypes() {
    if (this.product_types.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + "products/types").subscribe({
      next: response => this.product_types = response
    })
  }

  getBrands() {
    if (this.product_brands.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + "products/brands").subscribe({
      next: response => this.product_brands = response
    })
  }

}
