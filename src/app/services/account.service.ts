import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../types/account.type';
import { CreateAccountRequest } from '../types/create-account-request.type';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly apiUrl = 'http://26.59.168.146:8090/accounts';

  constructor(private httpClient: HttpClient) {}

  createAccount(accountData: CreateAccountRequest): Observable<Account> {
    const payload = {
      name: accountData.name,
      balance: accountData.balance,
      bank: {
        uuid: accountData.bankId
      },
      type: {
        uuid: accountData.typeId
      }
    };

    return this.httpClient.post<Account>(`${this.apiUrl}/create`, payload);
  }

  getUserAccounts(): Observable<Account[]> {
    return this.httpClient.get<Account[]>(`${this.apiUrl}`);
  }

  // Atualizar conta
  updateAccount(account: Account): Observable<Account> {
    const payload = {
      uuid: account.uuid,
      name: account.name,
      balance: account.balance,
      bank: {
        uuid: account.bank.uuid,
        name: account.bank.name
      },
      type: {
        uuid: account.type.uuid,
        description: account.type.description
      }
    };

    return this.httpClient.put<Account>(`${this.apiUrl}/${account.uuid}`, payload);
  }

  // Desativar conta
  deactivateAccount(accountUuid: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/deactivate/${accountUuid}`);
  }

  // Ativar conta
  activateAccount(accountUuid: string): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/activate/${accountUuid}`, {});
  }
}
