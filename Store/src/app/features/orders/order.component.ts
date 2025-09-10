import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from '../../core/services/order.service';
import {IOrder} from '../../shared/models/order/iorder';
import {RouterLink} from '@angular/router';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-order',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit{
  private orderService = inject(OrderService);
  orders: IOrder[] = [];

  ngOnInit(): void {
    this.orderService.getOrdersForUser().subscribe({
      next: orders => this.orders = orders,
      error: error => console.log(error)
    });
  }
}
