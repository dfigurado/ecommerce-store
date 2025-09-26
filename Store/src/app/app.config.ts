import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { lastValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { InitService } from './core/services/init.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      errorInterceptor,
      loadingInterceptor,
      authInterceptor
    ])),
    provideAnimations(),
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      return lastValueFrom(initService.init()).finally(() => {
          const splash = document.getElementById('initial-splash');
          if (splash) {
            splash.remove();
          }
        })
    }),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { autoFocus: 'dialog', restoreFocus: true },
    },
  ],
};
