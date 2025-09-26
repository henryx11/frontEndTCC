import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

interface CartaoData {
  descricao: string;
  dataVencimento: string;
  dataFechamento: string;
  bandeira: string;
  limite: number;
}

@Component({
  selector: 'app-create-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-card.component.html',
  styleUrl: './create-card.component.scss'
})
export class CreateCardComponent {

  // Dados do formulário
  cartaoData: CartaoData = {
    descricao: '',
    dataVencimento: '',
    dataFechamento: '',
    bandeira: '',
    limite: 0
  };

  mostrarErroData: boolean = false;

  constructor(private router: Router) {}

  criarCartao(form: NgForm): void {
    if (form.valid && this.validarDatas()) {
      const dadosParaEnvio = {
        ...this.cartaoData,
        dataVencimento: this.cartaoData.dataVencimento,
        dataFechamento: this.cartaoData.dataFechamento
      };

      console.log('Dados do cartão (formato brasileiro):', dadosParaEnvio);

      // Aqui você faria a chamada para o backend
      // this.cartaoService.criarCartao(dadosParaEnvio).subscribe(
      //   response => {
      //     console.log('Cartão criado com sucesso:', response);
      //     this.router.navigate(['/credit-card']);
      //   },
      //   error => {
      //     console.error('Erro ao criar cartão:', error);
      //   }
      // );

      // Por enquanto, apenas simula o sucesso
      alert(`Cartão "${this.cartaoData.descricao}" criado com sucesso!\n\nDados:\n- Vencimento: ${dadosParaEnvio.dataVencimento}\n- Fechamento: ${dadosParaEnvio.dataFechamento}`);
      this.router.navigate(['/credit-card']);
    } else {
      if (!this.validarDatas()) {
        alert('Erro: A data de fechamento deve ser anterior à data de vencimento.');
        return;
      }
      alert('Por favor, preencha todos os campos obrigatórios.');
      this.markFormGroupTouched(form);
    }
  }


  /*** editar cartão (placeholder)*/
  editarCartao(): void {
    console.log('Função editar cartão chamada');
    alert('Funcionalidade de edição será implementada em breve!');

    // Aqui você poderia implementar a lógica de edição
    // Por exemplo, carregar dados de um cartão existente para edição
  }

  cancelar(): void {
    const confirmacao = confirm('Tem certeza que deseja cancelar? Os dados não serão salvos.');

    if (confirmacao) {
      this.router.navigate(['/credit-card']);
    }
  }

  /**
   * Marca todos os campos como touched para mostrar erros de validação
   */
  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }

  /**
   * Formata o valor do limite enquanto o usuário digita
   */
  onLimiteChange(event: any): void {
    let value = event.target.value;

    // Remove caracteres não numéricos exceto ponto e vírgula
    value = value.replace(/[^\d.,]/g, '');

    // Converte vírgula para ponto para o formato numérico
    value = value.replace(',', '.');

    this.cartaoData.limite = parseFloat(value) || 0;
  }

  /**
   * Chamado quando qualquer data é alterada
   */
  onDataChange(): void {
    // Pequeno delay para garantir que o ngModel foi atualizado
    setTimeout(() => {
      this.validarDatas();
    }, 100);
  }

  /**
   * Valida as datas para garantir que fazem sentido
   */
  validarDatas(): boolean {
    // Se as duas datas estão preenchidas, valida
    if (this.cartaoData.dataVencimento && this.cartaoData.dataFechamento) {
      const dataVenc = new Date(this.cartaoData.dataVencimento);
      const dataFech = new Date(this.cartaoData.dataFechamento);

      // Data de fechamento deve ser antes da data de vencimento
      const datasValidas = dataFech < dataVenc;

      // Atualiza o controle de exibição do erro
      this.mostrarErroData = !datasValidas;

      return datasValidas;
    }

    // Se não tem as duas datas, não mostra erro
    this.mostrarErroData = false;
    return true;
  }

  /**
   * Formatar bandeira para exibição
   */
  formatarBandeira(bandeira: string): string {
    const bandeiras: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'elo': 'Elo',
      'american': 'American Express',
      'hipercard': 'Hipercard'
    };

    return bandeiras[bandeira] || bandeira;
  }
}
