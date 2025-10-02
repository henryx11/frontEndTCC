import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CreditCardService, CartaoData, Fatura } from '../../services/credit-card.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-credit-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './credit-card.component.html',
  styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent implements OnInit {
  cartoes: CartaoData[] = [];
  cartaoSelecionado: string | null = null;
  faturaAtualIndex: number = 0;
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
   * Carrega todos os cartões do usuário e suas faturas
   */
  carregarCartoes(): void {
    this.loading = true;
    this.creditCardService.getCartoes().subscribe({
      next: (cartoes: CartaoData[]) => {
        if (cartoes.length === 0) {
          this.cartoes = [];
          this.loading = false;
          return;
        }

        // Para cada cartão, busca suas faturas
        const faturaRequests = cartoes.map(cartao =>
          this.creditCardService.getFaturasPorCartao(cartao.uuid)
        );

        forkJoin(faturaRequests).subscribe({
          next: (todasFaturas: Fatura[][]) => {
            // Atribui as faturas a cada cartão
            this.cartoes = cartoes.map((cartao, index) => ({
              ...cartao,
              faturas: todasFaturas[index] || []
            }));
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao carregar faturas:', error);
            this.toastr.error('Erro ao carregar faturas dos cartões');
            this.cartoes = cartoes.map(cartao => ({ ...cartao, faturas: [] }));
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar cartões:', error);
        this.toastr.error('Erro ao carregar cartões');
        this.loading = false;
      }
    });
  }

  /**
   * Seleciona um cartão e mostra sua primeira fatura
   */
  selecionarCartao(cartaoUuid: string): void {
    if (this.cartaoSelecionado === cartaoUuid) {
      this.cartaoSelecionado = null;
      this.faturaAtualIndex = 0;
    } else {
      this.cartaoSelecionado = cartaoUuid;
      this.faturaAtualIndex = 0;
    }
  }

  /**
   * Retorna os dados do cartão selecionado
   */
  getCartaoSelecionado(): CartaoData | null {
    if (this.cartaoSelecionado) {
      return this.cartoes.find(cartao => cartao.uuid === this.cartaoSelecionado) || null;
    }
    return null;
  }

  /**
   * Retorna a fatura atual do cartão selecionado
   */
  getFaturaAtual(): Fatura | null {
    const cartao = this.getCartaoSelecionado();
    if (cartao && cartao.faturas && cartao.faturas.length > 0) {
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
    if (cartao && cartao.faturas && this.faturaAtualIndex < cartao.faturas.length - 1) {
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
    return cartao && cartao.faturas ? this.faturaAtualIndex < cartao.faturas.length - 1 : false;
  }

  /**
   * Retorna o nome/descrição do cartão selecionado
   */
  getNomeCartao(): string {
    const cartao = this.getCartaoSelecionado();
    return cartao ? cartao.description : '';
  }

  /**
   * Retorna o valor da fatura atual formatado
   */
  getFaturaValor(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? this.creditCardService.formatarMoeda(fatura.valor) : '';
  }

  /**
   * Retorna a data de vencimento da fatura atual
   */
  getDataVencimento(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.vencimento : '';
  }

  /**
   * Retorna o limite disponível da fatura atual formatado
   */
  getLimiteDisponivel(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? this.creditCardService.formatarMoeda(fatura.limiteDisponivel) : '';
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
   * Retorna a data de fechamento da fatura atual
   */
  getDataFechamento(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? fatura.dataFechamento : '';
  }

  /**
   * Retorna o valor já pago da fatura
   */
  getValorPago(): string {
    const fatura = this.getFaturaAtual();
    return fatura ? this.creditCardService.formatarMoeda(fatura.valorPago) : '';
  }

  /**
   * Fecha o balão da fatura
   */
  fecharFatura(): void {
    this.cartaoSelecionado = null;
    this.faturaAtualIndex = 0;
  }

  /**
   * Funcionalidade para pagar fatura
   */
  pagarFatura(): void {
    const fatura = this.getFaturaAtual();
    if (fatura && fatura.status !== 'Pago') {
      this.loading = true;
      this.creditCardService.pagarFatura(fatura.uuid).subscribe({
        next: (faturaAtualizada) => {
          this.toastr.success('Fatura paga com sucesso!');
          if (fatura) {
            fatura.status = 'Pago';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao pagar fatura:', error);
          this.toastr.error('Erro ao processar pagamento');
          this.loading = false;
        }
      });
    }
  }

  /**
   * Funcionalidade para ver detalhes da fatura
   */
  verDetalhes(): void {
    const fatura = this.getFaturaAtual();
    if (fatura) {
      this.toastr.info('Tela de detalhes em desenvolvimento');
      // this.router.navigate(['/detalhes-fatura', fatura.uuid]);
    }
  }

  /**
   * Recarrega os dados dos cartões
   */
  recarregarDados(): void {
    this.carregarCartoes();
  }
}
