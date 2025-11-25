import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Tipos de eventos de transação
 */
export type TransactionEventType =
  | 'despesa-adicionada'
  | 'despesa-editada'
  | 'despesa-deletada'
  | 'receita-adicionada'
  | 'receita-editada'
  | 'receita-deletada';

/**
 * Interface do evento
 */
export interface TransactionEvent {
  type: TransactionEventType;
  timestamp: Date;
}

/**
 * Service para gerenciar eventos de transações
 * Permite notificar outros componentes quando há mudanças em despesas/receitas
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionEventsService {
  // Subject que emite eventos para todos os observadores
  private transactionChanged$ = new Subject<TransactionEvent>();

  constructor() {}

  /**
   * Observable que outros componentes podem escutar
   */
  get onTransactionChanged() {
    return this.transactionChanged$.asObservable();
  }

  /**
   * Emite um evento quando uma despesa é adicionada
   */
  despesaAdicionada(): void {
    console.log('🔔 Evento: Despesa adicionada');
    this.emitEvent('despesa-adicionada');
  }

  /**
   * Emite um evento quando uma despesa é editada
   */
  despesaEditada(): void {
    console.log('🔔 Evento: Despesa editada');
    this.emitEvent('despesa-editada');
  }

  /**
   * Emite um evento quando uma despesa é deletada
   */
  despesaDeletada(): void {
    console.log('🔔 Evento: Despesa deletada');
    this.emitEvent('despesa-deletada');
  }

  /**
   * Emite um evento quando uma receita é adicionada
   */
  receitaAdicionada(): void {
    console.log('🔔 Evento: Receita adicionada');
    this.emitEvent('receita-adicionada');
  }

  /**
   * Emite um evento quando uma receita é editada
   */
  receitaEditada(): void {
    console.log('🔔 Evento: Receita editada');
    this.emitEvent('receita-editada');
  }

  /**
   * Emite um evento quando uma receita é deletada
   */
  receitaDeletada(): void {
    console.log('🔔 Evento: Receita deletada');
    this.emitEvent('receita-deletada');
  }

  /**
   * Método privado para emitir o evento
   */
  private emitEvent(type: TransactionEventType): void {
    const event: TransactionEvent = {
      type,
      timestamp: new Date()
    };
    this.transactionChanged$.next(event);
  }
}
