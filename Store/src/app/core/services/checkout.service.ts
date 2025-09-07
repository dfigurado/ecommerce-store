import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { IDeliveryMethod } from '../../shared/models/ideliverymethod';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  baseUrl = environment.apiUrl;
  deliveryMethods: IDeliveryMethod[] = [];
  private http = inject(HttpClient);

  getDeliveryMethods() {
    if (this.deliveryMethods.length > 0) return of(this.deliveryMethods)
    return this.http.get<IDeliveryMethod[]>(this.baseUrl + 'payments/delivery-methods').pipe(
      map(methods => {
        this.deliveryMethods = methods.sort((a, b) => a.price - b.price);
        return this.deliveryMethods;
      })
    );
  }
}
