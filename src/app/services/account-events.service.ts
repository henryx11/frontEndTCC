import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountEventsService {
  // Subject que emite eventos quando uma conta é modificada
  private accountChanged$ = new Subject<void>();

  constructor() {}

  /**
   * Observable que outros componentes podem escutar
   */
  get onAccountChanged() {
    return this.accountChanged$.asObservable();
  }

  /**
   * Emite um evento quando uma conta é modificada
   */
  notifyAccountChanged(): void {
    console.log('🔔 Evento: Conta modificada');
    this.accountChanged$.next();
  }
}
