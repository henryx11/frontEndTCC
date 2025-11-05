// src/app/services/despesa.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateDespesaRequest, UpdateDespesaRequest, DespesaResponse, Despesa } from '../types/despesa.type';

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Cria uma nova despesa
   */
  createDespesa(despesaData: CreateDespesaRequest): Observable<DespesaResponse> {
    return this.httpClient.post<DespesaResponse>(`${this.apiUrl}/expense/create`, despesaData);
  }

  /**
   * Busca todas as despesas do usuário
   */
  getAllDespesas(): Observable<Despesa[]> {
    return this.httpClient.get<Despesa[]>(`${this.apiUrl}/expense`).pipe(
      map(despesas => despesas.filter(d => d.active === 'ACTIVE'))
    );
  }

  /**
   * Atualiza uma despesa existente
   */
  updateDespesa(uuid: string, despesaData: UpdateDespesaRequest): Observable<DespesaResponse> {
    return this.httpClient.put<DespesaResponse>(`${this.apiUrl}/expense/${uuid}`, despesaData);
  }

  /**
   * Exclui uma despesa
   */
  deleteDespesa(uuid: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/expense/${uuid}`);
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
   * Busca despesas por período de datas
   */
  buscarDespesasPorPeriodo(dataInicio: string, dataFim: string): Observable<Despesa[]> {
    const params = new HttpParams()
      .set('from', dataInicio)
      .set('to', dataFim);

    return this.httpClient.get<Despesa[]>(`${this.apiUrl}/expense/search`, { params }).pipe(
      map(despesas => despesas.filter(d => d.active === 'ACTIVE'))
    );
  }

  /**
   * Formata data do backend (que pode vir null) para YYYY-MM-DD
   */
  formatDate(date: string | null): string {
    if (!date) return this.getCurrentDate();

    try {
      // Se a data já está no formato YYYY-MM-DD, retorna diretamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      // Se vier com hora (ex: 2025-10-16T00:00:00), extrai apenas a data
      if (date.includes('T')) {
        return date.split('T')[0];
      }

      // Fallback: força timezone local ao criar Date
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
