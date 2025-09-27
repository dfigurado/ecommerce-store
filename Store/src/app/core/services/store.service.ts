import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IPagination } from '../../shared/models/ipagination';
import { IProduct } from '../../shared/models/iproduct';
import { ShopParams } from '../../shared/models/shopparams';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private brandSubject = new BehaviorSubject<string[]>([]);
  private typeSubject = new BehaviorSubject<string[]>([]);

  product_types$ = this.typeSubject.asObservable();
  product_brands$ = this.brandSubject.asObservable();

  getProducts(shopParams: ShopParams) {
    let params = new HttpParams();

    if (shopParams.brands.length > 0) {
      params = params.append('brands', shopParams.brands.join(','));
    }

    if (shopParams.types.length > 0) {
      params = params.append('types', shopParams.types.join(','));
    }

    if (shopParams.sort) {
      params = params.append('sort', shopParams.sort);
    }

    if (shopParams.search) {
      params = params.append('search', shopParams.search);
    }

    params = params.append('pageSize', shopParams.pageSize);
    params = params.append('pageIndex', shopParams.pageNumber);

    return this.http.get<IPagination<IProduct>>(this.baseUrl + 'products', {
      params,
    });
  }

  getProduct(id: number) {
    return this.http.get<IProduct>(this.baseUrl + 'products/' + id);
  }

  getBrands() {
    if (this.brandSubject.value.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + 'products/brands').subscribe({
      next: (product_brands) => this.brandSubject.next(product_brands),
      error: (error) => console.log(error),
      complete: () => console.log(this.product_brands$),
    });
  }

  getTypes() {
    if (this.typeSubject.value.length > 0) return;
    return this.http.get<string[]>(this.baseUrl + 'products/types').subscribe({
      next: (product_types) => this.typeSubject.next(product_types),
      error: (error) => console.log(error),
      complete: () => console.log(this.product_types$),
    });
  }
}
