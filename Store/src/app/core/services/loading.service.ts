import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loading = false;
  loadingRequestCount = 0;

  loadingStart() {
    this.loading = true;
    this.loadingRequestCount++;
  }

  loadingIdle() {
    this.loadingRequestCount--;
    if (this.loadingRequestCount <= 0) {
      this.loadingRequestCount = 0;
      this.loading = false;
    }
  }
}
