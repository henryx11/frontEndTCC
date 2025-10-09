import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { TransferService } from '../../services/transfer.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss']
})
export class TransferModalComponent implements OnInit {
  @Input() contaOrigem!: Account;
  @Input() todasContas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() transferenciaRealizada = new EventEmitter<void>();

  transferForm!: FormGroup;
  loading: boolean = false;
  loadingCategorias: boolean = false;
  contasDisponiveis: Account[] = [];
  categorias: Category[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private transferService: TransferService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.filtrarContasDisponiveis();
    this.carregarCategorias();
    this.inicializarFormulario();
  }

  /**
   * Carrega as categorias do backend
   */
  carregarCategorias(): void {
    this.loadingCategorias = true;
    this.categoryService.getActiveExpenseCategories().subscribe({
      next: (categories) => {
        // Adiciona ícones às categorias
        this.categorias = this.categoryService.addIconsToCategories(categories);
        this.loadingCategorias = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.toastr.error('Erro ao carregar categorias');
        this.loadingCategorias = false;
      }
    });
  }

  /**
   * Filtra contas disponíveis para transferência
   * Remove a conta de origem e contas desativadas
   */
  filtrarContasDisponiveis(): void {
    this.contasDisponiveis = this.todasContas.filter(conta =>
      conta.uuid !== this.contaOrigem.uuid &&
      conta.active === 'ACTIVE'
    );
  }

  /**
   * Inicializa o formulário com validações
   */
  inicializarFormulario(): void {
    this.transferForm = this.formBuilder.group({
      contaDestino: ['', Validators.required],
      valor: ['', [
        Validators.required,
        Validators.min(0.01),
        this.validarSaldo.bind(this)
      ]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Re-valida o campo valor quando ele muda
    this.transferForm.get('valor')?.valueChanges.subscribe(() => {
      this.transferForm.get('valor')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Validador customizado para verificar saldo suficiente
   */
  validarSaldo(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (valor && this.contaOrigem && valor > this.contaOrigem.balance) {
      return { saldoInsuficiente: true };
    }
    return null;
  }

  /**
   * Realiza a transferência
   */
  realizarTransferencia(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    // Validação adicional: verificar se conta de destino não está desativada
    const contaDestino = this.todasContas.find(
      c => c.uuid === this.transferForm.value.contaDestino
    );

    if (!contaDestino || contaDestino.active !== 'ACTIVE') {
      this.toastr.error('A conta de destino está desativada');
      return;
    }

    this.loading = true;

    const transferData = {
      value: parseFloat(this.transferForm.value.valor),
      description: this.transferForm.value.descricao,
      registrationDate: this.transferService.getCurrentDate(),
      accounts: {
        uuid: this.contaOrigem.uuid
      },
      foraccounts: {
        uuid: this.transferForm.value.contaDestino
      },
      category: {
        uuid: this.transferForm.value.categoria
      }
    };

    this.transferService.createTransfer(transferData).subscribe({
      next: (response) => {
        this.toastr.success('Transferência realizada com sucesso!');
        this.transferenciaRealizada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao realizar transferência:', error);
        const mensagemErro = error?.error?.message || 'Erro ao realizar transferência. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Fecha o modal
   */
  fecharModal(): void {
    this.fechar.emit();
  }
}
