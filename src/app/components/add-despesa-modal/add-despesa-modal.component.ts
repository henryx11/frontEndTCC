// src/app/components/add-despesa-modal/add-despesa-modal.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { DespesaService } from '../../services/despesa.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-despesa-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-despesa-modal.component.html',
  styleUrls: ['./add-despesa-modal.component.scss']
})
export class AddDespesaModalComponent implements OnInit {
  @Input() contas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() despesaAdicionada = new EventEmitter<void>();

  despesaForm!: FormGroup;
  loading: boolean = false;
  loadingCategorias: boolean = false;
  categorias: Category[] = [];
  contasAtivas: Account[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private despesaService: DespesaService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.filtrarContasAtivas();
    this.carregarCategorias();
    this.inicializarFormulario();
  }

  /**
   * Filtra apenas contas ativas
   */
  filtrarContasAtivas(): void {
    this.contasAtivas = this.contas.filter(conta => conta.active === 'ACTIVE');
  }

  /**
   * Carrega as categorias de despesas do backend
   */
  carregarCategorias(): void {
    this.loadingCategorias = true;
    this.categoryService.getActiveExpenseCategories().subscribe({
      next: (categories) => {
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
   * Inicializa o formulário com validações
   */
  inicializarFormulario(): void {
    this.despesaForm = this.formBuilder.group({
      conta: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      data: [this.despesaService.getCurrentDate(), Validators.required]
    });
  }

  /**
   * Adiciona a despesa
   */
  adicionarDespesa(): void {
    if (this.despesaForm.invalid) {
      this.despesaForm.markAllAsTouched();
      return;
    }

    const formValue = this.despesaForm.value;

    const despesaData = {
      value: parseFloat(formValue.valor),
      description: formValue.descricao,
      payDate: formValue.data,
      accounts: {
        uuid: formValue.conta
      },
      category: {
        uuid: formValue.categoria
      }
    };

    this.loading = true;

    this.despesaService.createDespesa(despesaData).subscribe({
      next: (response) => {
        this.toastr.success('Despesa adicionada com sucesso!');
        this.despesaAdicionada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao adicionar despesa:', error);
        const mensagemErro = error?.error?.message || 'Erro ao adicionar despesa. Tente novamente.';
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
