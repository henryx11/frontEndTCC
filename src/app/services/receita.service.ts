import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   * Formata data do backend (que pode vir null) para YYYY-MM-DD
   */
  formatDate(date: string | null): string {
    if (!date) return this.getCurrentDate();

    try {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return this.getCurrentDate();
    }
  }
}
