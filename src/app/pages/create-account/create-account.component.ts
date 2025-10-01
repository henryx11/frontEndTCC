import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Bank } from '../../types/bank.type';
import { AccountType } from '../../types/account-type.type';

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

  // Dados fixos enquanto backend não tem endpoints de listagem
  banks: Bank[] = [
    { uuid: '745b93d3-021b-470b-abe5-8b704a7ca112', name: 'Itaú' },
    { uuid: '21bf2e8e-77b7-4faa-a515-c805269f2c1c', name: 'Nubank' },
    { uuid: 'cc262119-d1fa-4656-b920-a63a500d3871', name: 'Santander' }
  ];

  accountTypes: AccountType[] = [
    { uuid: '24eb36ef-4b85-4471-8a28-f122f2a5d902', name: 'Corrente' },
    { uuid: '260747d0-6aa2-4670-b0d8-e18911d8d043', name: 'Poupança' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) {
    this.accountForm = this.formBuilder.group({
      accountName: ['', Validators.required],
      currentBalance: ['', Validators.required],
      bank: ['', Validators.required],
      accountType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Nada a carregar, dados já estão fixos
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
          alert('Conta criada com sucesso!');
          this.router.navigate(['/main-page']);
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          alert('Erro ao criar conta. Tente novamente.');
          this.isLoading = false;
        }
      });
    }
  }
}
