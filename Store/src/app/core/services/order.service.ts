import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IOrder } from '../../shared/models/order/iorder';
import { IOrderToCreate } from '../../shared/models/order/iordertocreate';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  orderComplete = false;

  createOrder(orderToCreate: IOrderToCreate) {
    return this.http.post<IOrder>(this.baseUrl + 'orders', orderToCreate)
  }
  getOrdersForUser() {
    return this.http.get<IOrder[]>(this.baseUrl + 'orders');
  }
  getOrderById(id: number) {
    return this.http.get<IOrder>(this.baseUrl + 'orders/' + id);
  }
  deleteOrder(id: number) {
    return this.http.delete<IOrder[]>(this.baseUrl + 'orders/' + id);
  }
}
