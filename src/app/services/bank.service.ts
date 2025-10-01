import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bank } from '../types/bank.type';
import { AccountType } from '../types/account-type.type';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  getAllBanks(): Observable<Bank[]> {
    return this.httpClient.get<Bank[]>(`${this.apiUrl}/banks`);
  }

  getAllAccountTypes(): Observable<AccountType[]> {
    return this.httpClient.get<AccountType[]>(`${this.apiUrl}/account-types`);
  }
}
