import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateDespesaRequest {
  value: number;
  description: string;
  dateRegistration: string; // formato YYYY-MM-DD
  accounts: {
    uuid: string;
  };
  category: {
    uuid: string;
  };
}

export interface UpdateDespesaRequest {
  value: number;
  description: string;
  dateRegistration: string;
  accounts: {
    uuid: string;
  };
  category: {
    uuid: string;
  };
}

export interface DespesaResponse {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string;
  message?: string;
}

export interface Despesa {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string | null;
  category: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  accounts: {
    uuid: string;
    name: string;
    balance: number;
  };
  active: string;
}

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Cria uma nova despesa
   */
  createDespesa(despesa: CreateDespesaRequest): Observable<DespesaResponse> {
    return this.httpClient.post<DespesaResponse>(`${this.apiUrl}/expense/create`, despesa); // ← CORRIGIDO
  }

  /**
   * Atualiza uma despesa existente
   */
  updateDespesa(uuid: string, despesa: UpdateDespesaRequest): Observable<DespesaResponse> {
    return this.httpClient.put<DespesaResponse>(`${this.apiUrl}/expense/${uuid}`, despesa); // ← CORRIGIDO
  }

  /**
   * Deleta uma despesa
   */
  deleteDespesa(uuid: string): Observable<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${this.apiUrl}/expense/${uuid}`); // ← CORRIGIDO
  }

  /**
   * Busca todas as despesas ou por período
   */
  getAllDespesas(): Observable<Despesa[]> {
    return this.httpClient.get<Despesa[]>(`${this.apiUrl}/expense`); // ← CORRIGIDO
  }

  /**
   * Busca despesas por período usando from e to
   */
  buscarDespesasPorPeriodo(dataInicio: string, dataFim: string): Observable<Despesa[]> {
    const params = new HttpParams()
      .set('from', dataInicio)  // ← CORRIGIDO: era 'dataInicio', agora é 'from'
      .set('to', dataFim);       // ← CORRIGIDO: era 'dataFim', agora é 'to'

    return this.httpClient.get<Despesa[]>(`${this.apiUrl}/expense/search`, { params }); // ← CORRIGIDO
  }

  /**
   * Retorna a data atual no formato YYYY-MM-DD
   */
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Formata data para exibição (de YYYY-MM-DD para DD/MM/YYYY)
   */
  formatDate(date: string | null): string {
    if (!date) return '';

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
