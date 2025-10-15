import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CreditCardService, CartaoFlags } from '../../services/credit-card.service';
import { AccountService } from '../../services/account.service';
import { Account } from '../../types/account.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {
  cartaoForm!: FormGroup;
  loading: boolean = false;
  loadingContas: boolean = false;
  loadingBandeiras: boolean = false;

  // Modo edição
  isEditMode: boolean = false;
  cartaoUuid: string | null = null;

  contas: Account[] = [];
  bandeiras: CartaoFlags[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private creditCardService: CreditCardService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModoEdicao();
    this.carregarContas();
    this.carregarBandeiras();
  }

  /**
   * Verifica se está em modo edição e carrega os dados do cartão
   */
  verificarModoEdicao(): void {
    this.route.paramMap.subscribe(params => {
      this.cartaoUuid = params.get('uuid');
      if (this.cartaoUuid) {
        this.isEditMode = true;
        this.carregarDadosCartao(this.cartaoUuid);
      }
    });
  }

  /**
   * Carrega os dados do cartão para edição
   */
  carregarDadosCartao(uuid: string): void {
    this.loading = true;
    this.creditCardService.getCartaoPorId(uuid).subscribe({
      next: (cartao) => {
        this.cartaoForm.patchValue({
          descricao: cartao.description,
          conta: cartao.accounts?.uuid,
          bandeira: cartao.flags?.uuid,
          limite: cartao.limite,
          dataFechamento: cartao.closeDate,
          dataVencimento: cartao.expiryDate
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cartão:', error);
        this.toastr.error('Erro ao carregar dados do cartão');
        this.router.navigate(['/credit-card']);
        this.loading = false;
      }
    });
  }

  /**
   * Inicializa o formulário com validações
   */
  inicializarFormulario(): void {
    this.cartaoForm = this.formBuilder.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      conta: ['', Validators.required],
      bandeira: ['', Validators.required],
      limite: ['', [Validators.required, Validators.min(0.01)]],
      dataFechamento: ['', Validators.required],
      dataVencimento: ['', Validators.required]
    }, {
      validators: this.validarDatas
    });
  }

  /**
   * Validador customizado para verificar se dataFechamento < dataVencimento
   */
  validarDatas(control: AbstractControl): ValidationErrors | null {
    const dataFechamento = control.get('dataFechamento')?.value;
    const dataVencimento = control.get('dataVencimento')?.value;

    if (dataFechamento && dataVencimento) {
      const fechamento = new Date(dataFechamento);
      const vencimento = new Date(dataVencimento);

      if (fechamento >= vencimento) {
        return { datasInvalidas: true };
      }
    }

    return null;
  }

  /**
   * Carrega as contas do usuário
   */
  carregarContas(): void {
    this.loadingContas = true;
    this.accountService.getUserAccounts().subscribe({
      next: (contas) => {
        // Filtra apenas contas ativas
        this.contas = contas.filter(conta => conta.active === 'ACTIVE');
        this.loadingContas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
        this.toastr.error('Erro ao carregar contas');
        this.loadingContas = false;
      }
    });
  }

  /**
   * Carrega as bandeiras de cartão disponíveis
   */
  carregarBandeiras(): void {
    this.loadingBandeiras = true;
    this.creditCardService.getCartaoFlags().subscribe({
      next: (bandeiras) => {
        this.bandeiras = bandeiras;
        this.loadingBandeiras = false;
      },
      error: (error) => {
        console.error('Erro ao carregar bandeiras:', error);
        this.toastr.error('Erro ao carregar bandeiras');
        this.loadingBandeiras = false;
      }
    });
  }

  /**
   * Cria ou atualiza o cartão de crédito
   */
  salvarCartao(): void {
    if (this.cartaoForm.invalid) {
      this.cartaoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const dadosCartao = {
      description: this.cartaoForm.value.descricao,
      limite: parseFloat(this.cartaoForm.value.limite),
      closeDate: this.cartaoForm.value.dataFechamento,
      expiryDate: this.cartaoForm.value.dataVencimento,
      flags: {
        uuid: this.cartaoForm.value.bandeira
      },
      accounts: {
        uuid: this.cartaoForm.value.conta
      }
    };

    if (this.isEditMode && this.cartaoUuid) {
      // Modo edição
      this.creditCardService.atualizarCartao(this.cartaoUuid, dadosCartao).subscribe({
        next: (response) => {
          this.toastr.success('Cartão atualizado com sucesso!');
          this.router.navigate(['/credit-card']);
        },
        error: (error) => {
          console.error('Erro ao atualizar cartão:', error);
          const mensagemErro = error?.error?.message || 'Erro ao atualizar cartão. Tente novamente.';
          this.toastr.error(mensagemErro);
          this.loading = false;
        }
      });
    } else {
      // Modo criação
      this.creditCardService.criarCartao(dadosCartao).subscribe({
        next: (response) => {
          this.toastr.success('Cartão criado com sucesso!');
          this.router.navigate(['/credit-card']);
        },
        error: (error) => {
          console.error('Erro ao criar cartão:', error);
          const mensagemErro = error?.error?.message || 'Erro ao criar cartão. Tente novamente.';
          this.toastr.error(mensagemErro);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Cancela e volta para a página de cartões
   */
  cancelar(): void {
    const confirmacao = confirm('Tem certeza que deseja cancelar? Os dados não serão salvos.');

    if (confirmacao) {
      this.router.navigate(['/credit-card']);
    }
  }
}
