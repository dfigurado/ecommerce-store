import { Component } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-checkout-succes',
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './checkout-succes.component.html',
  styleUrl: './checkout-succes.component.scss'
})
export class CheckoutSuccesComponent {

}
