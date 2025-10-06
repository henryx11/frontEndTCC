import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreditCardService, CartaoData } from '../../services/credit-card.service';
import { CreditCardBillService, Fatura, ItemFatura } from '../../services/credit-card-bill.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-credit-card',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './credit-card.component.html',
  styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent implements OnInit {
  cartoes: CartaoData[] = [];
  cartaoSelecionado: string | null = null;
  faturaAtualIndex: number = 0;
  loading: boolean = false;

  // Modal de detalhes
  modalDetalhesAberto: boolean = false;
  itensFatura: ItemFatura[] = [];
  loadingDetalhes: boolean = false;

  constructor(
    private creditCardService: CreditCardService,
    private billService: CreditCardBillService,
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
          this.billService.getFaturasPorCartao(cartao.uuid)
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
    return fatura ? this.billService.formatarMoeda(fatura.valor) : '';
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
    return fatura ? this.billService.formatarMoeda(fatura.limiteDisponivel) : '';
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
    return fatura ? this.billService.formatarMoeda(fatura.valorPago) : '';
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
      this.billService.pagarFatura(fatura.uuid).subscribe({
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
      this.modalDetalhesAberto = true;
      this.loadingDetalhes = true;
      this.itensFatura = [];

      // Usando o endpoint correto: /creditCardBill/bill/{billId}?active=ACTIVE
      this.billService.getItensFatura(fatura.uuid).subscribe({
        next: (itens) => {
          this.itensFatura = itens;
          this.loadingDetalhes = false;
        },
        error: (error) => {
          console.error('Erro ao carregar itens da fatura:', error);
          this.toastr.error('Erro ao carregar detalhes da fatura');
          this.loadingDetalhes = false;
        }
      });
    }
  }

  /**
   * Fecha o modal de detalhes
   */
  fecharModal(): void {
    this.modalDetalhesAberto = false;
    this.itensFatura = [];
    this.loadingDetalhes = false;
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatarMoeda(valor: number): string {
    return this.billService.formatarMoeda(valor);
  }

  /**
   * Calcula o total dos itens da fatura
   */
  calcularTotal(): string {
    const total = this.itensFatura.reduce((acc, item) => acc + item.valor, 0);
    return this.billService.formatarMoeda(total);
  }

  /**
   * Recarrega os dados dos cartões
   */
  recarregarDados(): void {
    this.carregarCartoes();
  }

  /**
   * Alterna o estado de ativação do cartão
   */
  toggleDesativarCartao(event: Event, cartao: CartaoData): void {
    event.stopPropagation(); // Impede que o click abra o cartão

    const checkbox = event.target as HTMLInputElement;
    const desativar = checkbox.checked;

    // Log para debug
    console.log('Tentando', desativar ? 'desativar' : 'ativar', 'cartão:', cartao.uuid);

    if (desativar) {
      // Desativar cartão
      this.creditCardService.desativarCartao(cartao.uuid).subscribe({
        next: (response) => {
          console.log('Resposta do backend:', response);
          this.toastr.success(response.message || 'Cartão desativado com sucesso');
          cartao.desativado = true;
        },
        error: (error) => {
          console.error('Erro ao desativar cartão:', error);
          console.error('Detalhes do erro:', {
            status: error.status,
            statusText: error.statusText,
            message: error?.error?.message,
            error: error.error
          });

          const mensagemErro = error?.error?.message ||
            error?.message ||
            'Erro ao desativar cartão. Verifique o console para mais detalhes.';

          this.toastr.error(mensagemErro);
          checkbox.checked = false; // Reverte o checkbox
          cartao.desativado = false;
        }
      });
    } else {
      // Ativar cartão
      this.creditCardService.ativarCartao(cartao.uuid).subscribe({
        next: (response) => {
          console.log('Resposta do backend:', response);
          this.toastr.success(response.message || 'Cartão ativado com sucesso');
          cartao.desativado = false;
        },
        error: (error) => {
          console.error('Erro ao ativar cartão:', error);
          console.error('Detalhes do erro:', {
            status: error.status,
            statusText: error.statusText,
            message: error?.error?.message,
            error: error.error
          });

          const mensagemErro = error?.error?.message ||
            error?.message ||
            'Erro ao ativar cartão. Verifique o console para mais detalhes.';

          this.toastr.error(mensagemErro);
          checkbox.checked = true; // Reverte o checkbox
          cartao.desativado = true;
        }
      });
    }
  }
}
