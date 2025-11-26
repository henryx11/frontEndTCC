// src/app/services/receita.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateReceitaRequest, UpdateReceitaRequest, ReceitaResponse, Receita } from '../types/receita.type';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Cria uma nova receita
   */
  createReceita(receitaData: CreateReceitaRequest): Observable<ReceitaResponse> {
    return this.httpClient.post<ReceitaResponse>(`${this.apiUrl}/reciphe/create`, receitaData);
  }

  /**
   * ✅ CORRIGIDO: Busca todas as receitas do usuário
   * Agora aceita receitas com active === 'ACTIVE' OU active === null
   * (null geralmente significa que a receita pertence a uma conta reativada)
   */
  getAllReceitas(): Observable<Receita[]> {
    return this.httpClient.get<Receita[]>(`${this.apiUrl}/reciphe`).pipe(
      map(receitas => receitas.filter(r =>
        r.active === 'ACTIVE' || r.active === null || r.active === undefined
      ))
    );
  }

  /**
   * Atualiza uma receita existente
   */
  updateReceita(uuid: string, receitaData: UpdateReceitaRequest): Observable<ReceitaResponse> {
    return this.httpClient.put<ReceitaResponse>(`${this.apiUrl}/reciphe/${uuid}`, receitaData);
  }

  /**
   * Exclui uma receita
   */
  deleteReceita(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/reciphe/${uuid}`);
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

  /**
   * ✅ CORRIGIDO: Busca receitas por período de datas
   * Agora aceita receitas com active === 'ACTIVE' OU active === null
   */
  buscarReceitasPorPeriodo(dataInicio: string, dataFim: string): Observable<Receita[]> {
    const params = new HttpParams()
      .set('field', 'registration')
      .set('fromDate', dataInicio)
      .set('toDate', dataFim);

    return this.httpClient.get<Receita[]>(`${this.apiUrl}/reciphe/search`, { params }).pipe(
      map(receitas => receitas.filter(r =>
        r.active === 'ACTIVE' || r.active === null || r.active === undefined
      ))
    );
  }

  /**
   * Formata data do backend (YYYY-MM-DD) sem conversão de timezone
   */
  formatDate(date: string | null): string {
    if (!date) return this.getCurrentDate();

    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      if (date.includes('T')) {
        return date.split('T')[0];
      }

      const dateObj = new Date(date + 'T12:00:00');
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return this.getCurrentDate();
    }
  }
}
