import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fatura {
  id: number;
  mes: string;
  ano: number;
  valor: string;
  vencimento: string;
  status: 'Em aberto' | 'Pago' | 'Vencida';
  limiteDisponivel: string;
  cartaoId: number;
}

export interface CartaoData {
  id: number;
  nome: string;
  description: string;
  flags: CartaoFlags;
  limite: number;
  faturas: Fatura[];
}

export interface CartaoFlags {
  id: number;
  name: string;
  active: null;
}

export interface CreateCartaoRequest {
  description: string;
  expiryDate: string;
  closeDate: string;
  flags: string;
  limite: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {
  private apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) { }

  /**
   * Busca todos os cartões do usuário
   */
  getCartoes(): Observable<CartaoData[]> {
    return this.httpClient.get<CartaoData[]>(`${this.apiUrl}/creditCard`);
  }

  getCartaoFlags(): Observable<CartaoFlags[]> {
    return this.httpClient.get<CartaoFlags[]>(`${this.apiUrl}/flags`);
  }

  /**
   * Busca todas as faturas de um cartão específico
   */
  getFaturasPorCartao(cartaoId: number): Observable<Fatura[]> {
    return this.httpClient.get<Fatura[]>(`${this.apiUrl}/creditCardBill/${cartaoId}`);
  }

  /**
   * Busca uma fatura específica
   */
  getFaturaPorId(faturaId: number): Observable<Fatura> {
    return this.httpClient.get<Fatura>(`${this.apiUrl}/creditCardBill/${faturaId}`);
  }

  /**
   * Cria um novo cartão de crédito
   */
  criarCartao(dados: CreateCartaoRequest): Observable<CartaoData> {
    return this.httpClient.post<CartaoData>(`${this.apiUrl}/creditCard`, dados);
  }

  /**
   * Atualiza um cartão existente
   */
  atualizarCartao(id: number, dados: Partial<CreateCartaoRequest>): Observable<CartaoData> {
    return this.httpClient.put<CartaoData>(`${this.apiUrl}/creditCard/${id}`, dados);
  }

  /**
   * Paga uma fatura específica
   */
pagarFatura(faturaId: number, valorPagamento?: number): Observable<Fatura> {
  const body = valorPagamento ? { valor: valorPagamento } : {};
  return this.httpClient.post<Fatura>(`${this.apiUrl}/faturas/${faturaId}/pagar`, body);
}

  /**
   * Busca o extrato detalhado de uma fatura
   */
  //getExtrato(faturaId: number): Observable<any[]> {
  //  return this.httpClient.get<any[]>(`${this.apiUrl}/faturas/${faturaId}/extrato`);
  //}
}
