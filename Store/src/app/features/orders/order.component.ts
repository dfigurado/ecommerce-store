import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../shared/models/order/iorder';

@Component({
  selector: 'app-order',
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
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

  removeOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe({
      next: orders => this.orders = orders,
      error: error => console.log(error)
    });
  }
}
