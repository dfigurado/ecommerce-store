import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize, identity } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { environment } from '../../../environments/environment';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  loadingService.loadingStart();

  return next(req).pipe(
    (environment.production ? identity : delay(500)),
    finalize(() => loadingService.loadingIdle())
  );
};
