import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-test-error',
  imports: [MatButton],
  templateUrl: './test-error.component.html',
  styleUrl: './test-error.component.scss'
})
export class TestErrorComponent {
  baseUrl = "http://localhost:5164/api/";
  private http = inject(HttpClient);
  validationErrors?: string[] = [];

  get404Error() {
    this.http.get(this.baseUrl + "error/notfound").subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get400Error() {
    this.http.get(this.baseUrl + "error/badrequest").subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get500Error() {
    this.http.get(this.baseUrl + "error/internalerror").subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get403Error() {
    this.http.get(this.baseUrl + "error/forbidden").subscribe({
      next: response => console.log(response),
      error: error => console.log(error)
    })
  }

  get401Error() {
    this.http.get(this.baseUrl + "error/unauthorized").subscribe({
      next: response => console.log(response),
    })
  }

  get400ValidationError() {
    this.http.post(this.baseUrl + "error/validationerror", {}).subscribe({
      next: response => console.log(response),
      error: error => this.validationErrors = error
    })
  }
}
