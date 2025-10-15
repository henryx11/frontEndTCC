import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../types/category.type';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-item-creditcard-bill',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-item-creditcard-bill.component.html',
  styleUrls: ['./add-item-creditcard-bill.component.scss']
})
export class AddItemCreditcardBillComponent implements OnInit {
  itemForm!: FormGroup;
  loading: boolean = false;
  loadingCategorias: boolean = false;
  categorias: Category[] = [];

  // Dados da fatura e cartão vindos da rota
  faturaUuid: string = '';
  cartaoUuid: string = '';
  mesAnoFatura: string = '';
  nomeCartao: string = '';

  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    // Recebe dados da navegação
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state) {
      this.faturaUuid = state['faturaUuid'] || '';
      this.cartaoUuid = state['cartaoUuid'] || '';
      this.mesAnoFatura = state['mesAnoFatura'] || '';
      this.nomeCartao = state['nomeCartao'] || '';
    }

    // Se não tiver os dados, tenta pegar dos parâmetros da rota
    this.route.queryParams.subscribe(params => {
      if (params['faturaUuid']) this.faturaUuid = params['faturaUuid'];
      if (params['cartaoUuid']) this.cartaoUuid = params['cartaoUuid'];
      if (params['mesAnoFatura']) this.mesAnoFatura = params['mesAnoFatura'];
      if (params['nomeCartao']) this.nomeCartao = params['nomeCartao'];
    });

    this.inicializarFormulario();
    this.carregarCategorias();
  }

  /**
   * Inicializa o formulário
   */
  inicializarFormulario(): void {
    const dataAtual = new Date().toISOString().split('T')[0];

    this.itemForm = this.formBuilder.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      dataRegistro: [dataAtual, Validators.required],
      categoria: ['', Validators.required],
      parcelado: [false],
      numeroParcelas: [{ value: '', disabled: true }]
    });
  }

  /**
   * Carrega as categorias de despesa
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
   * Evento ao mudar checkbox de parcelado
   */
  onParceladoChange(): void {
    const parcelado = this.itemForm.get('parcelado')?.value;
    const numeroParcelas = this.itemForm.get('numeroParcelas');

    if (parcelado) {
      numeroParcelas?.enable();
      numeroParcelas?.setValidators([Validators.required, Validators.min(2), Validators.max(24)]);
    } else {
      numeroParcelas?.disable();
      numeroParcelas?.clearValidators();
      numeroParcelas?.setValue('');
    }

    numeroParcelas?.updateValueAndValidity();
  }

  /**
   * Calcula o valor de cada parcela
   */
  calcularValorParcela(): string {
    const valor = this.itemForm.get('valor')?.value;
    const numeroParcelas = this.itemForm.get('numeroParcelas')?.value;

    if (valor && numeroParcelas && numeroParcelas > 0) {
      const valorParcela = valor / numeroParcelas;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valorParcela);
    }

    return 'R$ 0,00';
  }

  /**
   * Adiciona o item na fatura
   */
  adicionarItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (!this.faturaUuid || !this.cartaoUuid) {
      this.toastr.error('Dados da fatura não encontrados');
      return;
    }

    this.loading = true;

    const parcelado = this.itemForm.get('parcelado')?.value;

    const payload: any = {
      value: parseFloat(this.itemForm.value.valor),
      description: this.itemForm.value.descricao,
      registrationDate: this.itemForm.value.dataRegistro,
      creditCard: {
        uuid: this.cartaoUuid
      },
      bill: {
        uuid: this.faturaUuid
      },
      category: {
        uuid: this.itemForm.value.categoria
      }
    };

    // Adiciona campos de parcelamento se aplicável
    if (parcelado) {
      payload.installments = 'sim';
      payload.numberinstallments = parseInt(this.itemForm.value.numeroParcelas);
    }

    this.httpClient.post(`${this.apiUrl}/creditCardBill/create`, payload).subscribe({
      next: (response) => {
        this.toastr.success('Item adicionado com sucesso!');
        this.router.navigate(['/credit-card']);
      },
      error: (error) => {
        console.error('Erro ao adicionar item:', error);
        const mensagemErro = error?.error?.message || 'Erro ao adicionar item. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Volta para a página anterior
   */
  voltar(): void {
    this.router.navigate(['/credit-card']);
  }
}
