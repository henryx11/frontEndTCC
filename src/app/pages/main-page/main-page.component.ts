import { Component, OnInit } from '@angular/core';
// @ts-ignore
import { ContasService } from 'src/app/services/contas.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  saldoTotal: number = 0;

  constructor(private contasService: ContasService) {}

  ngOnInit(): void {
    this.contasService.getSaldoTotalDoUsuario().subscribe({
      next: (saldo: number): void => {
        this.saldoTotal = saldo;
      },
      error: (err: unknown): void => {
        console.error('Erro ao buscar saldo total:', err);
      }
    });
  }
}
