import { inject, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { AccountService } from '../../../core/services/account.service';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  private activatedRoute = inject(ActivatedRoute);
  returnUrl = '/shop';

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) {
      this.returnUrl = url;
    }
  }

  loginForm = this.formBuilder.group({
    email: [''],
    password: [''],
  });

  onSubmit() {
    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.accountService.getUserInfo().subscribe();
        this.router.navigateByUrl(this.returnUrl);
      },
    });
  }
}
