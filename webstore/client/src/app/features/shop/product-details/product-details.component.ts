import {Component, inject, OnInit} from '@angular/core';
import {StoreService} from '../../../core/services/store.service';
import {ActivatedRoute} from '@angular/router';
import {IProduct} from '../../../shared/models/iproduct';
import {MatButton} from '@angular/material/button';
import {CurrencyPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatDivider} from '@angular/material/divider';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-product-details',
  imports: [
    MatButton,
    CurrencyPipe,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    MatDivider,
    NgOptimizedImage
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(StoreService);
  private activateRouter = inject(ActivatedRoute);

  product?: IProduct;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(){
    const id = this.activateRouter.snapshot.paramMap.get('id');
    if (id) {
      this.shopService.getProduct(+id).subscribe({
        next: product => this.product = product,
        error: error => console.log(error)
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = "/images/products/placeholder.png";
  }
}
