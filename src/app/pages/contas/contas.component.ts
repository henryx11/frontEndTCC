import { Component, OnInit } from '@angular/core';
import { ContasService } from '../../services/contas.service';
import {DecimalPipe, TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-contas',
  templateUrl: './contas.component.html',
  imports: [
    DecimalPipe,
    TitleCasePipe
  ],
  styleUrls: ['./contas.component.scss']
})
export class ContasComponent implements OnInit {
  contas: any[] = [];

  constructor(private contasService: ContasService) {}

  ngOnInit(): void {
    this.contasService.getContasDoUsuario().subscribe({
      next: (data: any) => {
        this.contas = data;
      },

      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
