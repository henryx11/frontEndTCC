import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransferRequest, TransferResponse } from '../types/transfer.type';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly apiUrl = 'http://26.59.168.146:8090/transactions';

  constructor(private httpClient: HttpClient) {}

  /**
   * Cria uma transferência entre contas
   */
  createTransfer(transferData: TransferRequest): Observable<TransferResponse> {
    return this.httpClient.post<TransferResponse>(`${this.apiUrl}/create`, transferData);
  }

  /**
   * Formata a data atual para o formato YYYY-MM-DD
   */
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
