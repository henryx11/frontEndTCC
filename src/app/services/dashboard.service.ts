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
   * Busca o total de receitas de todas as contas (método original)
   */
  getTotalReceitas(): Observable<number> {
    return this.httpClient.get<ReceitasTotalResponse>(`${this.apiUrl}/reciphe/total`).pipe(
      map(response => {
        console.log('📊 Resposta do backend (receitas/total):', response); // ✅ DEBUG
        return response?.total ?? 0;
      })
    );
  }

  /**
   * ✅ NOVO: Busca receitas apenas de contas ativas
   */
  getTotalReceitasContasAtivas(): Observable<number> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/reciphe`).pipe(
      map(receitas => {
        if (!receitas || !Array.isArray(receitas)) return 0;

        console.log('📋 Todas as receitas:', receitas); // ✅ DEBUG

        // Filtra apenas receitas de contas ativas
        const receitasAtivas = receitas.filter(receita =>
          receita.accounts?.active === 'ACTIVE' &&
          receita.active === 'ACTIVE'
        );

        console.log('✅ Receitas ativas filtradas:', receitasAtivas); // ✅ DEBUG

        // Soma os valores
        const total = receitasAtivas.reduce((sum, receita) => {
          return sum + (receita.value || 0);
        }, 0);

        console.log('💰 Total de receitas ativas:', total); // ✅ DEBUG

        return total;
      })
    );
  }

  /**
   * Busca todas as despesas e calcula o total
   */
  getTotalDespesas(): Observable<number> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/expense`).pipe(
      map(despesas => {
        if (!despesas || !Array.isArray(despesas)) return 0;

        console.log('📋 Todas as despesas:', despesas); // ✅ DEBUG

        // Filtra apenas despesas de contas ativas
        const despesasAtivas = despesas.filter(despesa =>
          despesa.accounts?.active === 'ACTIVE' &&
          despesa.active === 'ACTIVE'
        );

        console.log('✅ Despesas ativas filtradas:', despesasAtivas); // ✅ DEBUG

        // Soma todos os valores das despesas ativas
        const total = despesasAtivas.reduce((sum, despesa) => {
          return sum + (despesa.value || despesa.valor || 0);
        }, 0);

        console.log('💸 Total de despesas ativas:', total); // ✅ DEBUG

        return total;
      })
    );
  }

  /**
   * Busca o saldo total de todas as contas do usuário
   */
  getSaldoTotal(): Observable<number> {
    return this.httpClient.get<SaldoTotalResponse>(`${this.apiUrl}/accounts/total-balance`).pipe(
      map(response => {
        console.log('💳 Saldo total das contas:', response); // ✅ DEBUG
        return response?.total ?? 0;
      })
    );
  }
}
