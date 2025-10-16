import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReceitasTotalResponse } from '../types/dashboard-stats.type';

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
      map(response => response.total)
    );
  }
}
