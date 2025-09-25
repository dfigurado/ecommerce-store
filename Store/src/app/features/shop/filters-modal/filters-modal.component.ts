import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatListOption, MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-filters-modal',
  imports: [
    MatDivider,
    MatSelectionList,
    MatListOption,
    MatButton,
    FormsModule,
  ],
  templateUrl: './filters-modal.component.html',
  styleUrl: './filters-modal.component.scss'
})
export class FiltersModalComponent {
  private dialogRef = inject(MatDialogRef<FiltersModalComponent>);
  data = inject(MAT_DIALOG_DATA);

  brands: string[] = this.data.brands;
  types: string[] = this.data.types;
  
  selectedBrands: string[] = this.data.selectedBrands;
  selectedTypes: string[] = this.data.selectedTypes;

  applyFilters() {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes
    });
  }
}
