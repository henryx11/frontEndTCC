import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interface exata do backend
export interface FaturaBackend {
  uuid: string;
  value: number;
  valuepay: number;
  status: string;
  closeDate: string; // Formato: "2025-11-09"
  openDate: string;
  payDate: string;
  creditCard?: any;
  active?: string;
}

// Interface para uso no frontend
export interface Fatura {
  uuid: string;
  mes: string;
  ano: number;
  valor: number;
  valorPago: number;
  vencimento: string; // Data formatada DD/MM/YYYY
  dataFechamento: string; // Data formatada DD/MM/YYYY
  dataAbertura: string; // Data formatada DD/MM/YYYY
  status: 'Fechamento Pendente' | 'Pago' | 'Futura' | 'Em aberto';
  limiteDisponivel: number;
  cartaoId: string;
  mesNumero: number; // Para ordenação
}

export interface CartaoData {
  uuid: string;
  description: string;
  flags: CartaoFlags;
  limite: number;
  closeDate: string;
  expiryDate: string;
  accounts?: any;
  active?: string;
  faturas: Fatura[];
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
   * Busca as bandeiras disponíveis
   */
  getCartaoFlags(): Observable<CartaoFlags[]> {
    return this.httpClient.get<CartaoFlags[]>(`${this.apiUrl}/flags`);
  }

  /**
   * Busca todas as faturas de um cartão específico
   */
  getFaturasPorCartao(cartaoUuid: string): Observable<Fatura[]> {
    return this.httpClient.get<FaturaBackend[]>(`${this.apiUrl}/bill/${cartaoUuid}`).pipe(
      map(faturas => {
        // Mapeia as faturas
        const faturasMapeadas = faturas.map(fatura => this.mapearFaturaBackendParaFrontend(fatura));

        // Ordena as faturas por ano e mês (Janeiro a Dezembro)
        return faturasMapeadas.sort((a, b) => {
          if (a.ano !== b.ano) {
            return a.ano - b.ano; // Ordena por ano primeiro
          }
          return a.mesNumero - b.mesNumero; // Depois por mês
        });
      })
    );
  }

  /**
   * Busca uma fatura específica
   */
  getFaturaPorId(faturaUuid: string): Observable<Fatura> {
    return this.httpClient.get<FaturaBackend>(`${this.apiUrl}/creditCardBill/${faturaUuid}`).pipe(
      map(fatura => this.mapearFaturaBackendParaFrontend(fatura))
    );
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
   * Paga uma fatura específica
   */
  pagarFatura(faturaUuid: string, valorPagamento?: number): Observable<Fatura> {
    const body = valorPagamento ? { valor: valorPagamento } : {};
    return this.httpClient.post<FaturaBackend>(`${this.apiUrl}/faturas/${faturaUuid}/pagar`, body).pipe(
      map(fatura => this.mapearFaturaBackendParaFrontend(fatura))
    );
  }

  /**
   * Mapeia a fatura do formato do backend para o formato do frontend
   */
  private mapearFaturaBackendParaFrontend(faturaBackend: FaturaBackend): Fatura {
    // Extrai mês e ano do closeDate (formato: "2025-11-09")
    const dataFechamento = new Date(faturaBackend.closeDate + 'T00:00:00');

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesNumero = dataFechamento.getMonth(); // 0-11
    const mes = meses[mesNumero];
    const ano = dataFechamento.getFullYear();

    // Mapeia o status do backend para o frontend
    // CLOSE_PENDING(0), PAID(1), FUTURE_BILLS(2), OPEN(3)
    const statusMap: { [key: string]: 'Fechamento Pendente' | 'Pago' | 'Futura' | 'Em aberto' } = {
      'CLOSE_PENDING': 'Fechamento Pendente',  // Passou data fechamento mas não foi paga totalmente
      'PAID': 'Pago',                           // value == valuepay
      'FUTURE_BILLS': 'Futura',                 // Faturas futuras
      'OPEN': 'Em aberto'                       // Não chegou data de fechamento
    };

    const status = statusMap[faturaBackend.status] || 'Em aberto';

    // Calcula limite disponível
    const limiteCartao = faturaBackend.creditCard?.limite || 0;
    const limiteDisponivel = limiteCartao - faturaBackend.value;

    return {
      uuid: faturaBackend.uuid,
      mes: mes,
      ano: ano,
      mesNumero: mesNumero, // Para ordenação
      valor: faturaBackend.value,
      valorPago: faturaBackend.valuepay,
      vencimento: this.formatarData(faturaBackend.payDate),
      dataFechamento: this.formatarData(faturaBackend.closeDate),
      dataAbertura: this.formatarData(faturaBackend.openDate),
      status: status,
      limiteDisponivel: limiteDisponivel,
      cartaoId: faturaBackend.creditCard?.uuid || ''
    };
  }

  /**
   * Formata data de YYYY-MM-DD para DD/MM/YYYY
   */
  private formatarData(dataString: string): string {
    const data = new Date(dataString + 'T00:00:00');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}
