import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../types/transaction.type';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = 'http://26.59.168.146:8090/reciphe';

  constructor(private httpClient: HttpClient) {}

  getAllTransactions(): Observable<Transaction[]> {
    return this.httpClient.get<Transaction[]>(`${this.apiUrl}`);
  }
}
