import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {
  accountForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.accountForm = this.formBuilder.group({
      accountName: ['', Validators.required],
      currentBalance: ['', Validators.required],
      bank: ['', Validators.required],
      accountType: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log('Formulário enviado:', this.accountForm.value);
  }
}
