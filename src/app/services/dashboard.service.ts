import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ReceitasTotalResponse,
  DespesasTotalResponse,
  SaldoTotalResponse
} from '../types/dashboard-stats.type';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Busca o total de receitas de todas as contas
   */
  getTotalReceitas(): Observable<number> {
    return this.httpClient.get<ReceitasTotalResponse>(`${this.apiUrl}/reciphe/total`).pipe(
      map(response => response?.total ?? 0)
    );
  }

  /**
   * Busca todas as despesas e calcula o total
   */
  getTotalDespesas(): Observable<number> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/expense`).pipe(
      map(despesas => {
        if (!despesas || !Array.isArray(despesas)) return 0;

        // Soma todos os valores das despesas
        return despesas.reduce((total, despesa) => {
          return total + (despesa.value || despesa.valor || 0);
        }, 0);
      })
    );
  }

  /**
   * ✨ Busca o saldo total de todas as contas do usuário
   */
  getSaldoTotal(): Observable<number> {
    return this.httpClient.get<SaldoTotalResponse>(`${this.apiUrl}/accounts/total-balance`).pipe(
      map(response => response?.total ?? 0)
    );
  }
}
