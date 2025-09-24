import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface representando uma conta
export interface Conta {
  id: number;
  nome: string;
  saldo: number;
  banco: string;
  tipo: 'corrente' | 'poupança' | 'salário'; // ajuste conforme necessário
}

@Injectable({ providedIn: 'root' })
export class ContasService {
  private readonly apiUrl = 'http://26.59.168.146:8090/accounts';

  constructor(private http: HttpClient) {}

  /**
   * Retorna todas as contas do usuário autenticado.
   */
  getContasDoUsuario(): Observable<Conta[]> {
    return this.http.get<Conta[]>(`${this.apiUrl}/user`);
  }

  /**
   * Retorna o saldo total de todas as contas do usuário.
   */
  getSaldoTotalDoUsuario(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-balance`);
  }
}
