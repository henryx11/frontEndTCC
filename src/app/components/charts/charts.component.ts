import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ChartsDataService, CategoryExpenseData, TimeSeriesData } from '../../services/charts-data.service';
import { ToastrService } from 'ngx-toastr';
import { TransactionEventsService } from '../../services/transaction-events.service';
import { Subscription } from 'rxjs';

// Registra todos os componentes do Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;

  // Instâncias dos gráficos (public para uso no template)
  pieChart?: Chart;
  lineChart?: Chart;
  barChart?: Chart;

  // Estados de carregamento
  loading = true;
  loadingPie = true;
  loadingLine = true;
  loadingBar = true;

  // Dados processados
  despesasPorCategoria: CategoryExpenseData[] = [];
  evolucaoTemporal?: TimeSeriesData;
  semDados = false;
  private transactionSubscription?: Subscription;

  constructor(
    private chartsDataService: ChartsDataService,
    private toastr: ToastrService,
    private transactionEvents: TransactionEventsService
  ) {}

  ngOnInit(): void {
    console.log('📊 Inicializando componente de gráficos...');

    // Escuta eventos de mudanças em transações
    this.transactionSubscription = this.transactionEvents.onTransactionChanged.subscribe(event => {
      console.log('🔔 Evento recebido no ChartsComponent:', event.type);
      console.log('🔄 Atualizando gráficos automaticamente...');

      // Aguarda um pouco para garantir que o backend processou
      setTimeout(() => {
        this.atualizarGraficos();
      }, 500);
    });
  }

  ngAfterViewInit(): void {
    console.log('🎨 ngAfterViewInit chamado');
    // Aguarda 500ms para garantir que os canvas estão prontos
    setTimeout(() => {
      console.log('🚀 Iniciando carregamento de dados...');
      this.carregarDados();
    }, 500);
  }

  /**
   * Carrega todos os dados necessários para os gráficos
   */
  carregarDados(): void {
    console.log('🔄 Carregando dados dos gráficos...');
    this.loading = true;

    // Carrega despesas por categoria (para gráfico de pizza e barras)
    this.chartsDataService.getDespesasPorCategoria().subscribe({
      next: (data) => {
        console.log('✅ Despesas por categoria carregadas:', data);
        this.despesasPorCategoria = data;

        if (data.length === 0) {
          console.log('⚠️ Sem dados de despesas');
          this.loadingPie = false;
          this.loadingBar = false;

          // ✅ NOVO: Destrói os gráficos de despesas se não há mais dados
          if (this.pieChart) {
            this.pieChart.destroy();
            this.pieChart = undefined;
            console.log('🗑️ Gráfico de pizza destruído - sem despesas');
          }
          if (this.barChart) {
            this.barChart.destroy();
            this.barChart = undefined;
            console.log('🗑️ Gráfico de barras destruído - sem despesas');
          }
        } else {
          console.log('🎨 Criando gráficos de pizza e barras...');
          // Aguarda um pouco mais para garantir que o DOM está pronto
          setTimeout(() => {
            this.criarGraficoPizza();
            this.criarGraficoBarras();
          }, 100);
        }

        // ✅ Verifica se deve atualizar o estado geral
        this.verificarEstadoGeral();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar despesas por categoria:', error);
        this.toastr.error('Erro ao carregar dados de despesas');
        this.loadingPie = false;
        this.loadingBar = false;
        this.verificarEstadoGeral();
      }
    });

    // Carrega evolução temporal
    this.chartsDataService.getEvolucaoTemporal(6).subscribe({
      next: (data) => {
        console.log('✅ Evolução temporal carregada:', data);
        this.evolucaoTemporal = data;

        // ✅ FIX: Verifica se há dados válidos (pelo menos uma receita ou despesa)
        const temDados = data.receitas.some(v => v > 0) || data.despesas.some(v => v > 0);

        if (!temDados) {
          console.log('⚠️ Sem dados de receitas/despesas para evolução temporal');
          this.loadingLine = false;

          // ✅ NOVO: Destrói o gráfico de linha se não há dados
          if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = undefined;
            console.log('🗑️ Gráfico de linha destruído - sem dados temporais');
          }
        } else {
          console.log('🎨 Criando gráfico de linha...');
          // Aguarda um pouco mais para garantir que o DOM está pronto
          setTimeout(() => {
            this.criarGraficoLinha();
          }, 100);
        }

        // ✅ Verifica se deve atualizar o estado geral
        this.verificarEstadoGeral();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar evolução temporal:', error);
        this.toastr.error('Erro ao carregar evolução temporal');
        this.loadingLine = false;
        this.verificarEstadoGeral();
      }
    });
  }

  /**
   * Cria o gráfico de pizza (despesas por categoria)
   */
  criarGraficoPizza(): void {
    console.log('🍕 Tentando criar gráfico de pizza...');
    console.log('   pieChartRef existe?', !!this.pieChartRef);
    console.log('   Dados disponíveis?', this.despesasPorCategoria.length);

    if (!this.pieChartRef) {
      console.error('❌ pieChartRef não está disponível!');
      this.loadingPie = false;
      return;
    }

    if (this.despesasPorCategoria.length === 0) {
      console.log('⚠️ Sem dados para gráfico de pizza');
      this.loadingPie = false;
      return;
    }

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Não conseguiu obter contexto 2D do canvas');
      this.loadingPie = false;
      return;
    }

    console.log('✅ Contexto 2D obtido, criando gráfico...');

    // Destrói gráfico anterior se existir
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: this.despesasPorCategoria.map(d => d.category),
        datasets: [{
          data: this.despesasPorCategoria.map(d => d.value),
          backgroundColor: this.despesasPorCategoria.map(d => d.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.despesasPorCategoria.reduce((sum, d) => sum + d.value, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            }
          }
        }
      }
    };

    try {
      this.pieChart = new Chart(ctx, config);
      this.loadingPie = false;
      console.log('✅ Gráfico de pizza criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar gráfico de pizza:', error);
      this.loadingPie = false;
    }
  }

  /**
   * Cria o gráfico de linha (evolução temporal)
   */
  criarGraficoLinha(): void {
    console.log('📈 Tentando criar gráfico de linha...');
    console.log('   lineChartRef existe?', !!this.lineChartRef);
    console.log('   Dados disponíveis?', !!this.evolucaoTemporal);

    if (!this.lineChartRef) {
      console.error('❌ lineChartRef não está disponível!');
      this.loadingLine = false;
      return;
    }

    if (!this.evolucaoTemporal) {
      console.log('⚠️ Sem dados para gráfico de linha');
      this.loadingLine = false;
      return;
    }

    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Não conseguiu obter contexto 2D do canvas');
      this.loadingLine = false;
      return;
    }

    console.log('✅ Contexto 2D obtido, criando gráfico...');

    // Destrói gráfico anterior se existir
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.evolucaoTemporal.labels,
        datasets: [
          {
            label: 'Receitas',
            data: this.evolucaoTemporal.receitas,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            label: 'Despesas',
            data: this.evolucaoTemporal.despesas,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#f97316',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 13,
                family: "'Inter', sans-serif",
                weight: 600
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: R$ ${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`,
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    try {
      this.lineChart = new Chart(ctx, config);
      this.loadingLine = false;
      console.log('✅ Gráfico de linha criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar gráfico de linha:', error);
      this.loadingLine = false;
    }
  }

  /**
   * Cria o gráfico de barras (top categorias)
   */
  criarGraficoBarras(): void {
    console.log('📊 Tentando criar gráfico de barras...');
    console.log('   barChartRef existe?', !!this.barChartRef);
    console.log('   Dados disponíveis?', this.despesasPorCategoria.length);

    if (!this.barChartRef) {
      console.error('❌ barChartRef não está disponível!');
      this.loadingBar = false;
      return;
    }

    if (this.despesasPorCategoria.length === 0) {
      console.log('⚠️ Sem dados para gráfico de barras');
      this.loadingBar = false;
      return;
    }

    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('❌ Não conseguiu obter contexto 2D do canvas');
      this.loadingBar = false;
      return;
    }

    console.log('✅ Contexto 2D obtido, criando gráfico...');

    // Destrói gráfico anterior se existir
    if (this.barChart) {
      this.barChart.destroy();
    }

    // Pega apenas top 5 categorias
    const top5 = this.despesasPorCategoria.slice(0, 5);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: top5.map(d => d.category),
        datasets: [{
          label: 'Despesas',
          data: top5.map(d => d.value),
          backgroundColor: top5.map(d => d.color),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y', // Barras horizontais
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const value = context.parsed.x || 0;
                const total = top5.reduce((sum, d) => sum + d.value, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `R$ ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`,
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              font: {
                size: 12
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    try {
      this.barChart = new Chart(ctx, config);
      this.loadingBar = false;
      console.log('✅ Gráfico de barras criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar gráfico de barras:', error);
      this.loadingBar = false;
    }
  }

  /**
   * Verifica o estado geral de carregamento e dados
   * Atualiza as flags 'loading' e 'semDados'
   */
  /**
   * Verifica o estado geral de carregamento e dados
   * Atualiza as flags 'loading' e 'semDados'
   */
  private verificarEstadoGeral(): void {
    // Se todos os loadings individuais terminaram
    const todosCarregados = !this.loadingPie && !this.loadingLine && !this.loadingBar;

    if (todosCarregados) {
      this.loading = false;

      // Verifica se não há nenhum dado em nenhum gráfico
      const temDespesas = this.despesasPorCategoria.length > 0;
      const temEvolucao = this.evolucaoTemporal &&
        (this.evolucaoTemporal.receitas.some(v => v > 0) ||
          this.evolucaoTemporal.despesas.some(v => v > 0));

      this.semDados = !temDespesas && !temEvolucao;

      // ✅ NOVO: Se não tem dados, destrói os gráficos existentes
      if (this.semDados) {
        if (this.pieChart) {
          this.pieChart.destroy();
          this.pieChart = undefined;
        }
        if (this.lineChart) {
          this.lineChart.destroy();
          this.lineChart = undefined;
        }
        if (this.barChart) {
          this.barChart.destroy();
          this.barChart = undefined;
        }
        console.log('🗑️ Gráficos destruídos - não há dados');
      }

      console.log('📊 Estado geral atualizado:', {
        loading: this.loading,
        semDados: this.semDados,
        temDespesas,
        temEvolucao
      });
    }
  }

  /**
   * Atualiza todos os gráficos (útil para refresh)
   */
  atualizarGraficos(): void {
    console.log('🔄 Atualizando todos os gráficos...');
    this.loading = true;
    this.loadingPie = true;
    this.loadingLine = true;
    this.loadingBar = true;
    this.semDados = false; // ✅ Reset do estado semDados
    this.carregarDados();
  }

  ngOnDestroy(): void {
    console.log('🧹 Limpando recursos do ChartsComponent...');

    // Cancela a inscrição nos eventos
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
      console.log('✅ Subscription cancelada');
    }

    // Limpa os gráficos ao destruir o componente
    if (this.pieChart) this.pieChart.destroy();
    if (this.lineChart) this.lineChart.destroy();
    if (this.barChart) this.barChart.destroy();
  }
}
