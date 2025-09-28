import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../../shared/models/iproduct';
import { CartService } from './../../../core/services/cart.service';

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
    img.src = "/images/placeholder.png";
  }
}
