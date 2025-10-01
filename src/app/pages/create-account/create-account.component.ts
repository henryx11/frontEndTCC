import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { BankService } from '../../services/bank.service';
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
  banks: Bank[] = [];
  accountTypes: AccountType[] = [];
  isLoading = false;
  isLoadingData = true;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private bankService: BankService,
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
    this.loadBanksAndTypes();
  }

  loadBanksAndTypes(): void {
    this.isLoadingData = true;

    // Buscar bancos do backend
    this.bankService.getAllBanks().subscribe({
      next: (banks) => {
        this.banks = banks;
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Erro ao carregar bancos:', error);
        this.isLoadingData = false;
      }
    });

    // Buscar tipos de conta do backend
    this.bankService.getAllAccountTypes().subscribe({
      next: (types) => {
        this.accountTypes = types;
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de conta:', error);
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
