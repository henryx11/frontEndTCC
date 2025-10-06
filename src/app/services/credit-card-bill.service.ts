import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces do Backend
export interface FaturaBackend {
  uuid: string;
  value: number;
  valuepay: number;
  status: string;
  closeDate: string;
  openDate: string;
  payDate: string;
  creditCard?: any;
  active?: string;
}

export interface ItemFaturaBackend {
  uuid: string;
  value: number;
  description: string;
  registrationDate: string;
  creditCard?: any;
  bill?: any;
  category?: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  active: string | null;
  numberinstallments: number;
  installments: string | null;
}

// Interfaces do Frontend
export interface Fatura {
  uuid: string;
  mes: string;
  ano: number;
  valor: number;
  valorPago: number;
  vencimento: string;
  dataFechamento: string;
  dataAbertura: string;
  status: 'Fechamento Pendente' | 'Pago' | 'Futura' | 'Em aberto';
  limiteDisponivel: number;
  cartaoId: string;
  mesNumero: number;
}

export interface ItemFatura {
  uuid: string;
  descricao: string;
  valor: number;
  dataRegistro: string;
  categoria: string;
  parcelado: boolean;
  numeroParcelas: number;
  active: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CreditCardBillService {
  private apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) { }

  /**
   * Busca todas as faturas de um cartão específico
   */
  getFaturasPorCartao(cartaoUuid: string): Observable<Fatura[]> {
    return this.httpClient.get<FaturaBackend[]>(`${this.apiUrl}/bill/${cartaoUuid}`).pipe(
      map(faturas => {
        const faturasMapeadas = faturas.map(fatura => this.mapearFaturaBackendParaFrontend(fatura));

        // Ordena por ano e mês
        return faturasMapeadas.sort((a, b) => {
          if (a.ano !== b.ano) {
            return a.ano - b.ano;
          }
          return a.mesNumero - b.mesNumero;
        });
      })
    );
  }

  /**
   * Busca uma fatura específica por ID
   */
  getFaturaPorId(faturaUuid: string): Observable<Fatura> {
    return this.httpClient.get<FaturaBackend>(`${this.apiUrl}/creditCardBill/${faturaUuid}`).pipe(
      map(fatura => this.mapearFaturaBackendParaFrontend(fatura))
    );
  }

  /**
   * Busca os itens/lançamentos de uma fatura específica
   * Endpoint: GET /creditCardBill/bill/{billId}?active=ACTIVE
   */
  getItensFatura(faturaUuid: string): Observable<ItemFatura[]> {
    const params = new HttpParams().set('active', 'ACTIVE');

    return this.httpClient.get<ItemFaturaBackend[]>(
      `${this.apiUrl}/creditCardBill/bill/${faturaUuid}`,
      { params }
    ).pipe(
      map(itens => itens.map(item => this.mapearItemFatura(item)))
    );
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
   * Mapeia fatura do backend para frontend
   */
  private mapearFaturaBackendParaFrontend(faturaBackend: FaturaBackend): Fatura {
    const dataFechamento = new Date(faturaBackend.closeDate + 'T00:00:00');

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesNumero = dataFechamento.getMonth();
    const mes = meses[mesNumero];
    const ano = dataFechamento.getFullYear();

    const statusMap: { [key: string]: 'Fechamento Pendente' | 'Pago' | 'Futura' | 'Em aberto' } = {
      'CLOSE_PENDING': 'Fechamento Pendente',
      'PAID': 'Pago',
      'FUTURE_BILLS': 'Futura',
      'OPEN': 'Em aberto'
    };

    const status = statusMap[faturaBackend.status] || 'Em aberto';
    const limiteCartao = faturaBackend.creditCard?.limite || 0;
    const limiteDisponivel = limiteCartao - faturaBackend.value;

    return {
      uuid: faturaBackend.uuid,
      mes: mes,
      ano: ano,
      mesNumero: mesNumero,
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
   * Mapeia item da fatura do backend para frontend
   */
  private mapearItemFatura(itemBackend: ItemFaturaBackend): ItemFatura {
    return {
      uuid: itemBackend.uuid,
      descricao: itemBackend.description,
      valor: itemBackend.value,
      dataRegistro: this.formatarData(itemBackend.registrationDate),
      categoria: itemBackend.category?.description || 'Sem categoria',
      parcelado: itemBackend.numberinstallments > 1,
      numeroParcelas: itemBackend.numberinstallments,
      active: itemBackend.active
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
