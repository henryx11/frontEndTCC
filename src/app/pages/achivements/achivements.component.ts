import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementsService, Achievement } from '../../services/achievements.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-achivements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achivements.component.html',
  styleUrl: './achivements.component.scss'
})
export class AchivementsComponent implements OnInit {
  achievements: Achievement[] = [];
  topShelfAchievements: Achievement[] = [];
  bottomShelfAchievements: Achievement[] = [];
  isLoading = true;

  constructor(
    private achievementsService: AchievementsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAchievements();
  }

  loadAchievements(): void {
    this.isLoading = true;
    this.achievementsService.getAchievements().subscribe({
      next: (data) => {
        this.achievements = data;
        this.distributeAchievements();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar conquistas:', error);
        this.toastr.error('Erro ao carregar as conquistas', 'Erro');
        this.isLoading = false;
      }
    });
  }

  distributeAchievements(): void {
    // Primeiros 5 vão para a prateleira de cima
    this.topShelfAchievements = this.achievements.slice(0, 5);
    // Próximos 5 vão para a prateleira de baixo
    this.bottomShelfAchievements = this.achievements.slice(5, 10);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}
