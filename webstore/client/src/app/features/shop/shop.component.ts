import { Component, inject, OnInit } from '@angular/core';
import { StoreService } from '../../core/services/store.service';
import { IProduct } from '../../shared/models/iproduct';
import {ProductItemComponent} from './product-item/product-item.component';
import {MatDialog} from '@angular/material/dialog';
import {FiltersModalComponent} from './filters-modal/filters-modal.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})

export class ShopComponent implements OnInit {
  private shopService = inject(StoreService);
  private dialogService = inject(MatDialog);

  products: IProduct[] = [];
  selectedBrands: string[] = [];
  selectedTypes: string[] = [];

  ngOnInit(): void {
    this.initShop();
  }

  initShop() {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.shopService.getProducts().subscribe({
       next: response => this.products = response.data,
       error: error => console.log(error)
    })
  }

  openFiltersModal() {
    const modalRef = this.dialogService.open(FiltersModalComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.selectedBrands,
        selectedTypes: this.selectedTypes
      }
    });
    modalRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          console.log(result);
          this.selectedBrands = result.selectedBrands;
          this.selectedTypes = result.selectedTypes;
          this.initShop();
        }
      }
    });
  }
}
