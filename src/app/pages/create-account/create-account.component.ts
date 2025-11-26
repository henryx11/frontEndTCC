import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Bank } from '../../types/bank.type';
import { AccountType } from '../../types/account-type.type';
import { ToastrService } from 'ngx-toastr'; // ✅ Adicione se quiser toasts

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  accountForm: FormGroup;
  isLoading = false;
  isLoadingTypes = false; // ✅ NOVO: Loading para tipos de conta

  banks: Bank[] = [
    { uuid: '21bf2e8e-77b7-4faa-a515-c805269f2c1c', name: 'Nubank' },
    { uuid: '745b93d3-021b-470b-abe5-8b704a7ca112', name: 'Itau' },
    { uuid: 'cc262119-d1fa-4656-b920-a63a500d3871', name: 'Santander' }
  ];

  accountTypes: AccountType[] = []; // ✅ MODIFICADO: Começa vazio

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService // ✅ Adicione se quiser usar toasts
  ) {
    this.accountForm = this.formBuilder.group({
      accountName: ['', [Validators.required, Validators.minLength(2)]],
      currentBalance: ['', [Validators.required, Validators.min(0)]],
      bank: ['', Validators.required],
      accountType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccountTypes(); // ✅ NOVO: Carrega tipos ao iniciar
  }

  loadAccountTypes(): void {
    this.isLoadingTypes = true;

    console.log('🔄 Buscando tipos de conta...'); // ✅ ADICIONE

    this.accountService.getAccountTypes().subscribe({
      next: (types: AccountType[]) => {
        console.log('📦 Resposta do backend:', types); // ✅ ADICIONE
        this.accountTypes = types;
        this.isLoadingTypes = false;
        console.log('✅ Tipos de conta carregados:', types);
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar tipos de conta:', error);
        console.log('📄 Detalhes do erro:', error.error); // ✅ ADICIONE
        this.toastr.error('Erro ao carregar tipos de conta');
        this.isLoadingTypes = false;

        // Fallback
        this.accountTypes = [
          { uuid: '24eb36ef-4b85-4471-8a28-f122f2a5d902', name: 'Conta Corrente' },
          { uuid: '260747d0-6aa2-4670-b0d8-e18911d8d043', name: 'Poupança' }
        ];
      }
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid && !this.isLoading) {
      this.isLoading = true;

      const accountData = {
        name: this.accountForm.value.accountName,
        balance: parseFloat(this.accountForm.value.currentBalance),
        bankId: this.accountForm.value.bank,
        typeId: this.accountForm.value.accountType
      };

      this.accountService.createAccount(accountData).subscribe({
        next: (response) => {
          console.log('Conta criada com sucesso:', response);
          this.toastr.success('Conta criada com sucesso!'); // ou alert
          this.router.navigate(['/main-page']);
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          this.toastr.error('Erro ao criar conta. Tente novamente.'); // ou alert
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    const confirmacao = confirm('Tem certeza que deseja cancelar? Os dados não serão salvos.');

    if (confirmacao) {
      this.router.navigate(['/main-page']);
    }
  }
}
