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

  // Modal de pagamento
  modalPagamentoAberto: boolean = false;
  valorPagamento: number = 0;
  loadingPagamento: boolean = false;

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
    if (fatura && fatura.status !== 'Pago' && fatura.status !== 'Futura') {
      this.modalPagamentoAberto = true;
      this.valorPagamento = fatura.valor - fatura.valorPago; // Valor restante
    }
  }

  /**
   * Fecha o modal de pagamento
   */
  fecharModalPagamento(): void {
    this.modalPagamentoAberto = false;
    this.valorPagamento = 0;
    this.loadingPagamento = false;
  }

  /**
   * Confirma o pagamento da fatura
   */
  confirmarPagamento(): void {
    const fatura = this.getFaturaAtual();
    if (!fatura || !this.valorPagamento || this.valorPagamento <= 0) {
      this.toastr.error('Informe um valor válido para o pagamento');
      return;
    }

    this.loadingPagamento = true;

    this.billService.pagarFatura(fatura.uuid, this.valorPagamento).subscribe({
      next: (faturaAtualizada) => {
        this.toastr.success('Pagamento realizado com sucesso!');
        this.fecharModalPagamento();
        this.carregarCartoes(); // Recarrega os dados
      },
      error: (error) => {
        console.error('Erro ao processar pagamento:', error);
        this.toastr.error('Erro ao processar pagamento. Tente novamente.');
        this.loadingPagamento = false;
      }
    });
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
   * Abre o formulário para adicionar item na fatura
   */
  abrirFormularioItem(): void {
    const fatura = this.getFaturaAtual();
    const cartao = this.getCartaoSelecionado();

    if (!fatura || !cartao) {
      this.toastr.error('Dados da fatura não encontrados');
      return;
    }

    // Navega para a página de adicionar item, passando dados via state e query params
    this.router.navigate(['/add-item-bill'], {
      state: {
        faturaUuid: fatura.uuid,
        cartaoUuid: cartao.uuid,
        mesAnoFatura: `${fatura.mes} ${fatura.ano}`,
        nomeCartao: cartao.description
      },
      queryParams: {
        faturaUuid: fatura.uuid,
        cartaoUuid: cartao.uuid,
        mesAnoFatura: `${fatura.mes} ${fatura.ano}`,
        nomeCartao: cartao.description
      }
    });
  }

  /**
   * Remove um item da fatura
   */
  removerItem(itemUuid: string): void {
    const confirmacao = confirm('Tem certeza que deseja remover este item da fatura?');

    if (!confirmacao) {
      return;
    }

    this.loadingDetalhes = true;

    this.creditCardService.removerItemFatura(itemUuid).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Item removido com sucesso!');
        // Recarrega os itens da fatura
        this.verDetalhes();
        // Recarrega os dados dos cartões para atualizar os valores
        this.carregarCartoes();
      },
      error: (error) => {
        console.error('Erro ao remover item:', error);

        // Captura a mensagem de erro do backend
        let mensagemErro = 'Erro ao remover item. Tente novamente.';

        if (error.status === 422) {
          // UNPROCESSABLE_ENTITY - janela fechada ou outra regra de negócio
          mensagemErro = error.error?.message || 'Não foi possível excluir a fatura, pois já está fechado';
        } else if (error.status === 403) {
          // FORBIDDEN - sem permissão
          mensagemErro = error.error?.message || 'Sem permissão para remover este lançamento';
        } else if (error.status === 404) {
          // NOT_FOUND
          mensagemErro = error.error?.message || 'Item não encontrado';
        } else if (error.error?.message) {
          // Qualquer outra mensagem do backend
          mensagemErro = error.error.message;
        }

        this.toastr.error(mensagemErro);
        this.loadingDetalhes = false;
      }
    });
  }

  /**
   * Recarrega os dados dos cartões
   */
  recarregarDados(): void {
    this.carregarCartoes();
  }

  /**
   * Verifica se o cartão está ativo
   */
  isCartaoAtivo(cartao: CartaoData): boolean {
    return cartao.active === 'ACTIVE';
  }

  /**
   * Alterna o status do cartão (ativar/desativar)
   */
  toggleCartaoStatus(event: Event, cartao: CartaoData): void {
    event.stopPropagation(); // Evita abrir os detalhes ao clicar no botão

    const isAtivo = this.isCartaoAtivo(cartao);
    const acao = isAtivo ? 'desativar' : 'ativar';
    const mensagem = `Tem certeza que deseja ${acao} o cartão "${cartao.description}"?`;

    if (confirm(mensagem)) {
      this.loading = true;

      const operacao = isAtivo
        ? this.creditCardService.desativarCartao(cartao.uuid)
        : this.creditCardService.ativarCartao(cartao.uuid);

      operacao.subscribe({
        next: (response) => {
          this.toastr.success(`Cartão ${isAtivo ? 'desativado' : 'ativado'} com sucesso!`);
          this.carregarCartoes(); // Recarrega a lista
          if (this.cartaoSelecionado === cartao.uuid) {
            this.fecharFatura(); // Fecha o painel de detalhes se estiver aberto
          }
        },
        error: (error) => {
          console.error(`Erro ao ${acao} cartão:`, error);
          this.toastr.error(`Erro ao ${acao} o cartão. Tente novamente.`);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Navega para a página de edição do cartão
   */
  editarCartao(event: Event, cartaoUuid: string): void {
    event.stopPropagation(); // Evita abrir os detalhes ao clicar no botão
    this.router.navigate(['/edit-card', cartaoUuid]);
  }
}
