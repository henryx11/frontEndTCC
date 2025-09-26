import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {

  constructor(private httpClient: HttpClient) { }

  getCards() {
  return this.httpClient.get("http://26.59.168.146:8090/creditCard") // implementar Interceptor
  }
}
