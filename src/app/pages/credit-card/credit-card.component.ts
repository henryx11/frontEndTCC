import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-credit-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './credit-card.component.html',
  styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent {
  cartoes: any[] = [];
  cartaoSelecionado: number | null = null;

  // Dados mock dos cartões (substituir pela integração real)
  dadosCartoes = {
    1: {
      nome: 'Cartão 1',
      fatura: 'R$ 1.250,00',
      vencimento: '15/01/2025',
      limite: 'R$ 2.750,00',
      status: 'Em aberto'
    },
    2: {
      nome: 'Cartão 2',
      fatura: 'R$ 890,50',
      vencimento: '20/01/2025',
      limite: 'R$ 4.109,50',
      status: 'Pago'
    }
  };

  constructor() {}

  /**
   * Seleciona um cartão e mostra sua fatura
   */
  selecionarCartao(numeroCartao: number): void {
    if (this.cartaoSelecionado === numeroCartao) {
      // Se clicar no mesmo cartão, fecha a fatura
      this.cartaoSelecionado = null;
    } else {
      // Seleciona o novo cartão
      this.cartaoSelecionado = numeroCartao;
    }
  }

  /**
   * Retorna o nome do cartão selecionado
   */
  getNomeCartao(): string {
    if (this.cartaoSelecionado && this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes]) {
      return this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes].nome;
    }
    return '';
  }

  /**
   * Retorna o valor da fatura atual
   */
  getFaturaAtual(): string {
    if (this.cartaoSelecionado && this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes]) {
      return this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes].fatura;
    }
    return '';
  }

  /**
   * Retorna a data de vencimento
   */
  getDataVencimento(): string {
    if (this.cartaoSelecionado && this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes]) {
      return this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes].vencimento;
    }
    return '';
  }

  /**
   * Retorna o limite disponível
   */
  getLimiteDisponivel(): string {
    if (this.cartaoSelecionado && this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes]) {
      return this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes].limite;
    }
    return '';
  }

  /**
   * Retorna o status da fatura
   */
  getStatusFatura(): string {
    if (this.cartaoSelecionado && this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes]) {
      return this.dadosCartoes[this.cartaoSelecionado as keyof typeof this.dadosCartoes].status;
    }
    return '';
  }

  /**
   * Fecha o balão da fatura
   */
  fecharFatura(): void {
    this.cartaoSelecionado = null;
  }

  /**
   * Funcionalidade para pagar fatura
   */
  pagarFatura(): void {
    if (this.cartaoSelecionado) {
      alert(`Redirecionando para pagamento da fatura do ${this.getNomeCartao()}`);
      // Aqui você implementaria a navegação para a tela de pagamento
      // this.router.navigate(['/pagar-fatura', this.cartaoSelecionado]);
    }
  }

  /**
   * Funcionalidade para ver detalhes da fatura
   */
  verDetalhes(): void {
    if (this.cartaoSelecionado) {
      alert(`Mostrando detalhes da fatura do ${this.getNomeCartao()}`);
      // Aqui você implementaria a navegação para os detalhes da fatura
      // this.router.navigate(['/detalhes-fatura', this.cartaoSelecionado]);
    }
  }

  // Métodos comentados para futura integração com o backend
  //constructor(private userService: UserService) {}
  //
  //ngOnInit() {
  //  this.cartaoService.getCartoes().subscribe((data: any[]) => {
  //    this.cartoes = data;
  //  });
  //}
}
