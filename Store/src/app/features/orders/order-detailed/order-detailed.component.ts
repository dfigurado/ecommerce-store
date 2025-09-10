import {Component, inject, OnInit} from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import {ActivatedRoute} from '@angular/router';
import {IOrder} from '../../../shared/models/order/iorder';
import {MatCardModule} from '@angular/material/card';
import {CurrencyPipe, DatePipe, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-order-detailed',
  imports: [
    MatCardModule,
    DatePipe,
    CurrencyPipe,
    NgOptimizedImage
  ],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.scss'
})
export class OrderDetailedComponent implements OnInit {
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);
  order?: IOrder;

  ngOnInit(): void {
    this.getOrder();
  }

  getOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(+id).subscribe({
        next: order => this.order = order,
        error: error => console.log(error)
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "/images/products/placeholder.png";
  }
}
