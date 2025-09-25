import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { StoreService } from '../../core/services/store.service';
import { IPagination } from '../../shared/models/ipagination';
import { IProduct } from '../../shared/models/iproduct';
import { ShopParams } from '../../shared/models/shopparams';
import { FiltersModalComponent } from './filters-modal/filters-modal.component';
import { ProductItemComponent } from './product-item/product-item.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatMenu,
    MatPaginator,
    FormsModule,
    MatIconButton
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})

export class ShopComponent implements OnInit {
  private shopService = inject(StoreService);
  private dialogService = inject(MatDialog);

  products?: IPagination<IProduct>;
  brands: string[] = [];
  types: string[] = [];
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low to High', value: 'priceAsc' },
    { name: 'Price: High to Low', value: 'priceDesc' }
  ]
  shopParams = new ShopParams();
  pageSizeOptions = [10, 20, 50, 100];

  ngOnInit(): void {
    this.initShop();
  }

  initShop() {
    this.loadProductBrands();
    this.loadProductTypes();
    this.getProducts();
  }

  loadProductTypes() {
    this.shopService.getTypes();
    this.shopService.product_types$.subscribe({
      next: types => this.types = types,
      error: error => console.log(error),
      complete: () => console.log("Shop Init - Types: ",this.types)
    })
  }

  loadProductBrands() {
    this.shopService.getBrands();
    this.shopService.product_brands$.subscribe({
      next: brands => this.brands = brands,
      error: error => console.log(error),
      complete: () => console.log("Shop Init - Brands: ",this.brands)
    })
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => console.log(error)
    })
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.shopParams.sort = selectedOption.value
      this.shopParams.pageNumber = 1
      this.getProducts();
    }
  }

  openFiltersModal() {
    const modalRef = this.dialogService.open(FiltersModalComponent, {
      minWidth: '500px',
      data: {
        brands: this.brands,
        types: this.types,
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    });
    modalRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes;
          this.shopParams.pageNumber = 1;
          this.getProducts()
        }
      }
    });
  }
}
