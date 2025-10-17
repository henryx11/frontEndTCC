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
   * Busca todas as receitas do usuário
   */
  getAllReceitas(): Observable<Receita[]> {
    return this.httpClient.get<Receita[]>(`${this.apiUrl}/reciphe`).pipe(
      map(receitas => receitas.filter(r => r.active === 'ACTIVE'))
    );
  }

  /**
   * Atualiza uma receita existente
   */
  updateReceita(uuid: string, receitaData: UpdateReceitaRequest): Observable<ReceitaResponse> {
    return this.httpClient.put<ReceitaResponse>(`${this.apiUrl}/reciphe/${uuid}`, receitaData);
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
   * Busca receitas por período de datas
   */
  buscarReceitasPorPeriodo(dataInicio: string, dataFim: string): Observable<Receita[]> {
    const params = new HttpParams()
      .set('field', 'registration')
      .set('fromDate', dataInicio)
      .set('toDate', dataFim);

    return this.httpClient.get<Receita[]>(`${this.apiUrl}/reciphe/search`, { params }).pipe(
      map(receitas => receitas.filter(r => r.active === 'ACTIVE'))
    );
  }

  /**
   * Formata data do backend (YYYY-MM-DD) sem conversão de timezone
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
