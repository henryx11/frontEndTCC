import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartaoData {
  uuid: string;
  description: string;
  flags: CartaoFlags;
  limite: number;
  closeDate: string;
  expiryDate: string;
  accounts?: any;
  active?: string;
  faturas?: any[];
  desativado?: boolean;
}

export interface CartaoFlags {
  uuid: string;
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

  /**
   * Busca um cartão específico por ID
   */
  getCartaoPorId(cartaoUuid: string): Observable<CartaoData> {
    return this.httpClient.get<CartaoData>(`${this.apiUrl}/creditCard/${cartaoUuid}`);
  }

  /**
   * Busca as bandeiras disponíveis
   */
  getCartaoFlags(): Observable<CartaoFlags[]> {
    return this.httpClient.get<CartaoFlags[]>(`${this.apiUrl}/flags`);
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
  atualizarCartao(uuid: string, dados: Partial<CreateCartaoRequest>): Observable<CartaoData> {
    return this.httpClient.put<CartaoData>(`${this.apiUrl}/creditCard/${uuid}`, dados);
  }

  /**
   * Deleta um cartão (hard delete)
   */
  deletarCartao(uuid: string): Observable<{message: string}> {
    return this.httpClient.delete<{message: string}>(`${this.apiUrl}/creditCard/${uuid}`);
  }

  /**
   * Desativa um cartão de crédito
   */
  desativarCartao(cartaoUuid: string): Observable<{message: string}> {
    return this.httpClient.delete<{message: string}>(`${this.apiUrl}/creditCard/deactivate/${cartaoUuid}`);
  }

  /**
   * Ativa um cartão de crédito
   */
  ativarCartao(cartaoUuid: string): Observable<{message: string}> {
    return this.httpClient.put<{message: string}>(`${this.apiUrl}/creditCard/activate/${cartaoUuid}`, {});
  }
}
