import { CartService } from './../../../core/services/cart.service';
import { Component, Input, inject } from '@angular/core';
import {IProduct} from '../../../shared/models/iproduct';
import {MatCard, MatCardActions, MatCardContent, MatCardImage } from '@angular/material/card';
import {CurrencyPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    CurrencyPipe,
    MatCardActions,
    MatIcon,
    MatButton,
    MatCardImage,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input() product?: IProduct
  cartService = inject(CartService);

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "/images/products/placeholder.png";
  }
}
