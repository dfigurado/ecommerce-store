import {Component, inject} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatProgressBar} from '@angular/material/progress-bar';
import {LoadingService} from '../../core/services/loading.service';
import { CartService } from '../../core/services/cart.service';


@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    RouterLinkActive,
    MatProgressBar
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  loadingService = inject(LoadingService);
  cartService = inject(CartService);
}
