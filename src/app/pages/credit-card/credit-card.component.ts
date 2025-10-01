import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CreditCardService, CartaoData, Fatura } from '../../services/credit-card.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-credit-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './credit-card.component.html',
  styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent implements OnInit {
  cartoes: CartaoData[] = [];
  cartaoSelecionado: number | null = null;
  faturaAtualIndex: number = 0; // Índice da fatura atual sendo exibida
  loading: boolean = false;

  constructor(
    private creditCardService: CreditCardService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarCartoes();
  }

  /**
   * Carrega todos os cartões do usuário
   */
  carregarCartoes(): void {
    this.loading = true;
    this.creditCardService.getCartoes().subscribe({
      next: (cartoes: CartaoData[]) => {
        this.cartoes = cartoes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cartões:', error);
        this.toastr.error('Erro ao carregar cartões');
        this.loading = false;
        // Fallback para dados mock em caso de erro
        //this.carregarDadosMock();
      }
    });
  }

  /**
   * Dados mock para desenvolvimento/fallback
   */
//  private carregarDadosMock(): void {
//    this.cartoes = [
//      {
//        id: 1,
//        nome: 'Cartão Nubank',
//        description: 'Cartão Nubank',
//        flags: 'mastercard',
//        limite: 4000,
//        faturas: [
//          {
//            id: 1,
//            mes: 'Janeiro',
//            ano: 2025,
//            valor: 'R$ 1.250,00',
//            vencimento: '15/01/2025',
//            status: 'Em aberto',
//            limiteDisponivel: 'R$ 2.750,00',
//            cartaoId: 1
//          },
//          {
//            id: 2,
//            mes: 'Fevereiro',
//            ano: 2025,
//            valor: 'R$ 890,50',
//            vencimento: '15/02/2025',
//            status: 'Em aberto',
//            limiteDisponivel: 'R$ 3.109,50',
//            cartaoId: 1
//          },
//          {
//            id: 3,
//            mes: 'Março',
//            ano: 2025,
//            valor: 'R$ 1.150,75',
//            vencimento: '15/03/2025',
//            status: 'Em aberto',
//            limiteDisponivel: 'R$ 2.849,25',
//            cartaoId: 1
//          }
//        ]
//      },
//      {
//        id: 2,
//        nome: 'Cartão Itaú',
//        description: 'Cartão Itaú',
//        flags: 'visa',
//        limite: 5000,
//        faturas: [
//          {
//            id: 4,
//            mes: 'Janeiro',
//            ano: 2025,
//            valor: 'R$ 2.100,00',
//            vencimento: '20/01/2025',
//            status: 'Pago',
//            limiteDisponivel: 'R$ 2.900,00',
//            cartaoId: 2
//          },
//          {
//            id: 5,
//            mes: 'Fevereiro',
//            ano: 2025,
//            valor: 'R$ 1.750,30',
//            vencimento: '20/02/2025',
//            status: 'Em aberto',
//            limiteDisponivel: 'R$ 3.249,70',
//            cartaoId: 2
//          },
//          {
//            id: 6,
//            mes: 'Março',
//            ano: 2025,
//            valor: 'R$ 950,00',
//            vencimento: '20/03/2025',
//            status: 'Em aberto',
//            limiteDisponivel: 'R$ 4.050,00',
//            cartaoId: 2
//          }
//        ]
//      }
//    ];
//  }AtualIndex: number = 0; // Índice da fatura atual sendo exibida

  /**
   * Seleciona um cartão e mostra sua primeira fatura
   */
  selecionarCartao(numeroCartao: number): void {
    if (this.cartaoSelecionado === numeroCartao) {
      // Se clicar no mesmo cartão, fecha a fatura
      this.cartaoSelecionado = null;
      this.faturaAtualIndex = 0;
    } else {
      // Seleciona o novo cartão e reseta para a primeira fatura
      this.cartaoSelecionado = numeroCartao;
      this.faturaAtualIndex = 0;
    }
  }

  /**
   * Retorna os dados do cartão selecionado
   */
  getCartaoSelecionado(): CartaoData | null {
    if (this.cartaoSelecionado) {
      return this.cartoes.find(cartao => cartao.id === this.cartaoSelecionado) || null;
    }
    return null;
  }

  /**
   * Retorna a fatura atual do cartão selecionado
   */
  getFaturaAtual(): Fatura | null {
    const cartao = this.getCartaoSelecionado();
    if (cartao && cartao.faturas.length > 0) {
      return cartao.faturas[this.faturaAtualIndex] || null;
    }
    return null;
  }

  /**
   * Navega para a fatura anterior
   */
  faturaAnterior(): void {
    const cartao = this.getCartaoSelecionado();
    if (cartao && this.faturaAtualIndex > 0) {
      this.faturaAtualIndex--;
    }
  }

  /**
   * Navega para a próxima fatura
   */
  proximaFatura(): void {
    const cartao = this.getCartaoSelecionado();
    if (cartao && this.faturaAtualIndex < cartao.faturas.length - 1) {
      this.faturaAtualIndex++;
    }
  }

  /**
   * Verifica se pode navegar para a fatura anterior
   */
  podeVoltar(): boolean {
    return this.faturaAtualIndex > 0;
  }

  /**
   * Verifica se pode navegar para a próxima fatura
   */
  podeAvancar(): boolean {
    const cartao = this.getCartaoSelecionado();
    return cartao ? this.faturaAtualIndex < cartao.faturas.length - 1 : false;
  }

  /**
   * Retorna o nome do cartão selecionado
   */
  getNomeCartao(): string {
    const cartao = this.getCartaoSelecionado();
    return cartao ? cartao.description : '';
  }

  /**
   * Retorna o valor da fatura atual
   */
  getFaturaValor(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.valor : '';
  }

  /**
   * Retorna a data de vencimento da fatura atual
   */
  getDataVencimento(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.vencimento : '';
  }

  /**
   * Retorna o limite disponível da fatura atual
   */
  getLimiteDisponivel(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.limiteDisponivel : '';
  }

  /**
   * Retorna o status da fatura atual
   */
  getStatusFatura(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.status : '';
  }

  /**
   * Retorna o mês/ano da fatura atual para exibição
   */
  getMesAnoFatura(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? `${fatura.mes} ${fatura.ano}` : '';
  }

  /**
   * Fecha o balão da fatura
   */
  fecharFatura(): void {
    this.cartaoSelecionado = null;
    this.faturaAtualIndex = 0;
  }

  /**
   * Recarrega os dados dos cartões
   */
  recarregarDados(): void {
    this.carregarCartoes();
  }

  // Método para futuras funcionalidades
  // editarCartao(cartaoId: number): void {
  //   this.router.navigate(['/edit-card', cartaoId]);
  // }

  // deletarCartao(cartaoId: number): void {
  //   if (confirm('Tem certeza que deseja excluir este cartão?')) {
  //     this.creditCardService.deletarCartao(cartaoId).subscribe({
  //       next: () => {
  //         this.toastr.success('Cartão excluído com sucesso!');
  //         this.carregarCartoes();
  //       },
  //       error: (error) => {
  //         this.toastr.error('Erro ao excluir cartão');
  //       }
  //     });
  //   }
  // }
}
